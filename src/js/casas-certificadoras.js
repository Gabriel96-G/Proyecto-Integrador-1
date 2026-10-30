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

  // HU-51: Identificar si el formulario se utiliza para modificar.
  const parametros = new URLSearchParams(window.location.search);
  let codigoOriginal = parametros.get("codigo");
  const modoEdicion = codigoOriginal !== null;

  const tituloFormulario = document.getElementById("titulo-casa-certificadora");
  const rutaFormulario = document.getElementById("ruta-casa-certificadora");
  const botonGuardar = document.getElementById("boton-guardar-casa");

  // Normaliza los códigos para evitar duplicados como 01 y 1.
  function normalizarCodigo(codigo) {
    return String(codigo).replace(/^0+(?=\d)/, "");
  }

  // Normaliza los nombres antes de compararlos.
  function normalizarNombre(nombre) {
    return String(nombre).trim().replace(/\s+/g, " ").toLocaleLowerCase("es");
  }

  // Muestra un error debajo del campo correspondiente.
  function mostrarError(campo, lugarMensaje, texto) {
    campo.classList.add("error");
    campo.setAttribute("aria-invalid", "true");
    lugarMensaje.textContent = texto;
  }

  // Muestra un aviso general de error o confirmación.
  function mostrarAviso(texto, tipo) {
    mensajeResultado.textContent = texto;
    mensajeResultado.className = "aviso aviso--" + tipo;
    mensajeResultado.hidden = false;
  }

  // Elimina los mensajes y los estilos de error anteriores.
  function limpiarMensajes() {
    campoCodigo.classList.remove("error");
    campoNombre.classList.remove("error");

    campoCodigo.removeAttribute("aria-invalid");
    campoNombre.removeAttribute("aria-invalid");

    mensajeCodigo.textContent = "";
    mensajeNombre.textContent = "";

    mensajeResultado.textContent = "";
    mensajeResultado.className = "aviso";
    mensajeResultado.hidden = true;
  }

  // HU-51: Cargar los datos de la casa seleccionada para modificar.
  if (modoEdicion) {
    try {
      const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);
      const casasCertificadoras = datosGuardados
        ? JSON.parse(datosGuardados)
        : [];

      if (!Array.isArray(casasCertificadoras)) {
        throw new Error("Formato de datos inválido.");
      }

      const casaSeleccionada = casasCertificadoras.find(function (casa) {
        return (
          normalizarCodigo(casa.codigo) === normalizarCodigo(codigoOriginal)
        );
      });

      if (!casaSeleccionada) {
        throw new Error("No se encontró la casa certificadora.");
      }

      campoCodigo.value = casaSeleccionada.codigo;
      campoNombre.value = casaSeleccionada.nombre;

      tituloFormulario.textContent = "Modificar casa certificadora";
      rutaFormulario.textContent =
        "Catálogos / Casas certificadoras / Modificar registro";
      botonGuardar.textContent = "Guardar cambios";
    } catch (error) {
      console.error("Error al cargar casa certificadora:", error);

      mostrarAviso(
        "No fue posible cargar la casa certificadora seleccionada.",
        "error",
      );

      botonGuardar.disabled = true;
    }
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
        "Ingrese un código numérico válido.",
      );
      hayErrores = true;
    }

    // Validar el nombre obligatorio.
    if (nombre === "") {
      mostrarError(campoNombre, mensajeNombre, "Ingrese el nombre.");
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

      casasCertificadoras = datosGuardados ? JSON.parse(datosGuardados) : [];

      if (!Array.isArray(casasCertificadoras)) {
        throw new Error("Formato de datos inválido.");
      }
    } catch (error) {
      console.error("Error al leer casas certificadoras:", error);

      mostrarAviso(
        "No fue posible leer las casas certificadoras registradas.",
        "error",
      );
      return;
    }

    // HU-51: Identificar el registro que estamos modificando.
    const indiceOriginal = modoEdicion
      ? casasCertificadoras.findIndex(function (casa) {
          return (
            normalizarCodigo(casa.codigo) === normalizarCodigo(codigoOriginal)
          );
        })
      : -1;

    if (modoEdicion && indiceOriginal === -1) {
      mostrarAviso(
        "La casa certificadora que intenta modificar ya no existe.",
        "error",
      );
      return;
    }

    // HU-51: Validar códigos duplicados, excluyendo el registro actual.
    const codigoDuplicado = casasCertificadoras.some(function (casa, indice) {
      return (
        indice !== indiceOriginal &&
        normalizarCodigo(casa.codigo) === normalizarCodigo(codigo)
      );
    });

    // HU-51: Validar nombres duplicados, excluyendo el registro actual.
    const nombreDuplicado = casasCertificadoras.some(function (casa, indice) {
      return (
        indice !== indiceOriginal &&
        normalizarNombre(casa.nombre) === normalizarNombre(nombre)
      );
    });

    if (codigoDuplicado) {
      mostrarError(
        campoCodigo,
        mensajeCodigo,
        "Ya existe una casa certificadora con este código.",
      );
      hayErrores = true;
    }

    if (nombreDuplicado) {
      mostrarError(
        campoNombre,
        mensajeNombre,
        "Ya existe una casa certificadora con este nombre.",
      );
      hayErrores = true;
    }

    // Mostrar el mensaje general cuando existen duplicados.
    if (hayErrores) {
      mostrarAviso("Revise los campos señalados.", "error");
      return;
    }

    // HU-51: Conservar el código anterior para actualizar cursos relacionados.
    const codigoAnterior = modoEdicion
      ? casasCertificadoras[indiceOriginal].codigo
      : null;

    // HU-51: Modificar la casa existente o registrar una nueva.
    if (modoEdicion) {
      casasCertificadoras[indiceOriginal] = {
        ...casasCertificadoras[indiceOriginal],
        codigo: codigo,
        nombre: nombre,
      };
    } else {
      // HU-48: Registrar una casa certificadora nueva.
      const nuevaCasa = {
        codigo: codigo,
        nombre: nombre,
      };

      casasCertificadoras.push(nuevaCasa);
    }

    // Guardar los datos en localStorage.
    try {
      // HU-51: Leer los cursos cuando cambia el código de la casa.
      let cursosActualizados = null;

      if (modoEdicion && codigoAnterior !== codigo) {
        const datosCursos = localStorage.getItem("cursos");

        if (datosCursos !== null) {
          cursosActualizados = JSON.parse(datosCursos);

          if (!Array.isArray(cursosActualizados)) {
            throw new Error("El formato de los cursos no es válido.");
          }
          // HU-51: Actualizar la referencia en los cursos relacionados.
          cursosActualizados.forEach(function (curso) {
            if (
              curso &&
              curso.casaCertificadora != null &&
              normalizarCodigo(curso.casaCertificadora) ===
                normalizarCodigo(codigoAnterior)
            ) {
              curso.casaCertificadora = codigo;
            }
          });
        }
      }

      // HU-51: Respaldar las casas antes de guardar los cambios.
      const respaldoCasas = localStorage.getItem(CLAVE_ALMACENAMIENTO);

      localStorage.setItem(
        CLAVE_ALMACENAMIENTO,
        JSON.stringify(casasCertificadoras),
      );

      // HU-51: Guardar los cursos y restaurar las casas si ocurre un error.
      if (cursosActualizados !== null) {
        try {
          localStorage.setItem("cursos", JSON.stringify(cursosActualizados));
        } catch (error) {
          // Intentar recuperar las casas certificadoras originales.
          try {
            if (respaldoCasas === null) {
              localStorage.removeItem(CLAVE_ALMACENAMIENTO);
            } else {
              localStorage.setItem(CLAVE_ALMACENAMIENTO, respaldoCasas);
            }
          } catch (errorRestauracion) {
            console.error(
              "No fue posible restaurar las casas certificadoras:",
              errorRestauracion,
            );
          }

          throw error;
        }
      }

      // HU-51: Actualizar el código de referencia después de guardar.
      if (modoEdicion) {
        codigoOriginal = codigo;

        // Actualizar la dirección del formulario con el nuevo código.
        try {
          const direccionActualizada = new URL(window.location.href);
          direccionActualizada.searchParams.set("codigo", codigo);

          window.history.replaceState(null, "", direccionActualizada.href);
        } catch (errorDireccion) {
          console.warn(
            "No fue posible actualizar la dirección del formulario:",
            errorDireccion,
          );
        }
      }

      // HU-51: Conservar los campos cuando se modifica un registro.
      if (!modoEdicion) {
        formulario.reset();
      }

      limpiarMensajes();

      mostrarAviso(
        modoEdicion
          ? "La casa certificadora se modificó correctamente."
          : "La casa certificadora se registró correctamente.",
        "confirmacion",
      );

      mostrarMensajeExito(
        modoEdicion
          ? "La casa certificadora se modificó con éxito."
          : "La casa certificadora se guardó con éxito.",
        "casas-certificadoras-listado.html",
      );
    } catch (error) {
      console.error("Error al guardar casa certificadora:", error);

      mostrarAviso("No fue posible guardar la casa certificadora.", "error");
    }
  });

  // Limpiar mensajes cuando el usuario modifica los campos.
  formulario.addEventListener("input", limpiarMensajes);
});
