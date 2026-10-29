// HU-43: Registro de niveles de complejidad

const formulario = document.getElementById("formulario-nivel");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDescripcion = document.getElementById("descripcion");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDescripcion = document.getElementById("descripcion-mensaje");
const mensajeResultado = document.getElementById("mensaje-resultado");

// Agrega los valores iniciales solicitados si el catálogo todavía no existe.
function crearNivelesIniciales() {
    if (localStorage.getItem("nivelesComplejidad") === null) {
        const nivelesIniciales = [
            { codigo: "1", nombre: "Básico", descripcion: "Nivel básico." },
            { codigo: "2", nombre: "Intermedio", descripcion: "Nivel intermedio." },
            { codigo: "3", nombre: "Avanzado", descripcion: "Nivel avanzado." },
            { codigo: "4", nombre: "Certificación", descripcion: "Nivel de certificación." },
            { codigo: "5", nombre: "Nivel variable", descripcion: "Nivel definido según el curso." }
        ];

        localStorage.setItem(
            "nivelesComplejidad",
            JSON.stringify(nivelesIniciales)
        );
    }
}

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

    const codigo = campoCodigo.value.trim();
    const nombre = campoNombre.value.trim();
    const descripcion = campoDescripcion.value.trim();
    let hayErrores = false;

    // Valida los campos obligatorios.
    if (codigo === "" || !/^\d+$/.test(codigo)) {
        mostrarError(
            campoCodigo,
            mensajeCodigo,
            "Ingrese un código numérico válido."
        );
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

    // Obtiene los niveles guardados.
    const niveles =
        JSON.parse(localStorage.getItem("nivelesComplejidad")) || [];

    // Comprueba que el código y el nombre no estén repetidos.
    const codigoRepetido = niveles.some(function (nivel) {
        return nivel.codigo === codigo;
    });

    const nombreRepetido = niveles.some(function (nivel) {
        return nivel.nombre.toLowerCase() === nombre.toLowerCase();
    });

    if (codigo !== "" && codigoRepetido) {
        mostrarError(
            campoCodigo,
            mensajeCodigo,
            "Ya existe un nivel con este código."
        );
        hayErrores = true;
    }

    if (nombre !== "" && nombreRepetido) {
        mostrarError(
            campoNombre,
            mensajeNombre,
            "Ya existe un nivel con este nombre."
        );
        hayErrores = true;
    }

    if (hayErrores) {
        mostrarAviso("Revise los campos señalados.", "error");
        return;
    }

    // Guarda el nuevo nivel de complejidad.
    niveles.push({
        codigo: codigo,
        nombre: nombre,
        descripcion: descripcion
    });

    localStorage.setItem("nivelesComplejidad", JSON.stringify(niveles));

    formulario.reset();

    mostrarAviso(
        "El nivel de complejidad se registró correctamente.",
        "confirmacion"
    );
    mostrarMensajeExito("El nivel de complejidad se guardó con éxito.", "niveles-complejidad-listado.html");
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);

crearNivelesIniciales();
