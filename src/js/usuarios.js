(() => {
    const { elemento, aviso, fallo, errores, limpiar, editar, estadoListado } = SGC.UI;
    const formulario = document.getElementById('usuario-form');
    if (!formulario) {
        function listar() {
            try {
                const registros = SGC.Datos.leer('usuarios');
                const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
                const filtrados = registros.filter(u => SGC.Datos.normalizar(
                    [u.nombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(' ')
                ).includes(texto));
                const cuerpo = document.getElementById('registros');
                cuerpo.replaceChildren();
                filtrados.forEach(usuario => {
                    const fila = elemento('tr');
                    const celda = elemento('td');
                    const identidad = elemento('div', 'tabla__identidad');
                    const iniciales = (usuario.nombre[0] || '') + (usuario.primerApellido?.[0] || '');
                    if (/^data:image\/(png|jpeg|webp);base64,/.test(usuario.imagen || '')) {
                        const foto = elemento('img', 'tabla__avatar');
                        foto.src = usuario.imagen;
                        foto.alt = '';
                        identidad.append(foto);
                    } else identidad.append(elemento('span', 'tabla__avatar', iniciales.toUpperCase()));
                    const detalle = elemento('div');
                    detalle.append(elemento('p', 'tabla__nombre',
                        [usuario.nombre, usuario.primerApellido, usuario.segundoApellido].filter(Boolean).join(' ')),
                    elemento('p', 'tabla__secundario', usuario.correo));
                    identidad.append(detalle);
                    celda.append(identidad);
                    const rol = elemento('td');
                    const roles = { administrador: 'Administrador', desarrollo: 'Desarrollo Curricular',
                        director: 'Director de escuela', rectoria: 'Rectoría', vicerrectoria: 'Vicerrectoría' };
                    rol.append(elemento('span', 'insignia', roles[usuario.rol] || usuario.rol));
                    const accion = elemento('td');
                    if (usuario.id) accion.append(editar('usuario-formulario.html', usuario.id));
                    else accion.textContent = 'Sin identificador';
                    fila.append(celda, rol, accion);
                    cuerpo.append(fila);
                });
                estadoListado(registros.length, filtrados.length, 'usuarios');
            } catch (error) { fallo(error); }
        }
        document.getElementById('buscar').addEventListener('input', listar);
        window.addEventListener('storage', listar);
        listar();
        return;
    }

    const control = nombre => formulario.elements.namedItem(nombre);
    const guardar = document.getElementById('guardar');
    const id = new URLSearchParams(location.search).get('id');
    const nombres = ['nombre', 'primerApellido', 'segundoApellido', 'identificacion', 'nacimiento',
        'sexo', 'correo', 'correoPersonal', 'telefono', 'rol'];
    let actual = null;
    let imagen = '';
    let imagenError = '';
    let imagenPendiente = false;
    let seleccion = 0;
    let guardado = false;
    const hoy = new Date();
    control('nacimiento').max = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'),
        String(hoy.getDate()).padStart(2, '0')].join('-');

    function mostrarEdad() {
        const edad = SGC.Validacion.edad(control('nacimiento').value);
        document.getElementById('edad').value = edad === '' ? 'Desde el nacimiento' : edad + ' años';
    }
    function mostrarImagen() {
        const foto = document.getElementById('perfil-imagen');
        foto.hidden = !imagen;
        if (imagen) foto.src = imagen;
        else foto.removeAttribute('src');
        document.getElementById('perfil-silueta').hidden = Boolean(imagen);
    }
    control('nacimiento').addEventListener('input', mostrarEdad);
    formulario.addEventListener('input', () => {
        if (guardado) { document.getElementById('aviso').hidden = true; guardado = false; }
    });

    function ajustarContrasena() {
        const tieneContrasena = typeof actual.contrasena === 'string' && actual.contrasena.length > 0;
        control('clave').required = !tieneContrasena;
        document.querySelector('label[for="clave"]').textContent = tieneContrasena ? 'Contraseña' : 'Contraseña *';
        document.getElementById('clave-ayuda').textContent = tieneContrasena
            ? 'Deje este campo vacío para conservar la contraseña actual. Si la cambia, use de 8 a 15 caracteres con mayúscula, minúscula y número.'
            : 'Ingrese una contraseña para guardar los cambios: de 8 a 15 caracteres con mayúscula, minúscula y número.';
    }

    try {
        const registros = SGC.Datos.leer('usuarios');
        if (id) {
            actual = registros.find(u => u.id === id);
            if (!actual) throw new Error('No se encontró el usuario solicitado. Vuelva al listado.');
            nombres.forEach(nombre => { control(nombre).value = actual[nombre] || ''; });
            if (actual.rol !== 'administrador') {
                const opcion = elemento('option', '', actual.rol + ' (registro anterior)');
                opcion.value = actual.rol;
                control('rol').append(opcion);
                control('rol').value = actual.rol;
            }
            imagen = /^data:image\/(png|jpeg|webp);base64,/.test(actual.imagen || '') ? actual.imagen : '';
            document.title = 'Modificar usuario | SGC';
            document.getElementById('titulo').textContent = 'Modificar usuario';
            document.getElementById('ruta').textContent = 'Usuarios / Modificación';
            guardar.textContent = 'Guardar cambios';
            ajustarContrasena();
        }
        mostrarEdad();
        mostrarImagen();
    } catch (error) { fallo(error); guardar.disabled = true; }

    function cargarImagen(archivo) {
        return new Promise((resolver, rechazar) => {
            const lector = new FileReader();
            lector.onerror = () => rechazar(new Error('No se pudo leer la imagen.'));
            lector.onload = () => {
                const foto = new Image();
                foto.onerror = () => rechazar(new Error('Seleccione un archivo de imagen válido.'));
                foto.onload = () => {
                    try {
                        const escala = Math.min(1, 192 / foto.width, 192 / foto.height);
                        const lienzo = document.createElement('canvas');
                        lienzo.width = Math.max(1, Math.round(foto.width * escala));
                        lienzo.height = Math.max(1, Math.round(foto.height * escala));
                        lienzo.getContext('2d').drawImage(foto, 0, 0, lienzo.width, lienzo.height);
                        resolver(lienzo.toDataURL('image/webp', 0.85));
                    } catch { rechazar(new Error('No se pudo preparar la imagen.')); }
                };
                foto.src = lector.result;
            };
            lector.readAsDataURL(archivo);
        });
    }
    control('imagen').addEventListener('change', async () => {
        const turno = ++seleccion;
        const archivo = control('imagen').files[0];
        imagenError = '';
        imagenPendiente = false;
        if (!archivo) { imagen = actual?.imagen || ''; mostrarImagen(); return; }
        if (!archivo.type.startsWith('image/')) imagenError = 'Seleccione un archivo de imagen válido.';
        else if (archivo.size > 2 * 1024 * 1024) imagenError = 'La imagen debe pesar como máximo 2 MB.';
        if (imagenError) { errores(formulario, { imagen: imagenError }); return; }
        imagenPendiente = true;
        try {
            const resultado = await cargarImagen(archivo);
            if (turno !== seleccion) return;
            imagen = resultado;
            mostrarImagen();
            document.getElementById('imagen-mensaje').textContent = '';
            control('imagen').classList.remove('error');
            control('imagen').removeAttribute('aria-invalid');
        } catch (error) {
            if (turno === seleccion) { imagenError = error.message; errores(formulario, { imagen: imagenError }); }
        } finally { if (turno === seleccion) imagenPendiente = false; }
    });

    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        if (guardar.disabled) return;
        const textoBoton = actual ? 'Guardar cambios' : 'Guardar usuario';
        try {
            const entrada = Object.fromEntries(nombres.map(nombre => [nombre, control(nombre).value.trim()]));
            if (actual) entrada.id = actual.id;
            const clave = control('clave').value;
            const campos = SGC.Validacion.usuario(entrada, SGC.Datos.leer('usuarios'), clave);
            if (actual && !actual.contrasena && !clave) campos.clave = 'Ingrese una contraseña para guardar los cambios.';
            if (imagenError) campos.imagen = imagenError;
            if (imagenPendiente) campos.imagen = 'Espere a que termine de cargar la imagen.';
            if (!errores(formulario, campos)) return;
            guardar.disabled = true;
            guardar.textContent = 'Guardando…';
            entrada.contrasena = clave || actual.contrasena;
            entrada.imagen = imagen;
            // Conserva el estado de las cuentas creadas con la versión anterior.
            entrada.estado = actual?.estado || 'activo';
            const registro = await SGC.Datos.guardar('usuarios', entrada);
            if (actual) {
                actual = registro;
                ajustarContrasena();
            }
            else {
                formulario.reset();
                imagen = '';
                imagenError = '';
                mostrarImagen();
                mostrarEdad();
                SGC.UI.abrirPestana('panel-1');
            }
            control('clave').value = '';
            limpiar(formulario);
            aviso('El usuario se guardó correctamente. Puede consultarlo en el listado.', 'confirmacion');
            guardado = true;
        } catch (error) { fallo(error); }
        finally { guardar.disabled = false; guardar.textContent = textoBoton; }
    });
})();
