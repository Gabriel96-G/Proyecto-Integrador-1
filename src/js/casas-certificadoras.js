
document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formulario-casa-certificadora");
    const campoCodigo = document.getElementById("codigo");
    const campoNombre = document.getElementById("nombre");

    const errorCodigo = document.getElementById("error-codigo");
    const errorNombre = document.getElementById("error-nombre");
    const mensajeRegistro = document.getElementById("mensaje-registro");

    const claveAlmacenamiento = "casasCertificadoras";

    function limpiarMensajes() {
        errorCodigo.textContent = "";
        errorNombre.textContent = "";
        mensajeRegistro.textContent = "";
    }

    function normalizarCodigo(codigo) {
        return codigo.replace(/^0+(?=\d)/, "");
    }

    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();
        limpiarMensajes();

        const codigo = campoCodigo.value.trim();
        const nombre = campoNombre.value.trim();

        let datosValidos = true;

        // Validar que el código sea obligatorio y numérico
        if (codigo === "") {
            errorCodigo.textContent = "El código es obligatorio.";
            datosValidos = false;
        } else if (!/^\d+$/.test(codigo)) {
            errorCodigo.textContent = "El código debe contener únicamente números.";
            datosValidos = false;
        }

        // Validar que el nombre sea obligatorio
        if (nombre === "") {
            errorNombre.textContent = "El nombre es obligatorio.";
            datosValidos = false;
        }

        if (!datosValidos) {
            return;
        }

        // Obtener las casas certificadoras registradas
        let casasCertificadoras;

        try {
            const datosGuardados = localStorage.getItem(claveAlmacenamiento);

            casasCertificadoras = datosGuardados
                ? JSON.parse(datosGuardados)
                : [];

            if (!Array.isArray(casasCertificadoras)) {
                throw new Error("Formato de datos inválido");
            }
        } catch (error) {
            mensajeRegistro.textContent = "No fue posible leer los registros guardados.";
            return;
        }

        // Verificar códigos duplicados
        const codigoDuplicado = casasCertificadoras.some(function (casa) {
            return normalizarCodigo(String(casa.codigo)) === normalizarCodigo(codigo);
        });

        // Verificar nombres duplicados
        const nombreDuplicado = casasCertificadoras.some(function (casa) {
            return String(casa.nombre).trim().toLowerCase() === nombre.toLowerCase();
        });

        if (codigoDuplicado) {
            errorCodigo.textContent = "Ya existe una casa certificadora con este código.";
            datosValidos = false;
        }

        if (nombreDuplicado) {
            errorNombre.textContent = "Ya existe una casa certificadora con este nombre.";
            datosValidos = false;
        }

        if (!datosValidos) {
            return;
        }

        // Crear el registro
        const nuevaCasa = {
            codigo: codigo,
            nombre: nombre
        };

        casasCertificadoras.push(nuevaCasa);

        // Guardar los datos en el navegador
        try {
            localStorage.setItem(
                claveAlmacenamiento,
                JSON.stringify(casasCertificadoras)
            );

            formulario.reset();

            mensajeRegistro.textContent = "Casa certificadora registrada correctamente.";
            mensajeRegistro.style.color = "var(--color-confirmacion)";

        } catch (error) {
            mensajeRegistro.textContent = "No fue posible guardar la casa certificadora.";
            mensajeRegistro.style.color = "var(--color-error)";
        }
    });

    formulario.addEventListener("reset", function () {
        limpiarMensajes();
    });

});
