window.SGC = window.SGC || {};
SGC.UI = (() => {
  const t = (...argumentos) => SGC.Idioma.t(...argumentos);
  function elemento(etiqueta, clase, texto) {
    const nodo = document.createElement(etiqueta);
    if (clase) nodo.className = clase;
    if (texto !== undefined) nodo.textContent = texto;
    return nodo;
  }
  function aviso(clave, tipo = 'error') {
    const nodo = document.getElementById('aviso');
    if (!nodo) return;
    nodo.dataset.mensaje = clave;
    nodo.className = 'aviso aviso--' + tipo;
    nodo.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
    nodo.textContent = t(clave);
    nodo.hidden = false;
  }
  function fallo(error) { aviso(Object.hasOwn(mensajesConocidos, error?.message) ? error.message : 'errorGeneral'); }
  const mensajesConocidos = Object.fromEntries(['almacenamiento','datosInvalidos','conflicto','registroNoExiste','catalogoInvalido','credencialNoDisponible','identificacionDuplicada','correoDuplicado','codigoDuplicado','nombreDuplicado','escuelaInvalida','rolInvalido','imagenInvalida','imagenGrande'].map(x => [x, true]));

  function abrirPestana(id) {
    document.querySelectorAll('[role="tab"]').forEach(boton => {
      const activo = boton.getAttribute('aria-controls') === id;
      boton.setAttribute('aria-selected', String(activo));
      boton.tabIndex = activo ? 0 : -1;
      document.getElementById(boton.getAttribute('aria-controls')).hidden = !activo;
    });
  }
  function errores(formulario, erroresCampos, moverFoco = true) {
    formulario.querySelectorAll('[data-error-for]').forEach(mensaje => {
      const nombre = mensaje.dataset.errorFor;
      const control = formulario.elements.namedItem(nombre);
      const clave = erroresCampos[nombre];
      mensaje.dataset.errorClave = clave || '';
      mensaje.textContent = clave ? t(clave) : '';
      control.classList.toggle('error', Boolean(clave));
      control.classList.toggle('valido', !clave && Boolean(control.value));
      if (clave) control.setAttribute('aria-invalid', 'true');
      else control.removeAttribute('aria-invalid');
    });
    if (Object.keys(erroresCampos).length) {
      aviso('revisarErrores');
      const primero = formulario.elements.namedItem(Object.keys(erroresCampos)[0]);
      const panel = primero.closest('[role="tabpanel"]');
      if (panel) abrirPestana(panel.id);
      if (moverFoco) primero.focus();
      return false;
    }
    const nodo = document.getElementById('aviso');
    nodo.hidden = true;
    return true;
  }
  function enlaceEditar(ruta) {
    const enlace = elemento('a', 'enlace-accion', t('editar'));
    enlace.href = ruta;
    return enlace;
  }
  function estadoVacio(total, filtrados, claveVacio) {
    const vacio = document.getElementById('vacio');
    vacio.hidden = filtrados > 0;
    vacio.textContent = t(total ? 'sinResultados' : claveVacio);
    document.getElementById('cantidad').textContent = t('resultados', { cantidad: filtrados });
  }

  const pestanas = [...document.querySelectorAll('[role="tab"]')];
  pestanas.forEach((boton, i) => {
    boton.addEventListener('click', () => abrirPestana(boton.getAttribute('aria-controls')));
    boton.addEventListener('keydown', evento => {
      let siguiente;
      if (evento.key === 'ArrowRight') siguiente = (i + 1) % pestanas.length;
      if (evento.key === 'ArrowLeft') siguiente = (i - 1 + pestanas.length) % pestanas.length;
      if (evento.key === 'Home') siguiente = 0;
      if (evento.key === 'End') siguiente = pestanas.length - 1;
      if (siguiente === undefined) return;
      evento.preventDefault();
      abrirPestana(pestanas[siguiente].getAttribute('aria-controls'));
      pestanas[siguiente].focus();
    });
  });
  const menu = document.querySelector('.navegacion__desplegable');
  if (menu) {
    const movil = matchMedia('(max-width: 767px)');
    const ajustar = () => { menu.open = !movil.matches; };
    ajustar();
    movil.addEventListener('change', ajustar);
  }
  document.addEventListener('idioma:cambio', () => {
    const nodo = document.getElementById('aviso');
    if (nodo && !nodo.hidden && nodo.dataset.mensaje) nodo.textContent = t(nodo.dataset.mensaje);
    document.querySelectorAll('[data-error-clave]').forEach(m => { m.textContent = m.dataset.errorClave ? t(m.dataset.errorClave) : ''; });
  });
  return { t, elemento, aviso, fallo, abrirPestana, errores, enlaceEditar, estadoVacio };
})();
