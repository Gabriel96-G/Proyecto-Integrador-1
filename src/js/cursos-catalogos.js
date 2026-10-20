
/*
 * Integración de catálogos con el formulario de cursos.
 * HU-38 (CP-089): Metodologías de aprendizaje.
 * HU-48 (CP-113): Casas certificadoras.
 */

document.addEventListener("DOMContentLoaded", function () {

    // Carga un catálogo de localStorage en una lista desplegable.
    function cargarCatalogo(idSelector, idMensaje, clave, nombreCatalogo) {

        const selector = document.getElementById(idSelector);
        const mensaje = document.getElementById(idMensaje);

        if (!selector || !mensaje) {
            console.error("No se encontraron los controles de " + nombreCatalogo);
            return;
        }

        selector.innerHTML = "";
        mensaje.textContent = "";

        // Agregar la opción inicial.
        const opcionInicial = document.createElement("option");
        opcionInicial.value = "";
        opcionInicial.textContent = "Seleccione una opción";
        opcionInicial.selected = true;
        opcionInicial.disabled = true;
        selector.appendChild(opcionInicial);

        let registros;

        try {
            const datosGuardados = localStorage.getItem(clave);
            registros = datosGuardados ? JSON.parse(datosGuardados) : [];

            if (!Array.isArray(registros)) {
                throw new Error("Formato de datos inválido");
            }

        } catch (error) {
            selector.disabled = true;
            mensaje.textContent =
                "No fue posible cargar el catálogo de " + nombreCatalogo + ".";
            return;
        }

        // Verificar si existen registros.
        if (registros.length === 0) {
            selector.disabled = true;
            mensaje.textContent =
                "No hay registros disponibles de " + nombreCatalogo + ".";
            return;
        }

        // Agregar las opciones registradas.
        registros.forEach(function (registro) {

            const opcion = document.createElement("option");

            opcion.value = String(registro.codigo);
            opcion.textContent =
                registro.nombre + " (Código: " + registro.codigo + ")";

            selector.appendChild(opcion);
        });

        selector.disabled = false;
    }

    // HU-38: Cargar las metodologías de aprendizaje.
    cargarCatalogo(
        "metodologia-curso",
        "mensaje-metodologias",
        "metodologiasAprendizaje",
        "metodologías de aprendizaje"
    );

    // HU-48: Cargar las casas certificadoras.
    cargarCatalogo(
        "casa-certificadora-curso",
        "mensaje-casas-certificadoras",
        "casasCertificadoras",
        "casas certificadoras"
    );

});
