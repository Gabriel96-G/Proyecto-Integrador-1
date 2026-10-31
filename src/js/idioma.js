window.SGC = window.SGC || {};

SGC.Idioma = (() => {
    "use strict";

    const textos = SGC.Traducciones;

    const claveAlmacenamiento = 'sgcIdioma';
    const textosDinamicos = new Map();
    const atributosDinamicos = new Map();
    const formatosFecha = new Map();
    const clavesPorTexto = new Map();
    const plantillas = [];
    let idioma = 'es';

    const normalizar = valor => String(valor ?? '').replace(/\s+/g, ' ').trim();
    const escapar = valor => valor.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

    // Busca las traducciones a partir del texto en español.
    Object.entries(textos).forEach(([clave, [valor]]) => {
        clavesPorTexto.set(valor, clave);
        if (valor.includes('{')) {
            const nombres = [];
            const partes = valor.split(/(\{\w+\})/g).map(parte => {
                if (/^\{\w+\}$/.test(parte)) {
                    nombres.push(parte.slice(1, -1));
                    return '(.+?)';
                }
                return escapar(parte);
            });
            plantillas.push({ clave, nombres, expresion: new RegExp('^' + partes.join('') + '$') });
        }
    });

    try {
        const guardado = sessionStorage.getItem(claveAlmacenamiento);
        if (guardado === 'en' || guardado === 'es') idioma = guardado;
    } catch { /* Sin almacenamiento, la página comienza en español. */ }

    function t(clave, valores = {}) {
        const mensaje = textos[clave]?.[idioma === 'en' ? 1 : 0] ?? clave;
        return mensaje.replace(/\{(\w+)\}/g, (coincidencia, nombre) => valores[nombre] ?? coincidencia);
    }

    function traducir(valor) {
        const original = normalizar(valor);
        const clave = clavesPorTexto.get(original);
        if (clave) return t(clave);
        for (const plantilla of plantillas) {
            const partes = original.match(plantilla.expresion);
            if (!partes) continue;
            const valores = Object.fromEntries(plantilla.nombres.map((nombre, i) => [nombre, partes[i + 1]]));
            return t(plantilla.clave, valores);
        }
        // Algunos avisos incluyen otro mensaje de error al final.
        for (const prefijo of ['No se pudo consultar el curso. ', 'No se pudieron cargar los cursos. ']) {
            if (original.startsWith(prefijo)) {
                return traducir(prefijo.trim()) + ' ' + traducir(original.slice(prefijo.length));
            }
        }
        return String(valor ?? '');
    }

    function texto(nodo, valor) {
        const original = String(valor ?? '');
        nodo.removeAttribute('data-i18n');
        formatosFecha.delete(nodo);
        textosDinamicos.set(nodo, original);
        nodo.textContent = traducir(original);
    }

    function atributo(nodo, nombre, valor) {
        nodo.removeAttribute('data-i18n-' + nombre);
        if (!atributosDinamicos.has(nodo)) atributosDinamicos.set(nodo, new Map());
        atributosDinamicos.get(nodo).set(nombre, String(valor ?? ''));
        nodo.setAttribute(nombre, traducir(valor));
    }

    function original(nodo) {
        return textosDinamicos.get(nodo) ?? textos[nodo.dataset.i18n]?.[0] ?? nodo.textContent;
    }

    function rol(nodo, valor) {
        const nombres = {
            administrador: 'Administrador',
            desarrollo: 'Desarrollo Curricular',
            'encargado de desarrollo curricular': 'Encargado de Desarrollo Curricular',
            director: 'Director de escuela',
            'director de escuela': 'Director de escuela',
            rectoria: 'Rectoría',
            vicerrectoria: 'Vicerrectoría'
        };
        texto(nodo, nombres[String(valor).toLowerCase()] ?? valor);
    }

    function fecha(nodo, valor, opciones) {
        textosDinamicos.delete(nodo);
        nodo.removeAttribute('data-i18n');
        formatosFecha.set(nodo, { valor, opciones });
        nodo.textContent = new Intl.DateTimeFormat(idioma === 'en' ? 'en-US' : 'es-CR', opciones).format(new Date(valor));
    }

    function aplicar() {
        document.documentElement.lang = idioma;
        document.querySelectorAll('[data-i18n]').forEach(nodo => {
            nodo.textContent = t(nodo.dataset.i18n);
        });
        for (const nombre of ['placeholder', 'aria-label', 'title', 'alt']) {
            document.querySelectorAll('[data-i18n-' + nombre + ']').forEach(nodo => {
                nodo.setAttribute(nombre, t(nodo.getAttribute('data-i18n-' + nombre)));
            });
        }
        // Actualiza también los mensajes que ya están en pantalla.
        for (const [nodo, valor] of textosDinamicos) {
            if (!nodo.isConnected) { textosDinamicos.delete(nodo); continue; }
            nodo.textContent = traducir(valor);
        }
        for (const [nodo, atributos] of atributosDinamicos) {
            if (!nodo.isConnected) { atributosDinamicos.delete(nodo); continue; }
            for (const [nombre, valor] of atributos) nodo.setAttribute(nombre, traducir(valor));
        }
        for (const [nodo, formato] of formatosFecha) {
            if (!nodo.isConnected) { formatosFecha.delete(nodo); continue; }
            fecha(nodo, formato.valor, formato.opciones);
        }
        document.getElementById('idioma').value = idioma;
        window.dispatchEvent(new CustomEvent('idioma:cambiado', { detail: { idioma } }));
    }

    function cambiar(nuevoIdioma) {
        if (nuevoIdioma !== 'es' && nuevoIdioma !== 'en') return;
        idioma = nuevoIdioma;
        let guardado = true;
        try { sessionStorage.setItem(claveAlmacenamiento, idioma); }
        catch { guardado = false; }
        aplicar();
        texto(document.getElementById('estado-idioma'), textos[guardado ? 'idiomaActualizado' : 'idiomaSinGuardar'][0]);
    }

    document.getElementById('formulario-idioma').addEventListener('submit', evento => {
        evento.preventDefault();
        cambiar(document.getElementById('idioma').value);
    });

    aplicar();
    return { t, traducir, texto, atributo, original, rol, fecha, aplicar, cambiar };
})();
