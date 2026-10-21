
/*
 * HU-39 - Listado de metodologías de aprendizaje
 * HU-40 - Búsqueda de metodologías
 * Proyecto Integrador 1 - Universidad CENFOTEC
 */

document.addEventListener("DOMContentLoaded", function () {

    const tabla = document.getElementById("tabla-metodologias");
    const cuerpoTabla = document.getElementById("cuerpo-tabla-metodologias");
    const mensajeListado = document.getElementById("mensaje-listado");
    const campoBusqueda = document.getElementById("buscar-metodologias");

    // Misma clave utilizada en HU-38.
    const CLAVE_ALMACENAMIENTO = "metodologiasAprendizaje";

    // HU-40: Buscar metodologías por código o nombre.
    function filtrarMetodologias(metodologias) {

        const busqueda = campoBusqueda.value.trim().toLowerCase();

        return metodologias.filter(function (metodologia) {

            const codigo = String(metodologia.codigo ?? "").toLowerCase();
            const nombre = String(metodologia.nombre ?? "").toLowerCase();

            // CP-093: Buscar por código o nombre.
            return codigo.includes(busqueda) ||
                   nombre.includes(busqueda);
        });
    }

    // HU-39: Recuperar y mostrar las metodologías registradas.
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

                return;
            }

            // HU-40: Aplicar la búsqueda por código o nombre.
            const metodologiasFiltradas =
                filtrarMetodologias(metodologias);

            // CP-095: Mostrar mensaje cuando no hay coincidencias.
            if (metodologiasFiltradas.length === 0) {

                tabla.hidden = true;

                mensajeListado.textContent =
                    "No se encontraron metodologías que coincidan con la búsqueda.";

                return;
            }

            // CP-091: Mostrar las metodologías registradas.
            tabla.hidden = false;
            mensajeListado.textContent = "";

            metodologiasFiltradas.forEach(function (metodologia) {

                const fila = document.createElement("tr");

                const celdaCodigo = document.createElement("td");
                celdaCodigo.textContent = metodologia.codigo ?? "";

                const celdaNombre = document.createElement("td");
                celdaNombre.textContent = metodologia.nombre ?? "";

                const celdaDescripcion = document.createElement("td");
                celdaDescripcion.textContent = metodologia.descripcion ?? "";

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

    // HU-40: Actualizar el listado mientras el usuario escribe.
    campoBusqueda.addEventListener("input", cargarMetodologias);

    // HU-39: Mostrar los registros al cargar la página.
    cargarMetodologias();

});
