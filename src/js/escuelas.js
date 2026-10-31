// HU-13 y HU-16: Registro y modificación de escuelas.

const formulario = document.getElementById("formulario-escuela");
const campoCodigo = document.getElementById("codigo");
const campoNombre = document.getElementById("nombre");
const campoDirector = document.getElementById("director-asociado");
const botonGuardar = document.getElementById("guardar-escuela");

const mensajeCodigo = document.getElementById("codigo-mensaje");
const mensajeNombre = document.getElementById("nombre-mensaje");
const mensajeDirector = document.getElementById("director-mensaje");
const mensajeResultado = document.getElementById("mensaje-resultado");

// El enlace Editar envía el código de la escuela en la dirección de la página.
let codigoOriginal = new URLSearchParams(window.location.search).get("codigo");
const modificando = codigoOriginal !== null;

// Muestra un error debajo de un campo.
function mostrarError(campo, lugarMensaje, texto) {
    campo.classList.add("error");
    SGC.Idioma.texto(lugarMensaje, texto);
}

// Muestra el mensaje general del formulario.
function mostrarAviso(texto, tipo) {
    SGC.Idioma.texto(mensajeResultado, texto);
    mensajeResultado.className = "aviso aviso--" + tipo;
    mensajeResultado.hidden = false;
}

// Borra los errores anteriores.
function limpiarMensajes() {
    if (botonGuardar.disabled) return;
    campoCodigo.classList.remove("error");
    campoNombre.classList.remove("error");
    campoDirector.classList.remove("error");

    SGC.Idioma.texto(mensajeCodigo, "");
    SGC.Idioma.texto(mensajeNombre, "");
    SGC.Idioma.texto(mensajeDirector, "");
    mensajeResultado.hidden = true;
}

// Agrega un director al selector sin repetir las opciones existentes.
function agregarDirector(nombre) {
    const existe = Array.from(campoDirector.options).some(function (opcion) {
        return opcion.value === nombre;
    });

    if (nombre && !existe) {
        const opcion = document.createElement("option");
        opcion.value = nombre;
        opcion.textContent = nombre;
        campoDirector.appendChild(opcion);
    }
}

try {
    // Usa los directores activos registrados en el módulo de usuarios.
    const usuarios = SGC.Datos.leer("usuarios");
    usuarios.forEach(function (usuario) {
        if (usuario.rol === "director" && (!usuario.estado || usuario.estado === "activo")) {
            agregarDirector([usuario.nombre, usuario.primerApellido, usuario.segundoApellido]
                .filter(Boolean).join(" "));
        }
    });

    if (modificando) {
        SGC.Idioma.texto(document.querySelector('title'), "Modificar escuela");
        SGC.Idioma.texto(document.getElementById("titulo-escuela"), "Modificar escuela");
        SGC.Idioma.texto(document.getElementById("ruta-escuela"), "Catálogos / Escuelas / Modificar registro");
        SGC.Idioma.texto(botonGuardar, "Guardar cambios");

        const escuela = SGC.Datos.leer("escuelas").find(function (registro) {
            return String(registro.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        });

        if (escuela) {
            campoCodigo.value = escuela.codigo;
            campoNombre.value = escuela.nombre;
            // Conserva también los directores guardados por la versión anterior.
            agregarDirector(escuela.directorAsociado);
            campoDirector.value = escuela.directorAsociado || "";
        } else {
            mostrarAviso("No se encontró la escuela. Vuelva al listado.", "error");
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

    try {
        // Vuelve a leer los datos para conservar los demás registros.
        const escuelas = SGC.Datos.leer("escuelas");
        const indice = modificando ? escuelas.findIndex(function (escuela) {
            return String(escuela.codigo).trim().toUpperCase() === codigoOriginal.trim().toUpperCase();
        }) : -1;

        if (modificando && indice === -1) {
            mostrarAviso("La escuela ya no está disponible. Vuelva al listado.", "error");
            botonGuardar.disabled = true;
            return;
        }

        // Al editar, no cuenta como repetido el código de la propia escuela.
        const codigoRepetido = escuelas.some(function (escuela, posicion) {
            return posicion !== indice && String(escuela.codigo).trim().toUpperCase() === codigo;
        });

        if (codigo !== "" && codigoRepetido) {
            mostrarError(campoCodigo, mensajeCodigo, "Ya existe una escuela con este código.");
            hayErrores = true;
        }

        if (hayErrores) {
            mostrarAviso("Revise los campos señalados.", "error");
            return;
        }

        const datos = { codigo: codigo, nombre: nombre, directorAsociado: director };

        if (modificando) {
            const anterior = escuelas[indice];
            // Conserva el identificador que ya utilizan las carreras y los cursos.
            escuelas[indice] = { ...anterior, ...datos, id: anterior.id || anterior.codigo };
        } else {
            escuelas.push({ ...datos, id: crypto.randomUUID() });
        }

        localStorage.setItem("escuelas", JSON.stringify(escuelas));

        if (modificando) {
            codigoOriginal = codigo;
            window.history.replaceState(null, "", "?codigo=" + encodeURIComponent(codigo));
            mostrarAviso("Los cambios de la escuela se guardaron correctamente.", "confirmacion");
        } else {
            formulario.reset();
            mostrarAviso("La escuela se registró correctamente.", "confirmacion");
            mostrarMensajeExito("La escuela se guardó con éxito.", "escuelas-listado.html");
        }
    } catch (error) {
        mostrarAviso("No se pudo guardar la escuela. Revise los datos guardados o el espacio disponible.", "error");
    }
});

// Limpia los mensajes cuando se modifica un campo.
formulario.addEventListener("input", limpiarMensajes);
