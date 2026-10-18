/* SGCS-76/77, 88/85 y 89/90: registro y listado de tres catálogos. */
(() => {
  const { t, elemento, aviso, fallo, errores, estadoVacio } = SGC.UI;
  const parametros = new URLSearchParams(location.search);
  const tipo = document.body.dataset.tipo;
  const configuraciones = {
    carreras: { registrar: 'registrarCarrera', detalle: 'carreraDetalle' },
    sefia: { registrar: 'registrarSefia', detalle: 'sefiaDetalle' },
    tematicas: { registrar: 'registrarTematica', detalle: 'tematicasDetalle' }
  };
  const config = Object.hasOwn(configuraciones, tipo) ? configuraciones[tipo] : null;
  const formulario = document.getElementById('catalogo-form');
  if (!config) {
    fallo(new Error('catalogoInvalido'));
    document.querySelectorAll('form button, #registrar').forEach(boton => { boton.hidden = true; });
    return;
  }
  const esCarrera = tipo === 'carreras';
  document.querySelectorAll('[data-tipo-catalogo]').forEach(nodo => { nodo.dataset.i18n = tipo; });
  document.querySelectorAll('[data-detalle-catalogo]').forEach(nodo => { nodo.dataset.i18n = config.detalle; });
  document.querySelectorAll('[data-solo-carrera]').forEach(nodo => { nodo.hidden = !esCarrera; });
  document.querySelectorAll('[data-solo-auto]').forEach(nodo => { nodo.hidden = esCarrera; });
  if (formulario) {
    document.getElementById('codigo').disabled = !esCarrera;
    document.getElementById('escuela').disabled = !esCarrera;
    document.getElementById('descripcion').disabled = esCarrera;
  }
  function cargarEscuelas(datos, selector) {
    selector.replaceChildren();
    const primera = elemento('option', '', t('seleccionar'));
    primera.value = '';
    selector.append(primera);
    datos.escuelas.forEach(escuela => {
      const opcion = elemento('option', '', escuela.nombre);
      opcion.value = escuela.id;
      selector.append(opcion);
    });
  }
  if (!formulario) {
    const registrar = document.getElementById('registrar');
    if (registrar) {
      registrar.dataset.i18n = config.registrar;
      registrar.href = 'index.html';
    }
    function listar() {
      try {
        const datos = SGC.Datos.leer();
        const registros = datos[tipo];
        const cuerpo = document.getElementById('registros');
        cuerpo.replaceChildren();
        registros.forEach(registro => {
          const fila = elemento('tr');
          fila.append(elemento('td', 'tabla__codigo', String(registro.codigo)), elemento('td', 'tabla__nombre', registro.nombre));
          const dato = esCarrera ? datos.escuelas.find(e => e.id === registro.escuela)?.nombre || '—' : registro.descripcion || t('sinDescripcion');
          fila.append(elemento('td', '', dato));
          cuerpo.append(fila);
        });
        estadoVacio(registros.length, registros.length, 'sinCatalogos');
      } catch (error) { fallo(error); }
    }
    window.addEventListener('storage', evento => { if (evento.key === SGC.Datos.clave) listar(); });
    SGC.Idioma.aplicar();
    listar();
    if (parametros.get('guardado') === '1') {
      aviso('registroGuardado', 'confirmacion');
      history.replaceState(null, '', location.pathname + '?tipo=' + tipo);
    }
    return;
  }

  const guardar = document.getElementById('guardar');
  try {
    const datos = SGC.Datos.leer();
    cargarEscuelas(datos, document.getElementById('escuela'));
    document.getElementById('codigo-automatico').value = Math.max(0, ...datos[tipo].map(r => Number(r.codigo) || 0)) + 1;
    document.getElementById('titulo').dataset.i18n = config.registrar;
    document.body.dataset.titulo = config.registrar;
    document.getElementById('ruta-accion').dataset.i18n = 'nuevoRegistro';
    document.getElementById('cancelar').href = 'index.html';
    if (esCarrera && !datos.escuelas.length) { aviso('sinEscuelas'); guardar.disabled = true; }
    SGC.Idioma.aplicar();
  } catch (error) { fallo(error); guardar.disabled = true; }

  formulario.addEventListener('submit', async evento => {
    evento.preventDefault();
    if (guardar.disabled) return;
    try {
      const entrada = { nombre: document.getElementById('nombre').value.trim() };
      if (esCarrera) {
        entrada.codigo = document.getElementById('codigo').value.trim();
        entrada.escuela = document.getElementById('escuela').value;
      } else entrada.descripcion = document.getElementById('descripcion').value.trim();
      if (!errores(formulario, SGC.Validacion.catalogo(tipo, entrada, SGC.Datos.leer()))) return;
      guardar.disabled = true;
      guardar.textContent = t('guardando');
      await SGC.Datos.guardarCatalogo(tipo, entrada);
      formulario.reset();
      document.getElementById('codigo-automatico').value = Math.max(0, ...SGC.Datos.leer()[tipo].map(r => Number(r.codigo) || 0)) + 1;
      aviso('registroGuardado', 'confirmacion');
    } catch (error) {
      const campo = { codigoDuplicado: 'codigo', nombreDuplicado: 'nombre', escuelaInvalida: 'escuela' }[error.message];
      if (campo) errores(formulario, { [campo]: error.message });
      else fallo(error);
    } finally {
      guardar.disabled = false;
      guardar.textContent = t('guardarRegistro');
    }
  });
})();
