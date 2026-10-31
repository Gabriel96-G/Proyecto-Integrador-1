window.SGC = window.SGC || {};
SGC.UI = (() => {
    function elemento(etiqueta, clase, texto, traducible = false) {
        const nodo = document.createElement(etiqueta);
        if (clase) nodo.className = clase;
        if (texto !== undefined) {
            if (traducible) SGC.Idioma.texto(nodo, texto);
            else nodo.textContent = texto;
        }
        return nodo;
    }

    function aviso(texto, tipo = 'error') {
        const nodo = document.getElementById('aviso');
        SGC.Idioma.texto(nodo, texto);
        nodo.className = 'aviso aviso--' + tipo;
        nodo.setAttribute('role', tipo === 'error' ? 'alert' : 'status');
        nodo.hidden = false;
    }

    function fallo(error) {
        const texto = error instanceof SyntaxError
            ? 'Los datos guardados no tienen un formato válido. Se conservaron sin cambios.'
            : error.name === 'QuotaExceededError'
                ? 'No queda espacio en el navegador. Sus datos permanecen en el formulario.'
                : error.name === 'SecurityError'
                    ? 'El navegador bloqueó el almacenamiento. Abra el proyecto con Live Server.'
                    : error.message || 'No se pudo completar la operación.';
        aviso(texto);
    }

    function abrirPestana(id) {
        document.querySelectorAll('[role="tab"]').forEach(boton => {
            const activo = boton.getAttribute('aria-controls') === id;
            boton.setAttribute('aria-selected', String(activo));
            boton.tabIndex = activo ? 0 : -1;
            document.getElementById(boton.getAttribute('aria-controls')).hidden = !activo;
        });
    }

    function errores(formulario, campos) {
        formulario.querySelectorAll('[data-error-for]').forEach(mensaje => {
            const control = formulario.elements.namedItem(mensaje.dataset.errorFor);
            if (!control) return;
            const texto = campos[mensaje.dataset.errorFor];
            SGC.Idioma.texto(mensaje, texto || '');
            control.classList.toggle('error', Boolean(texto));
            control.classList.toggle('valido', !texto && Boolean(control.value));
            if (texto) control.setAttribute('aria-invalid', 'true');
            else control.removeAttribute('aria-invalid');
        });
        const primerNombre = Object.keys(campos)[0];
        if (primerNombre) {
            const control = formulario.elements.namedItem(primerNombre);
            const panel = control.closest('[role="tabpanel"]');
            if (panel) abrirPestana(panel.id);
            control.focus();
            aviso('Revise los campos señalados. No se guardaron cambios.');
            return false;
        }
        document.getElementById('aviso').hidden = true;
        return true;
    }

    function limpiar(formulario) {
        formulario.querySelectorAll('.error, .valido').forEach(c => c.classList.remove('error', 'valido'));
        formulario.querySelectorAll('[aria-invalid]').forEach(c => c.removeAttribute('aria-invalid'));
        formulario.querySelectorAll('[data-error-for]').forEach(m => { SGC.Idioma.texto(m, ''); });
    }

    function editar(ruta, id) {
        const enlace = elemento('a', 'enlace-accion', 'Editar', true);
        enlace.href = ruta + '?id=' + encodeURIComponent(id);
        return enlace;
    }

    function estadoListado(total, cantidad, nombre) {
        const vacio = document.getElementById('vacio');
        vacio.hidden = cantidad > 0;
        SGC.Idioma.texto(vacio, total ? 'No se encontraron coincidencias.' : 'Todavía no hay ' + nombre + (nombre === 'carreras' ? ' registradas.' : ' registrados.'));
        SGC.Idioma.texto(document.getElementById('cantidad'), cantidad + (cantidad === 1 ? ' registro' : ' registros'));
    }

    const pestanas = [...document.querySelectorAll('[role="tab"]')];
    pestanas.forEach((boton, indice) => {
        boton.addEventListener('click', () => abrirPestana(boton.getAttribute('aria-controls')));
        boton.addEventListener('keydown', evento => {
            let siguiente;
            if (evento.key === 'ArrowRight') siguiente = (indice + 1) % pestanas.length;
            if (evento.key === 'ArrowLeft') siguiente = (indice - 1 + pestanas.length) % pestanas.length;
            if (evento.key === 'Home') siguiente = 0;
            if (evento.key === 'End') siguiente = pestanas.length - 1;
            if (siguiente === undefined) return;
            evento.preventDefault();
            abrirPestana(pestanas[siguiente].getAttribute('aria-controls'));
            pestanas[siguiente].focus();
        });
    });

    const menu = document.querySelector('.navegacion__desplegable');
    const movil = matchMedia('(max-width: 767px)');
    function ajustarMenu() { if (menu) menu.open = !movil.matches; }
    ajustarMenu();
    movil.addEventListener('change', ajustarMenu);
    return { elemento, aviso, fallo, abrirPestana, errores, limpiar, editar, estadoListado };
})();
