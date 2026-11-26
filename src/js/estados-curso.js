// HU-23 y HU-26: Registro y modificación de estados del curso.

const formulario = document.getElementById("formulario-estado");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDescripcion = document.getElementById("descripcion");
const botonGuardar = document.getElementById("guardar-estado");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDescripcion = document.getElementById("descripcion-mensaje");
const mensajeResultado = document.getElementById("mensaje-resultado");

// El enlace Editar envía el código del estado en la dirección de la página.
let codigoOriginal = new URLSearchParams(window.location.search).get("codigo");
const modificando = codigoOriginal !== null;

// Muestra un error debajo de un campo.
function mostrarError(campo, lugarMensaje, texto) {
    campo.classList.add("is-invalid");
    campo.setAttribute("aria-invalid", "true");
    SGC.Idioma.texto(lugarMensaje, texto);
}

// Muestra el mensaje general del formulario.
function mostrarAviso(texto, tipo) {
    SGC.Idioma.texto(mensajeResultado, texto);
    mensajeResultado.className = tipo === "error"
        ? "alert alert-danger aviso aviso--error"
        : "alert alert-success aviso aviso--confirmacion";
    mensajeResultado.hidden = false;
}

// Borra los errores anteriores.
function limpiarMensajes() {
    if (botonGuardar.disabled) return;
    formulario.querySelectorAll(".is-invalid").forEach(campo => {
        campo.classList.remove("is-invalid");
        campo.removeAttribute("aria-invalid");
    });

    SGC.Idioma.texto(mensajeCodigo, "");
    SGC.Idioma.texto(mensajeNombre, "");
    SGC.Idioma.texto(mensajeDescripcion, "");
    mensajeResultado.hidden = true;
}

// Al editar, carga los datos en el mismo formulario de registro.
async function cargarEstado() {
    if (!modificando) return;
    botonGuardar.disabled = true;
    SGC.Idioma.texto(document.querySelector('title'), "Modificar estado del curso");
    SGC.Idioma.texto(document.getElementById("titulo-estado"), "Modificar estado del curso");
    SGC.Idioma.texto(document.getElementById("ruta-estado"), "Catálogos / Estados del curso / Modificar registro");
    SGC.Idioma.texto(botonGuardar, "Guardar cambios");

    try {
        const estado = (await SGC.EstadosCurso.listar()).find(function (registro) {
            return String(registro.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        });

        if (estado) {
            botonGuardar.disabled = false;
            campoCodigo.value = estado.codigo;
            campoNombre.value = estado.nombre;
            campoDescripcion.value = estado.descripcion || "";
        } else {
            mostrarAviso("No se encontró el estado. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
        }
    } catch (error) {
        mostrarAviso(error.sinRuta ? error.message : "No se pudieron cargar los datos. Vuelva al listado y revise los registros.", "error");
        botonGuardar.disabled = true;
    }
}

cargarEstado();

formulario.addEventListener("submit", async function (evento) {
    evento.preventDefault();
    if (botonGuardar.disabled) return;
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

    if (hayErrores) {
        mostrarAviso("Revise los campos señalados.", "error");
        formulario.querySelector(".is-invalid").focus();
        return;
    }

    botonGuardar.disabled = true;
    let bloquear = false;
    try {
        // Vuelve a leer los datos para conservar los demás registros.
        const estadosCurso = await SGC.EstadosCurso.listar();
        const indice = modificando ? estadosCurso.findIndex(function (estado) {
            return String(estado.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        }) : -1;

        if (modificando && indice === -1) {
            mostrarAviso("El estado ya no está disponible. Vuelva al listado.", "error");
            bloquear = true;
            return;
        }

        // Al editar, excluye el propio estado de la búsqueda de duplicados.
        const codigoRepetido = estadosCurso.some(function (estado, posicion) {
            return posicion !== indice && String(estado.codigo).trim().toUpperCase() === codigo;
        });

        const nombreRepetido = estadosCurso.some(function (estado, posicion) {
            return posicion !== indice && estado.nombre.trim().toLowerCase() === nombre.toLowerCase();
        });

        if (codigo !== "" && codigoRepetido) {
            mostrarError(campoCodigo, mensajeCodigo, "Ya existe un estado con este código.");
            hayErrores = true;
        }

        if (nombre !== "" && nombreRepetido) {
            mostrarError(campoNombre, mensajeNombre, "Ya existe un estado con este nombre.");
            hayErrores = true;
        }

        if (hayErrores) {
            mostrarAviso("Revise los campos señalados.", "error");
            formulario.querySelector(".is-invalid").focus();
            return;
        }

        const datos = { codigo: codigo, nombre: nombre, descripcion: descripcion };

        await SGC.EstadosCurso.guardar(datos, estadosCurso[indice]);

        if (modificando) {
            codigoOriginal = codigo;
            window.history.replaceState(null, "", "?codigo=" + encodeURIComponent(codigo));
        } else {
            formulario.reset();
        }

        mostrarMensajeExito(
            modificando ? "Los cambios del estado se guardaron correctamente." :
                "El estado del curso se registró correctamente.",
            "estados-curso-listado.html"
        );
    } catch (error) {
        mostrarAviso(error.sinRuta || error.status === 409 ? error.message : "No se pudo guardar el estado. Intente nuevamente.", "error");
    } finally {
        botonGuardar.disabled = bloquear;
    }
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);
