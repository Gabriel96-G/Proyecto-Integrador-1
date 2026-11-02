(() => {
    const { elemento, aviso, fallo, errores, limpiar, editar, estadoListado } = SGC.UI;
    const formulario = document.getElementById('usuario-form');
    if (!formulario) {
        const buscar = document.getElementById('buscar');

        function listar() {
            const tabla = document.getElementById('tabla-usuarios');
            tabla.hidden = true;
            document.getElementById('registros').replaceChildren();
            document.getElementById('vacio').hidden = true;
            try {
                const registros = SGC.Datos.leer('usuarios');
                const texto = SGC.Datos.normalizar(buscar.value);
                const identificacion = SGC.Datos.normalizar(document.getElementById('filtro-identificacion').value);
                const correo = SGC.Datos.normalizar(document.getElementById('filtro-correo').value);
                const rol = document.getElementById('filtro-rol').value;
                const estado = document.getElementById('filtro-estado').value;
                const filtrados = registros.filter(usuario => {
                    const nombre = [usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
                        .filter(Boolean).join(' ');
                    return SGC.Datos.normalizar(nombre).includes(texto) &&
                        SGC.Datos.normalizar(usuario.identificacion).includes(identificacion) &&
                        SGC.Datos.normalizar(usuario.correo).includes(correo) &&
                        (!rol || usuario.rol === rol) &&
                        (!estado || (usuario.estado || 'activo') === estado);
                });
                const cuerpo = document.getElementById('registros');
                cuerpo.replaceChildren();
                filtrados.forEach(usuario => {
                    const fila = elemento('tr');
                    const celda = elemento('td');
                    celda.className = 'tabla__nombre';
                    celda.textContent = [usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
                        .filter(Boolean).join(' ');
                    const rol = elemento('td');
                    const roles = { administrador: 'Administrador', desarrollo: 'Desarrollo Curricular',
                        director: 'Director de escuela', rectoria: 'Rectoría', vicerrectoria: 'Vicerrectoría' };
                    if (roles[usuario.rol]) SGC.Idioma.texto(rol, roles[usuario.rol]);
                    else rol.textContent = usuario.rol;
                    const estado = (usuario.estado || 'activo') === 'activo' ? 'Activo' : 'Inactivo';
                    const accion = elemento('td');
                    if (usuario.id) accion.append(editar('usuario-formulario.html', usuario.id));
                    else SGC.Idioma.texto(accion, 'Sin identificador');
                    fila.append(elemento('td', '', usuario.identificacion || '—'), celda,
                        elemento('td', '', usuario.correo), rol, elemento('td', '', estado, true), accion);
                    cuerpo.append(fila);
                });
                estadoListado(registros.length, filtrados.length, 'usuarios');
                tabla.hidden = filtrados.length === 0;
                document.getElementById('aviso').hidden = true;
            } catch (error) { fallo(error); }
        }
        const controles = ['buscar', 'filtro-identificacion', 'filtro-correo', 'filtro-rol', 'filtro-estado']
            .map(id => document.getElementById(id));
        controles.forEach(control => control.addEventListener('input', listar));
        window.addEventListener('storage', listar);
        window.addEventListener('pageshow', listar);
        listar();
        return;
    }

    const control = nombre => formulario.elements.namedItem(nombre);
    const guardar = document.getElementById('guardar');
    const parametros = new URLSearchParams(location.search);
    const modificando = parametros.has('id');
    const id = parametros.get('id');
    const nombres = ['nombre', 'primerApellido', 'segundoApellido', 'identificacion', 'nacimiento',
        'sexo', 'correo', 'correoPersonal', 'telefono', 'rol'];
    let actual = null;
    let imagen = '';
    let imagenError = '';
    let imagenPendiente = false;
    let seleccion = 0;
    let guardado = false;
    let permitido = false;
    const hoy = new Date();
    control('nacimiento').max = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'),
        String(hoy.getDate()).padStart(2, '0')].join('-');

    function comprobarAdministrador() {
        const sesion = JSON.parse(sessionStorage.getItem('usuarioActual') || 'null');
        const administrador = sesion && SGC.Datos.leer('usuarios')
            .find(usuario => String(usuario.id) === String(sesion.id));
        if (!administrador || administrador.rol !== 'administrador' ||
            (administrador.estado && administrador.estado !== 'activo')) {
            throw new Error('Solo un administrador activo puede registrar o modificar usuarios.');
        }
        return sesion;
    }

    function mostrarEdad() {
        const edad = SGC.Validacion.edad(control('nacimiento').value);
        SGC.Idioma.texto(document.getElementById('edad'), edad === '' ? 'Desde el nacimiento' : edad + ' años');
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
        SGC.Idioma.texto(document.querySelector('label[for="clave"]'), tieneContrasena ? 'Contraseña' : 'Contraseña *');
        SGC.Idioma.texto(document.getElementById('clave-ayuda'), tieneContrasena
            ? 'Deje este campo vacío para conservar la contraseña actual. Si la cambia, use de 8 a 15 caracteres con mayúscula, minúscula y número.'
            : 'Ingrese una contraseña para guardar los cambios: de 8 a 15 caracteres con mayúscula, minúscula y número.');
    }

    try {
        comprobarAdministrador();
        permitido = true;
        const registros = SGC.Datos.leer('usuarios');
        if (modificando) {
            actual = registros.find(u => u.id === id);
            if (!actual) throw new Error('No se encontró el usuario solicitado. Vuelva al listado.');
            nombres.forEach(nombre => { control(nombre).value = actual[nombre] || ''; });
            imagen = /^data:image\/(png|jpeg|webp);base64,/.test(actual.imagen || '') ? actual.imagen : '';
            SGC.Idioma.texto(document.querySelector('title'), 'Modificar usuario | SGC');
            SGC.Idioma.texto(document.getElementById('titulo'), 'Modificar usuario');
            SGC.Idioma.texto(document.getElementById('ruta'), 'Usuarios / Modificación');
            SGC.Idioma.texto(guardar, 'Guardar cambios');
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
            SGC.Idioma.texto(document.getElementById('imagen-mensaje'), '');
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
            permitido = false;
            const sesion = comprobarAdministrador();
            permitido = true;
            // Conserva los datos del usuario que no aparecen en el formulario.
            const entrada = { ...actual, ...Object.fromEntries(nombres.map(nombre => [nombre, control(nombre).value.trim()])) };
            if (actual) entrada.id = actual.id;
            const clave = control('clave').value;
            const campos = SGC.Validacion.usuario(entrada, SGC.Datos.leer('usuarios'), clave);
            if (actual && !actual.contrasena && !clave) campos.clave = 'Ingrese una contraseña para guardar los cambios.';
            if (imagenError) campos.imagen = imagenError;
            if (imagenPendiente) campos.imagen = 'Espere a que termine de cargar la imagen.';
            if (!errores(formulario, campos)) return;
            guardar.disabled = true;
            SGC.Idioma.texto(guardar, 'Guardando…');
            entrada.contrasena = clave || actual.contrasena;
            entrada.imagen = imagen;
            // Conserva el estado de las cuentas creadas con la versión anterior.
            entrada.estado = actual?.estado || 'activo';
            const registro = await SGC.Datos.guardar('usuarios', entrada);
            // Si cambia su propio rol, la sesión también debe reflejarlo.
            if (String(sesion.id) === String(registro.id)) {
                sessionStorage.setItem('usuarioActual', JSON.stringify({
                    id: registro.id, nombre: registro.nombre, correo: registro.correo, rol: registro.rol
                }));
                permitido = registro.rol === 'administrador';
            }
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
            aviso(permitido ? 'El usuario se guardó correctamente. Puede consultarlo en el listado.'
                : 'El rol se actualizó. Esta cuenta ya no tiene permiso para administrar usuarios.', 'confirmacion');
            guardado = true;
        } catch (error) { fallo(error); }
        finally { guardar.disabled = !permitido; SGC.Idioma.texto(guardar, textoBoton); }
    });
})();
