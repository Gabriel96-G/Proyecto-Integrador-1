
/*
 * HU-38 - Registro de metodologías de aprendizaje
 * Proyecto Integrador 1 - Universidad CENFOTEC
 */

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formulario-metodologia");

    const campoCodigo = document.getElementById("codigo");
    const campoNombre = document.getElementById("nombre");
    const campoDescripcion = document.getElementById("descripcion");

    const errorCodigo = document.getElementById("error-codigo");
    const errorNombre = document.getElementById("error-nombre");
    const errorDescripcion = document.getElementById("error-descripcion");
    const mensajeResultado = document.getElementById("mensaje-resultado");

    // Nombre de la clave utilizada para almacenar los registros.
    const CLAVE_ALMACENAMIENTO = "metodologiasAprendizaje";

    // Normaliza nombres para realizar comparaciones.
    function normalizarNombre(nombre) {
        return nombre.trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
    }

    // Normaliza códigos numéricos para comparar valores como 01 y 1.
    function normalizarCodigo(codigo) {
        return String(codigo).replace(/^0+(?=\d)/, "");
    }

    // Limpia los mensajes anteriores.
    function limpiarMensajes() {
        errorCodigo.textContent = "";
        errorNombre.textContent = "";
        errorDescripcion.textContent = "";
        mensajeResultado.textContent = "";
        mensajeResultado.style.color = "";
    }

    // Se ejecuta al presionar Guardar metodología.
    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();
        limpiarMensajes();

        const codigo = campoCodigo.value.trim();
        const nombre = campoNombre.value.trim();
        const descripcion = campoDescripcion.value.trim();

        let formularioValido = true;

        // Validación del código numérico.
        if (!/^\d+$/.test(codigo)) {
            errorCodigo.textContent = "Ingrese un código numérico válido.";
            formularioValido = false;
        }

        // Validación del nombre.
        if (nombre === "") {
            errorNombre.textContent = "El nombre es obligatorio.";
            formularioValido = false;
        }

        // Validación de la descripción.
        if (descripcion === "") {
            errorDescripcion.textContent = "La descripción es obligatoria.";
            formularioValido = false;
        }

        if (!formularioValido) {
            return;
        }

        try {
            // Recupera los registros existentes.
            const metodologias = JSON.parse(
                localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]"
            );

            if (!Array.isArray(metodologias)) {
                throw new Error("El catálogo almacenado no es válido.");
            }

            // CP-090: Impedir códigos duplicados.
            const codigoDuplicado = metodologias.some(function (metodologia) {
                return normalizarCodigo(metodologia.codigo) === normalizarCodigo(codigo);
            });

            // CP-090: Impedir nombres duplicados.
            const nombreDuplicado = metodologias.some(function (metodologia) {
                return normalizarNombre(metodologia.nombre) === normalizarNombre(nombre);
            });

            if (codigoDuplicado) {
                errorCodigo.textContent = "Ya existe una metodología con este código.";
                formularioValido = false;
            }

            if (nombreDuplicado) {
                errorNombre.textContent = "Ya existe una metodología con este nombre.";
                formularioValido = false;
            }

            if (!formularioValido) {
                return;
            }

            // CP-089: Registrar una nueva metodología.
            const nuevaMetodologia = {
                codigo: codigo,
                nombre: nombre,
                descripcion: descripcion
            };

            metodologias.push(nuevaMetodologia);

            // Guarda los registros en el navegador.
            localStorage.setItem(
                CLAVE_ALMACENAMIENTO,
                JSON.stringify(metodologias)
            );

            formulario.reset();

            mensajeResultado.style.color = "var(--color-confirmacion)";

            mensajeResultado.textContent =
                "La metodología de aprendizaje se registró correctamente.";

        } catch (error) {
            console.error("Error al registrar la metodología:", error);

            mensajeResultado.textContent =
                "No fue posible guardar la metodología. Intente nuevamente.";
        }
    });

    // Limpia los mensajes al restablecer el formulario.
    formulario.addEventListener("reset", limpiarMensajes);
    
});
