// Cliente compartido por las pantallas. La API del servidor se publica bajo /api.
window.SGC = window.SGC || {};
SGC.Api = (() => {
    const base = '/api';

    async function pedir(ruta, metodo = 'GET', datos) {
        const opciones = { method: metodo, headers: { Accept: 'application/json' } };
        if (datos !== undefined) {
            opciones.headers['Content-Type'] = 'application/json';
            opciones.body = JSON.stringify(datos);
        }

        const respuesta = await fetch(base + '/' + ruta.replace(/^\/+/, ''), opciones);
        const texto = await respuesta.text();
        let resultado = null;
        if (texto.trim()) {
            try {
                resultado = JSON.parse(texto);
            } catch {
                if (respuesta.ok) throw new Error('El servidor no devolvió JSON. Revise la ruta de la API.');
            }
        }

        if (!respuesta.ok) {
            const error = new Error(resultado?.mensaje || resultado?.message || 'Error HTTP ' + respuesta.status);
            error.status = respuesta.status;
            throw error;
        }
        return resultado;
    }

    return { pedir };
})();
