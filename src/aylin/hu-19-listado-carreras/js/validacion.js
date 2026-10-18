window.SGC = window.SGC || {};
SGC.Validacion = (() => {
  const correoValido = valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
  const claveValida = valor => valor.length >= 8 && valor.length <= 15 && /[A-Z]/.test(valor) && /[a-z]/.test(valor) && /\d/.test(valor);
  function fechaValida(valor) {
    if (!valor) return true;
    if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
    const fecha = new Date(valor + 'T12:00:00');
    const partes = valor.split('-').map(Number);
    const hoy = new Date();
    hoy.setHours(23, 59, 59, 999);
    return fecha.getFullYear() === partes[0] && fecha.getMonth() + 1 === partes[1] && fecha.getDate() === partes[2] && fecha <= hoy;
  }
  function edad(valor) {
    if (!valor || !fechaValida(valor)) return '';
    const hoy = new Date();
    const nacimiento = new Date(valor + 'T12:00:00');
    let cantidad = hoy.getFullYear() - nacimiento.getFullYear();
    if (hoy.getMonth() < nacimiento.getMonth() || (hoy.getMonth() === nacimiento.getMonth() && hoy.getDate() < nacimiento.getDate())) cantidad--;
    return cantidad;
  }
  function usuario(entrada, registros, nuevaClave) {
    const errores = {};
    if (!entrada.nombre.trim()) errores.nombre = 'nombreObligatorio';
    if (!entrada.primerApellido.trim()) errores.primerApellido = 'apellidoObligatorio';
    if (!entrada.identificacion.trim()) errores.identificacion = 'identificacionObligatoria';
    else if (registros.some(r => r.id !== entrada.id && SGC.Datos.normalizar(r.identificacion) === SGC.Datos.normalizar(entrada.identificacion))) errores.identificacion = 'identificacionDuplicada';
    if (!correoValido(entrada.correo)) errores.correo = 'correoInvalido';
    else if (registros.some(r => r.id !== entrada.id && SGC.Datos.normalizar(r.correo) === SGC.Datos.normalizar(entrada.correo))) errores.correo = 'correoDuplicado';
    if (entrada.correoPersonal && !correoValido(entrada.correoPersonal)) errores.correoPersonal = 'correoPersonalInvalido';
    if (entrada.telefono && (!/^[+\d\s()-]+$/.test(entrada.telefono) || !/^\d{8,15}$/.test(entrada.telefono.replace(/\D/g, '')))) errores.telefono = 'telefonoInvalido';
    if (!fechaValida(entrada.nacimiento)) errores.nacimiento = 'fechaInvalida';
    if (!['', 'femenino', 'masculino', 'otro', 'no-indica'].includes(entrada.sexo)) errores.sexo = 'seleccionInvalida';
    if (!SGC.Datos.roles.includes(entrada.rol)) errores.rol = 'rolInvalido';
    if (!['activo', 'inactivo'].includes(entrada.estado)) errores.estado = 'seleccionInvalida';
    if ((!entrada.id || nuevaClave) && !claveValida(nuevaClave)) errores.clave = 'claveInvalida';
    return errores;
  }
  function catalogo(tipo, entrada, datos) {
    const errores = {};
    if (!entrada.nombre.trim()) errores.nombre = 'nombreObligatorio';
    if (tipo === 'carreras') {
      if (!entrada.codigo.trim()) errores.codigo = 'codigoObligatorio';
      else if (datos.carreras.some(r => r.id !== entrada.id && SGC.Datos.normalizar(r.codigo) === SGC.Datos.normalizar(entrada.codigo))) errores.codigo = 'codigoDuplicado';
      if (!datos.escuelas.some(e => e.id === entrada.escuela)) errores.escuela = 'escuelaInvalida';
    } else if (datos[tipo].some(r => r.id !== entrada.id && SGC.Datos.normalizar(r.nombre) === SGC.Datos.normalizar(entrada.nombre))) errores.nombre = 'nombreDuplicado';
    return errores;
  }
  return { correoValido, claveValida, fechaValida, edad, usuario, catalogo };
})();
