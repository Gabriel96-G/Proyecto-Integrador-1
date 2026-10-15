
/*
 * HU-39 - Listado de metodologías de aprendizaje
 * Proyecto Integrador 1 - Universidad CENFOTEC
 */

document.addEventListener("DOMContentLoaded", function () {

    const tabla = document.getElementById("tabla-metodologias");
    const cuerpoTabla = document.getElementById("cuerpo-tabla-metodologias");
    const mensajeListado = document.getElementById("mensaje-listado");

    // Misma clave utilizada en HU-38.
    const CLAVE_ALMACENAMIENTO = "metodologiasAprendizaje";

    // Recupera y muestra las metodologías registradas.
    function cargarMetodologias() {

        cuerpoTabla.innerHTML = "";

        try {
            const metodologias = JSON.parse(
                localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]"
            );

            if (!Array.isArray(metodologias)) {
                throw new Error("Los datos almacenados no son válidos.");
            }

            // CP-092: Mostrar mensaje cuando no existen registros.
            if (metodologias.length === 0) {
                tabla.hidden = true;

                mensajeListado.textContent =
                    "No existen metodologías de aprendizaje registradas.";

                mensajeListado.style.color =
                    "var(--color-texto-secundario)";

                return;
            }

            // CP-091: Mostrar las metodologías registradas.
            tabla.hidden = false;
            mensajeListado.textContent = "";

            metodologias.forEach(function (metodologia) {

                const fila = document.createElement("tr");

                const celdaCodigo = document.createElement("td");
                celdaCodigo.textContent = metodologia.codigo;

                const celdaNombre = document.createElement("td");
                celdaNombre.textContent = metodologia.nombre;

                const celdaDescripcion = document.createElement("td");
                celdaDescripcion.textContent = metodologia.descripcion;

                fila.appendChild(celdaCodigo);
                fila.appendChild(celdaNombre);
                fila.appendChild(celdaDescripcion);

                cuerpoTabla.appendChild(fila);
            });

        } catch (error) {
            console.error("Error al cargar metodologías:", error);

            tabla.hidden = true;

            mensajeListado.textContent =
                "No fue posible cargar el listado de metodologías.";
        }
    }

    cargarMetodologias();

});
