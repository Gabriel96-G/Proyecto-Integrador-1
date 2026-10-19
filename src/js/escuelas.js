// HU-13: Registro de escuelas

const formulario = document.getElementById("formulario-escuela");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDirector = document.getElementById("director-asociado");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDirector = document.getElementById("director-mensaje");
const mensajeResultado = document.getElementById("mensaje-resultado");

// Muestra un error debajo de un campo.
function mostrarError(campo, lugarMensaje, texto) {
    campo.classList.add("error");
    lugarMensaje.textContent = texto;
}

// Muestra el mensaje general del formulario.
function mostrarAviso(texto, tipo) {
    mensajeResultado.textContent = texto;
    mensajeResultado.className = "aviso aviso--" + tipo;
    mensajeResultado.hidden = false;
}

// Borra los errores anteriores.
function limpiarMensajes() {
    campoCodigo.classList.remove("error");
    campoNombre.classList.remove("error");
    campoDirector.classList.remove("error");

    mensajeCodigo.textContent = "";
    mensajeNombre.textContent = "";
    mensajeDirector.textContent = "";
    mensajeResultado.hidden = true;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarMensajes();

    const codigo = campoCodigo.value.trim().toUpperCase();
    const nombre = campoNombre.value.trim();
    const director = campoDirector.value;
    let hayErrores = false;

    // Valida los campos obligatorios.
    if (codigo === "") {
        mostrarError(campoCodigo, mensajeCodigo, "Ingrese el código.");
        hayErrores = true;
    }

    if (nombre === "") {
        mostrarError(campoNombre, mensajeNombre, "Ingrese el nombre.");
        hayErrores = true;
    }

    if (director === "") {
        mostrarError(
            campoDirector,
            mensajeDirector,
            "Seleccione un director."
        );
        hayErrores = true;
    }

    // Obtiene las escuelas guardadas.
    const escuelas =
        JSON.parse(localStorage.getItem("escuelas")) || [];

    // Comprueba que el código no esté repetido.
    const codigoRepetido = escuelas.some(function (escuela) {
        return escuela.codigo.toUpperCase() === codigo;
    });

    if (codigo !== "" && codigoRepetido) {
        mostrarError(
            campoCodigo,
            mensajeCodigo,
            "Ya existe una escuela con este código."
        );
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarAviso("Revise los campos señalados.", "error");
        return;
    }

    // Guarda la nueva escuela.
    escuelas.push({
        codigo: codigo,
        nombre: nombre,
        directorAsociado: director
    });

    localStorage.setItem("escuelas", JSON.stringify(escuelas));

    formulario.reset();

    mostrarAviso(
        "La escuela se registró correctamente.",
        "confirmacion"
    );
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);