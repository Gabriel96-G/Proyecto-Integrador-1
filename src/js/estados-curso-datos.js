// Configurar este recurso cuando el equipo defina la ruta de estados en la API.
SGC.EstadosCurso = (() => {
    const recurso = "";

    function ruta() {
        if (!recurso) {
            const error = new Error("La API de estados del curso aún no está configurada.");
            error.sinRuta = true;
            throw error;
        }
        return recurso;
    }

    async function listar() {
        const estados = await SGC.Api.pedir(ruta());
        if (!Array.isArray(estados)) throw new Error("Se esperaba una lista de estados.");
        return estados;
    }

    async function guardar(datos, anterior) {
        if (!anterior) return SGC.Api.pedir(ruta(), "POST", datos);
        const id = anterior._id ?? anterior.id ?? anterior.codigo;
        return SGC.Api.pedir(ruta() + "/" + encodeURIComponent(id), "PUT", datos);
    }

    return { listar, guardar };
})();
