// HU-43 y HU-46: Registro y modificación de niveles de complejidad.

const formulario = document.getElementById("formulario-nivel");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDescripcion = document.getElementById("descripcion");
const botonGuardar = document.getElementById("guardar-nivel");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDescripcion = document.getElementById("descripcion-mensaje");
const mensajeResultado = document.getElementById("mensaje-resultado");

// El enlace Editar envía el código del nivel en la dirección de la página.
let codigoOriginal = new URLSearchParams(window.location.search).get("codigo");
const modificando = codigoOriginal !== null;

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
    if (botonGuardar.disabled) return;
    campoCodigo.classList.remove("error");
    campoNombre.classList.remove("error");
    campoDescripcion.classList.remove("error");

    mensajeCodigo.textContent = "";
    mensajeNombre.textContent = "";
    mensajeDescripcion.textContent = "";
    mensajeResultado.hidden = true;
}

// Reutiliza el formulario de registro para cargar el nivel seleccionado.
try {
    crearNivelesIniciales();

    if (modificando) {
        document.title = "Modificar nivel de complejidad";
        document.getElementById("titulo-nivel").textContent = "Modificar nivel de complejidad";
        document.getElementById("ruta-nivel").textContent = "Catálogos / Niveles de complejidad / Modificar registro";
        botonGuardar.textContent = "Guardar cambios";

        const nivel = SGC.Datos.leer("nivelesComplejidad").find(function (registro) {
            return String(registro.codigo).trim() === codigoOriginal.trim();
        });

        if (nivel) {
            campoCodigo.value = nivel.codigo;
            campoNombre.value = nivel.nombre;
            campoDescripcion.value = nivel.descripcion || "";
        } else {
            mostrarAviso("No se encontró el nivel. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
        }
    }
} catch (error) {
    mostrarAviso("No se pudieron cargar los datos. Vuelva al listado y revise los registros.", "error");
    botonGuardar.disabled = true;
}

formulario.addEventListener("submit", function (evento) {
    evento.preventDefault();
    if (botonGuardar.disabled) return;
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

    try {
        // Vuelve a leer los datos para conservar los demás niveles.
        const niveles = SGC.Datos.leer("nivelesComplejidad");
        const indice = modificando ? niveles.findIndex(function (nivel) {
            return String(nivel.codigo).trim() === codigoOriginal.trim();
        }) : -1;

        if (modificando && indice === -1) {
            mostrarAviso("El nivel ya no está disponible. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
            return;
        }

        // Al editar, no compara el nivel consigo mismo.
        const codigoRepetido = niveles.some(function (nivel, posicion) {
            return posicion !== indice && String(nivel.codigo).trim() === codigo;
        });

        const nombreRepetido = niveles.some(function (nivel, posicion) {
            return posicion !== indice && nivel.nombre.trim().toLowerCase() === nombre.toLowerCase();
        });

        if (codigo !== "" && codigoRepetido) {
            mostrarError(campoCodigo, mensajeCodigo, "Ya existe un nivel con este código.");
            hayErrores = true;
        }

        if (nombre !== "" && nombreRepetido) {
            mostrarError(campoNombre, mensajeNombre, "Ya existe un nivel con este nombre.");
            hayErrores = true;
        }

        if (hayErrores) {
            mostrarAviso("Revise los campos señalados.", "error");
            return;
        }

        const datos = { codigo: codigo, nombre: nombre, descripcion: descripcion };

        if (modificando) {
            const anterior = niveles[indice];
            // Conserva la referencia que ya utilizan los cursos.
            niveles[indice] = { ...anterior, ...datos, id: anterior.id || anterior.codigo };
        } else {
            niveles.push({ ...datos, id: crypto.randomUUID() });
        }

        localStorage.setItem("nivelesComplejidad", JSON.stringify(niveles));

        if (modificando) {
            codigoOriginal = codigo;
            window.history.replaceState(null, "", "?codigo=" + encodeURIComponent(codigo));
        } else {
            formulario.reset();
        }

        mostrarMensajeExito(
            modificando ? "Los cambios del nivel se guardaron correctamente." :
                "El nivel de complejidad se registró correctamente.",
            "niveles-complejidad-listado.html"
        );
    } catch (error) {
        mostrarAviso("No se pudo guardar el nivel. Revise los datos guardados o el espacio disponible.", "error");
    }
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);
