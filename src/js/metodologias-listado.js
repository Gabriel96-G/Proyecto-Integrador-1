
/*
 * HU-39 - Listado de metodologías de aprendizaje
 * Proyecto Integrador 1 - Universidad CENFOTEC
 */

document.addEventListener("DOMContentLoaded", function () {

    const tabla = document.getElementById("tabla-metodologias");
    const cuerpoTabla = document.getElementById("cuerpo-tabla-metodologias");
    const mensajeListado = document.getElementById("mensaje-listado");

    
    // HU-40: Campos de búsqueda y filtrado.
    const formularioFiltros = document.getElementById("formulario-filtros-metodologias");

    const campoBusqueda = document.getElementById("buscar-metodologias");
    const filtroCodigo = document.getElementById("filtro-codigo");
    const filtroNombre = document.getElementById("filtro-nombre");
    const filtroDescripcion = document.getElementById("filtro-descripcion");


    // Misma clave utilizada en HU-38.
    const CLAVE_ALMACENAMIENTO = "metodologiasAprendizaje";
    
    // HU-40: Filtrar metodologías según los criterios ingresados.
    function filtrarMetodologias(metodologias) {

        const busqueda = campoBusqueda.value.trim().toLowerCase();
        const codigoBuscado = filtroCodigo.value.trim().toLowerCase();
        const nombreBuscado = filtroNombre.value.trim().toLowerCase();
        const descripcionBuscada = filtroDescripcion.value.trim().toLowerCase();

        return metodologias.filter(function (metodologia) {

            const codigo = String(metodologia.codigo).toLowerCase();
            const nombre = metodologia.nombre.toLowerCase();
            const descripcion = metodologia.descripcion.toLowerCase();

            // CP-093: Buscar por código o nombre.
            const coincideBusqueda =
                codigo.includes(busqueda) || nombre.includes(busqueda);

            // CP-094: Combinar los filtros.
            const coincideCodigo = codigo.includes(codigoBuscado);
            const coincideNombre = nombre.includes(nombreBuscado);
            const coincideDescripcion = descripcion.includes(descripcionBuscada);

            return coincideBusqueda &&
                   coincideCodigo &&
                   coincideNombre &&
                   coincideDescripcion;
        });
    }

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

            
            // HU-40: Aplicar los criterios de búsqueda y filtrado.
            const metodologiasFiltradas = filtrarMetodologias(metodologias);

            // CP-095: Informar cuando no existen coincidencias.
            if (metodologiasFiltradas.length === 0) {
                tabla.hidden = true;

                mensajeListado.textContent =
                    "No se encontraron metodologías que coincidan con los criterios de búsqueda.";

                mensajeListado.style.color =
                    "var(--color-texto-secundario)";

                return;
            }

            

            // CP-091: Mostrar las metodologías registradas.
            tabla.hidden = false;
            mensajeListado.textContent = "";

            metodologiasFiltradas.forEach(function (metodologia) {

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
    // HU-40: Ejecutar búsqueda al presionar el botón.
    formularioFiltros.addEventListener("submit", function (evento) {

        evento.preventDefault();

        cargarMetodologias();

    });

        // HU-40: Limpiar los filtros y mostrar todos los registros.
    formularioFiltros.addEventListener("reset", function (evento) {

        evento.preventDefault();

        campoBusqueda.value = "";
        filtroCodigo.value = "";
        filtroNombre.value = "";
        filtroDescripcion.value = "";

        cargarMetodologias();

    });

    cargarMetodologias();

});
