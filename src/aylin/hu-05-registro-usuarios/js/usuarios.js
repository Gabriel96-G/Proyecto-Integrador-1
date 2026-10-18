/* SGCS-101 HU-05 y SGCS-102 HU-06: registro y listado. */
(() => {
  const { t, elemento, aviso, fallo, errores, estadoVacio } = SGC.UI;
  const formulario = document.getElementById('usuario-form');
  if (!formulario) {
    function listar() {
      try {
        const registros = SGC.Datos.leer().usuarios;
        const cuerpo = document.getElementById('registros');
        cuerpo.replaceChildren();
        registros.forEach(usuario => {
          const fila = elemento('tr');
          const celda = elemento('td');
          const identidad = elemento('div', 'tabla__identidad');
          const avatar = elemento('span', 'tabla__avatar', (usuario.nombre[0] || '') + (usuario.primerApellido[0] || ''));
          if (/^data:image\/(png|jpeg|webp);base64,/.test(usuario.imagen || '')) {
            const foto = elemento('img', 'tabla__avatar');
            foto.src = usuario.imagen;
            foto.alt = '';
            identidad.append(foto);
          } else identidad.append(avatar);
          const detalle = elemento('div');
          detalle.append(elemento('p', 'tabla__nombre', [usuario.nombre, usuario.primerApellido, usuario.segundoApellido].filter(Boolean).join(' ')), elemento('p', 'tabla__secundario', usuario.correo));
          identidad.append(detalle);
          celda.append(identidad);
          fila.append(celda, elemento('td', '', usuario.identificacion));
          const rol = elemento('td');
          rol.append(elemento('span', 'insignia', t(usuario.rol)));
          const estado = elemento('td');
          estado.append(elemento('span', 'insignia ' + (usuario.estado === 'activo' ? 'insignia--aprobado' : ''), t(usuario.estado)));
          fila.append(rol, estado);
          cuerpo.append(fila);
        });
        estadoVacio(registros.length, registros.length, 'sinUsuarios');
      } catch (error) { fallo(error); }
    }
    window.addEventListener('storage', evento => { if (evento.key === SGC.Datos.clave) listar(); });
    listar();
    if (new URLSearchParams(location.search).get('guardado') === '1') {
      aviso('usuarioGuardado', 'confirmacion');
      history.replaceState(null, '', location.pathname);
    }
    return;
  }

  let imagen = '';
  let imagenError = '';
  let imagenPendiente = false;
  let seleccionImagen = 0;
  const guardar = document.getElementById('guardar');
  const control = nombre => formulario.elements.namedItem(nombre);
  const nombres = ['nombre', 'primerApellido', 'segundoApellido', 'identificacion', 'nacimiento', 'sexo', 'correo', 'correoPersonal', 'telefono', 'rol', 'estado'];
  const hoy = new Date();
  control('nacimiento').max = [hoy.getFullYear(), String(hoy.getMonth() + 1).padStart(2, '0'), String(hoy.getDate()).padStart(2, '0')].join('-');

  function ajustarImagen(archivo) {
    return new Promise((resolver, rechazar) => {
      const lector = new FileReader();
      lector.onerror = () => rechazar(new Error('imagenInvalida'));
      lector.onload = () => {
        const foto = new Image();
        foto.onerror = () => rechazar(new Error('imagenInvalida'));
        foto.onload = () => {
          try {
            const escala = Math.min(1, 192 / foto.width, 192 / foto.height);
            const lienzo = document.createElement('canvas');
            lienzo.width = Math.max(1, Math.round(foto.width * escala));
            lienzo.height = Math.max(1, Math.round(foto.height * escala));
            lienzo.getContext('2d').drawImage(foto, 0, 0, lienzo.width, lienzo.height);
            resolver(lienzo.toDataURL('image/webp', 0.85));
          } catch { rechazar(new Error('imagenInvalida')); }
        };
        foto.src = lector.result;
      };
      lector.readAsDataURL(archivo);
    });
  }

  control('imagen').addEventListener('change', async () => {
    const seleccion = ++seleccionImagen;
    const archivo = control('imagen').files[0];
    imagenError = '';
    imagenPendiente = false;
    if (!archivo) { imagen = ''; return; }
    if (!archivo.type.startsWith('image/')) imagenError = 'imagenInvalida';
    else if (archivo.size > 2 * 1024 * 1024) imagenError = 'imagenGrande';
    if (imagenError) { errores(formulario, { imagen: imagenError }); return; }
    imagenPendiente = true;
    try {
      const resultado = await ajustarImagen(archivo);
      if (seleccion !== seleccionImagen) return;
      imagen = resultado;
      document.getElementById('perfil-imagen').src = imagen;
      document.getElementById('perfil-imagen').hidden = false;
      document.getElementById('perfil-silueta').hidden = true;
    } catch (error) {
      if (seleccion === seleccionImagen) { imagenError = error.message; errores(formulario, { imagen: imagenError }); }
    } finally { if (seleccion === seleccionImagen) imagenPendiente = false; }
  });

  async function prepararCredencial(clave) {
    if (!crypto.subtle) throw new Error('credencialNoDisponible');
    const sal = crypto.getRandomValues(new Uint8Array(16));
    const material = await crypto.subtle.importKey('raw', new TextEncoder().encode(clave), 'PBKDF2', false, ['deriveBits']);
    const hash = await crypto.subtle.deriveBits({ name: 'PBKDF2', hash: 'SHA-256', salt: sal, iterations: 100000 }, material, 256);
    const base64 = bytes => btoa(String.fromCharCode(...bytes));
    return { algoritmo: 'PBKDF2-SHA-256', iteraciones: 100000, sal: base64(sal), hash: base64(new Uint8Array(hash)) };
  }
  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (guardar.disabled) return;
    try {
      const entrada = Object.fromEntries(nombres.map(nombre => [nombre, control(nombre).value.trim()]));
      const nuevaClave = control('clave').value;
      const campos = SGC.Validacion.usuario(entrada, SGC.Datos.leer().usuarios, nuevaClave);
      if (imagenError) campos.imagen = imagenError;
      if (imagenPendiente) campos.imagen = 'imagenCargando';
      if (!errores(formulario, campos)) return;
      guardar.disabled = true;
      guardar.textContent = t('guardando');
      entrada.credencial = await prepararCredencial(nuevaClave);
      entrada.imagen = imagen;
      await SGC.Datos.guardarUsuario(entrada);
      formulario.reset();
      imagen = '';
      document.getElementById('perfil-imagen').hidden = true;
      document.getElementById('perfil-silueta').hidden = false;
      aviso('usuarioGuardado', 'confirmacion');
    } catch (error) {
      const campo = { identificacionDuplicada: 'identificacion', correoDuplicado: 'correo', rolInvalido: 'rol' }[error.message];
      if (campo) errores(formulario, { [campo]: error.message });
      else fallo(error);
    } finally {
      guardar.disabled = false;
      guardar.textContent = t('guardarUsuario');
    }
  });
})();
