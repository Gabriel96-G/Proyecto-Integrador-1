window.SGC = window.SGC || {};
SGC.Datos = (() => {
  const clave = 'sgc.aylin.sprint1.v1';
  const colecciones = ['usuarios', 'carreras', 'sefia', 'tematicas'];
  const roles = ['administrador', 'desarrollo', 'director', 'rectoria', 'vicerrectoria'];
  const escuelas = [
    { id: 'esc-demo-1', codigo: 'ESC-01', nombre: 'Escuela de Tecnologías Digitales' },
    { id: 'esc-demo-2', codigo: 'ESC-02', nombre: 'Escuela de Ciberseguridad' },
    { id: 'esc-demo-3', codigo: 'ESC-03', nombre: 'Escuela de Negocios' }
  ];
  const normalizar = valor => String(valor ?? '').trim().normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');
  const nuevo = () => ({ version: 1, usuarios: [], carreras: [], sefia: [], tematicas: [], escuelas: escuelas.map(e => ({ ...e })) });
  function leer() {
    let texto;
    try { texto = localStorage.getItem(clave); } catch { throw new Error('almacenamiento'); }
    if (texto === null) return nuevo();
    try {
      const datos = JSON.parse(texto);
      if (datos.version !== 1 || !Array.isArray(datos.escuelas) || !colecciones.every(c => Array.isArray(datos[c]) && datos[c].every(r => r && typeof r.id === 'string' && typeof r.nombre === 'string'))) throw new Error();
      return datos;
    } catch { throw new Error('datosInvalidos'); }
  }
  function escribir(datos) {
    try { localStorage.setItem(clave, JSON.stringify(datos)); }
    catch { throw new Error('almacenamiento'); }
  }
  async function conBloqueo(operacion) {
    return navigator.locks ? navigator.locks.request(clave, operacion) : operacion();
  }
  async function guardarUsuario(usuario) {
    return conBloqueo(() => {
      const datos = leer();
      if (datos.usuarios.some(u => normalizar(u.identificacion) === normalizar(usuario.identificacion))) throw new Error('identificacionDuplicada');
      if (datos.usuarios.some(u => normalizar(u.correo) === normalizar(usuario.correo))) throw new Error('correoDuplicado');
      if (!roles.includes(usuario.rol)) throw new Error('rolInvalido');
      const registro = { ...usuario, id: crypto.randomUUID(), revision: 1, actualizado: new Date().toISOString() };
      datos.usuarios.push(registro);
      escribir(datos);
      return registro;
    });
  }
  async function guardarCatalogo(tipo, entrada) {
    if (!['carreras', 'sefia', 'tematicas'].includes(tipo)) throw new Error('catalogoInvalido');
    return conBloqueo(() => {
      const datos = leer();
      const registros = datos[tipo];
      if (tipo === 'carreras') {
        if (!datos.escuelas.some(e => e.id === entrada.escuela)) throw new Error('escuelaInvalida');
        if (registros.some(r => normalizar(r.codigo) === normalizar(entrada.codigo))) throw new Error('codigoDuplicado');
      } else if (registros.some(r => normalizar(r.nombre) === normalizar(entrada.nombre))) throw new Error('nombreDuplicado');
      const codigo = tipo === 'carreras' ? entrada.codigo.trim() : Math.max(0, ...registros.map(r => Number(r.codigo) || 0)) + 1;
      const registro = { ...entrada, codigo, id: crypto.randomUUID(), revision: 1, actualizado: new Date().toISOString() };
      registros.push(registro);
      escribir(datos);
      return registro;
    });
  }
  return { clave, leer, normalizar, guardarUsuario, guardarCatalogo, roles };
})();
