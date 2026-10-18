
document.addEventListener("DOMContentLoaded", function () {

    const tabla = document.getElementById("tabla-casas-certificadoras");
    const cuerpoTabla = document.getElementById("cuerpo-tabla-casas");
    const mensajeListado = document.getElementById("mensaje-listado");

    const claveAlmacenamiento = "casasCertificadoras";

    function cargarCasasCertificadoras() {

        // Ocultar la tabla mientras se cargan los registros
        tabla.hidden = true;
        tabla.style.display = "none";
        cuerpoTabla.innerHTML = "";
        mensajeListado.textContent = "";

        let casasCertificadoras;

        // Obtener los registros guardados desde HU-48
        try {
            const datosGuardados = localStorage.getItem(claveAlmacenamiento);

            casasCertificadoras = datosGuardados
                ? JSON.parse(datosGuardados)
                : [];

            if (!Array.isArray(casasCertificadoras)) {
                throw new Error("Formato de datos inválido");
            }

        } catch (error) {
            mensajeListado.textContent =
                "No fue posible cargar las casas certificadoras.";
            return;
        }

        // Mostrar mensaje si no existen registros
        if (casasCertificadoras.length === 0) {
            mensajeListado.textContent =
                "No hay casas certificadoras registradas.";
            return;
        }

        // Crear una fila para cada casa certificadora
        casasCertificadoras.forEach(function (casa) {

            const fila = document.createElement("tr");

            const celdaCodigo = document.createElement("td");
            celdaCodigo.textContent = casa.codigo;

            const celdaNombre = document.createElement("td");
            celdaNombre.textContent = casa.nombre;

            fila.appendChild(celdaCodigo);
            fila.appendChild(celdaNombre);

            cuerpoTabla.appendChild(fila);
        });

        // Mostrar la tabla con los registros
        tabla.hidden = false;
        tabla.style.display = "table";

    }

    cargarCasasCertificadoras();

});
