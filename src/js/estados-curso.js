// HU-23: Registro de estados del curso

const formulario = document.getElementById("formulario-estado");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDescripcion = document.getElementById("descripcion");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDescripcion = document.getElementById("descripcion-mensaje");
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
    campoDescripcion.classList.remove("error");

    mensajeCodigo.textContent = "";
    mensajeNombre.textContent = "";
    mensajeDescripcion.textContent = "";
    mensajeResultado.hidden = true;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    limpiarMensajes();

    const codigo = campoCodigo.value.trim().toUpperCase();
    const nombre = campoNombre.value.trim();
    const descripcion = campoDescripcion.value.trim();
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

    if (descripcion === "") {
        mostrarError(
            campoDescripcion,
            mensajeDescripcion,
            "Ingrese la descripción."
        );
        hayErrores = true;
    }

    // Obtiene los estados guardados.
    const estadosCurso =
        JSON.parse(localStorage.getItem("estadosCurso")) || [];

    // Comprueba que el código y el nombre no estén repetidos.
    const codigoRepetido = estadosCurso.some(function (estado) {
        return estado.codigo.toUpperCase() === codigo;
    });

    const nombreRepetido = estadosCurso.some(function (estado) {
        return estado.nombre.toLowerCase() === nombre.toLowerCase();
    });

    if (codigo !== "" && codigoRepetido) {
        mostrarError(
            campoCodigo,
            mensajeCodigo,
            "Ya existe un estado con este código."
        );
        hayErrores = true;
    }

    if (nombre !== "" && nombreRepetido) {
        mostrarError(
            campoNombre,
            mensajeNombre,
            "Ya existe un estado con este nombre."
        );
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarAviso("Revise los campos señalados.", "error");
        return;
    }

    // Guarda el nuevo estado del curso.
    estadosCurso.push({
        codigo: codigo,
        nombre: nombre,
        descripcion: descripcion
    });

    localStorage.setItem("estadosCurso", JSON.stringify(estadosCurso));

    formulario.reset();

    mostrarAviso(
        "El estado del curso se registró correctamente.",
        "confirmacion"
    );
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);
