
// HU-48: Registro de casas certificadoras
// Validaciones y mensajes basados en niveles-complejidad.js

document.addEventListener("DOMContentLoaded", function () {

    const formulario = document.getElementById("formulario-casa-certificadora");

    const campoCodigo = document.getElementById("codigo");
    const campoNombre = document.getElementById("nombre");

    const mensajeCodigo = document.getElementById("error-codigo");
    const mensajeNombre = document.getElementById("error-nombre");
    const mensajeResultado = document.getElementById("mensaje-registro");

    const CLAVE_ALMACENAMIENTO = "casasCertificadoras";

    // Normaliza los códigos para evitar duplicados como 01 y 1.
    function normalizarCodigo(codigo) {
        return String(codigo).replace(/^0+(?=\d)/, "");
    }

    // Normaliza los nombres antes de compararlos.
    function normalizarNombre(nombre) {
        return String(nombre).trim()
            .replace(/\s+/g, " ")
            .toLocaleLowerCase("es");
    }

    // Muestra un error debajo del campo correspondiente.
    function mostrarError(campo, lugarMensaje, texto) {
        campo.classList.add("error");
        campo.setAttribute("aria-invalid", "true");
        SGC.Idioma.texto(lugarMensaje, texto);
    }

    // Muestra un aviso general de error o confirmación.
    function mostrarAviso(texto, tipo) {
        SGC.Idioma.texto(mensajeResultado, texto);
        mensajeResultado.className = "aviso aviso--" + tipo;
        mensajeResultado.hidden = false;
    }

    // Elimina los mensajes y los estilos de error anteriores.
    function limpiarMensajes() {
        campoCodigo.classList.remove("error");
        campoNombre.classList.remove("error");

        campoCodigo.removeAttribute("aria-invalid");
        campoNombre.removeAttribute("aria-invalid");

        SGC.Idioma.texto(mensajeCodigo, "");
        SGC.Idioma.texto(mensajeNombre, "");

        SGC.Idioma.texto(mensajeResultado, "");
        mensajeResultado.className = "aviso";
        mensajeResultado.hidden = true;
    }

    // Procesa el registro cuando el usuario guarda.
    formulario.addEventListener("submit", function (evento) {

        evento.preventDefault();
        limpiarMensajes();

        const codigo = campoCodigo.value.trim();
        const nombre = campoNombre.value.trim();

        let hayErrores = false;

        // Validar el código obligatorio y numérico.
        if (codigo === "" || !/^\d+$/.test(codigo)) {
            mostrarError(
                campoCodigo,
                mensajeCodigo,
                "Ingrese un código numérico válido."
            );
            hayErrores = true;
        }

        // Validar el nombre obligatorio.
        if (nombre === "") {
            mostrarError(
                campoNombre,
                mensajeNombre,
                "Ingrese el nombre."
            );
            hayErrores = true;
        }

        // Detener el registro si existen errores iniciales.
        if (hayErrores) {
            mostrarAviso("Revise los campos señalados.", "error");
            return;
        }

        // Recuperar las casas certificadoras almacenadas.
        let casasCertificadoras;

        try {
            const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);

            casasCertificadoras = datosGuardados
                ? JSON.parse(datosGuardados)
                : [];

            if (!Array.isArray(casasCertificadoras)) {
                throw new Error("Formato de datos inválido.");
            }

        } catch (error) {
            console.error("Error al leer casas certificadoras:", error);

            mostrarAviso(
                "No fue posible leer las casas certificadoras registradas.",
                "error"
            );
            return;
        }

        // Comprobar que el código no esté duplicado.
        const codigoDuplicado = casasCertificadoras.some(function (casa) {
            return normalizarCodigo(casa.codigo) === normalizarCodigo(codigo);
        });

        // Comprobar que el nombre no esté duplicado.
        const nombreDuplicado = casasCertificadoras.some(function (casa) {
            return normalizarNombre(casa.nombre) === normalizarNombre(nombre);
        });

        if (codigoDuplicado) {
            mostrarError(
                campoCodigo,
                mensajeCodigo,
                "Ya existe una casa certificadora con este código."
            );
            hayErrores = true;
        }

        if (nombreDuplicado) {
            mostrarError(
                campoNombre,
                mensajeNombre,
                "Ya existe una casa certificadora con este nombre."
            );
            hayErrores = true;
        }

        // Mostrar el mensaje general cuando existen duplicados.
        if (hayErrores) {
            mostrarAviso("Revise los campos señalados.", "error");
            return;
        }

        // Crear la nueva casa certificadora.
        const nuevaCasa = {
            codigo: codigo,
            nombre: nombre
        };

        casasCertificadoras.push(nuevaCasa);

        // Guardar los datos en localStorage.
        try {
            localStorage.setItem(
                CLAVE_ALMACENAMIENTO,
                JSON.stringify(casasCertificadoras)
            );

            formulario.reset();
            limpiarMensajes();

            mostrarAviso(
                "La casa certificadora se registró correctamente.",
                "confirmacion"
            );
            mostrarMensajeExito("La casa certificadora se guardó con éxito.", "casas-certificadoras-listado.html");

        } catch (error) {
            console.error("Error al guardar casa certificadora:", error);

            mostrarAviso(
                "No fue posible guardar la casa certificadora.",
                "error"
            );
        }
    });

    // Limpiar mensajes cuando el usuario modifica los campos.
    formulario.addEventListener("input", limpiarMensajes);

});
