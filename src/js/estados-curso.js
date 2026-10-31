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
    if (botonGuardar.disabled) return;
    campoCodigo.classList.remove("error");
    campoNombre.classList.remove("error");
    campoDescripcion.classList.remove("error");

    mensajeCodigo.textContent = "";
    mensajeNombre.textContent = "";
    mensajeDescripcion.textContent = "";
    mensajeResultado.hidden = true;
}

// Al editar, carga los datos en el mismo formulario de registro.
if (modificando) {
    document.title = "Modificar estado del curso";
    document.getElementById("titulo-estado").textContent = "Modificar estado del curso";
    document.getElementById("ruta-estado").textContent = "Catálogos / Estados del curso / Modificar registro";
    botonGuardar.textContent = "Guardar cambios";

    try {
        const estado = SGC.Datos.leer("estadosCurso").find(function (registro) {
            return String(registro.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        });

        if (estado) {
            campoCodigo.value = estado.codigo;
            campoNombre.value = estado.nombre;
            campoDescripcion.value = estado.descripcion || "";
        } else {
            mostrarAviso("No se encontró el estado. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
        }
    } catch (error) {
        mostrarAviso("No se pudieron cargar los datos. Vuelva al listado y revise los registros.", "error");
        botonGuardar.disabled = true;
    }
}

formulario.addEventListener("submit", function (evento) {
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

    try {
        // Vuelve a leer los datos para conservar los demás registros.
        const estadosCurso = SGC.Datos.leer("estadosCurso");
        const indice = modificando ? estadosCurso.findIndex(function (estado) {
            return String(estado.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        }) : -1;

        if (modificando && indice === -1) {
            mostrarAviso("El estado ya no está disponible. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
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
            return;
        }

        const datos = { codigo: codigo, nombre: nombre, descripcion: descripcion };

        if (modificando) {
            const anterior = estadosCurso[indice];
            // Conserva la referencia que ya utilizan los cursos.
            estadosCurso[indice] = { ...anterior, ...datos, id: anterior.id || anterior.codigo };
        } else {
            estadosCurso.push({ ...datos, id: crypto.randomUUID() });
        }

        localStorage.setItem("estadosCurso", JSON.stringify(estadosCurso));

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
        mostrarAviso("No se pudo guardar el estado. Revise los datos guardados o el espacio disponible.", "error");
    }
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);
