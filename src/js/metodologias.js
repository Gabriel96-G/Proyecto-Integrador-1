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

  // HU-41: Elementos del formulario para modificar metodologías.
  const tituloMetodologia = document.getElementById("titulo-metodologia");
  const botonGuardar = document.getElementById("boton-guardar-metodologia");
  const rutaMetodologia = document.getElementById("ruta-metodologia");

  // Obtiene el código de la metodología seleccionada para editar.
  const parametrosURL = new URLSearchParams(window.location.search);
  const codigoEdicion = parametrosURL.get("codigo");

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

  // HU-41: Cargar los datos de la metodología seleccionada.
  let codigoOriginal = null;

  if (codigoEdicion !== null) {
    tituloMetodologia.textContent = "Modificar metodología de aprendizaje";
    document.title = "Modificar metodología de aprendizaje";
    botonGuardar.textContent = "Guardar cambios";

    rutaMetodologia.textContent =
      "Catálogos / Metodologías de aprendizaje / Modificar registro";

    try {
      const metodologias = JSON.parse(
        localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]",
      );

      if (!Array.isArray(metodologias)) {
        throw new Error("El catálogo almacenado no es válido.");
      }

      const metodologiaSeleccionada = metodologias.find(function (metodologia) {
        return (
          normalizarCodigo(metodologia.codigo) ===
          normalizarCodigo(codigoEdicion)
        );
      });

      if (!metodologiaSeleccionada) {
        throw new Error("La metodología seleccionada no existe.");
      }

      codigoOriginal = String(metodologiaSeleccionada.codigo);

      campoCodigo.value = metodologiaSeleccionada.codigo;
      campoNombre.value = metodologiaSeleccionada.nombre;
      campoDescripcion.value = metodologiaSeleccionada.descripcion;
    } catch (error) {
      console.error("Error al cargar la metodología:", error);

      mensajeResultado.textContent =
        "No fue posible cargar la metodología seleccionada.";

      mensajeResultado.style.color = "var(--color-error)";
      botonGuardar.disabled = true;
    }
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
        localStorage.getItem(CLAVE_ALMACENAMIENTO) || "[]",
      );

      if (!Array.isArray(metodologias)) {
        throw new Error("El catálogo almacenado no es válido.");
      }

      // CP-090 y CP-097: Validar códigos duplicados.
      // En edición, no comparar el registro consigo mismo.
      const codigoDuplicado = metodologias.some(function (metodologia) {
        const esRegistroActual =
          codigoOriginal !== null &&
          normalizarCodigo(metodologia.codigo) ===
            normalizarCodigo(codigoOriginal);

        return (
          !esRegistroActual &&
          normalizarCodigo(metodologia.codigo) === normalizarCodigo(codigo)
        );
      });

      // CP-090 y CP-097: Validar nombres duplicados.
      // En edición, no comparar el registro consigo mismo.
      const nombreDuplicado = metodologias.some(function (metodologia) {
        const esRegistroActual =
          codigoOriginal !== null &&
          normalizarCodigo(metodologia.codigo) ===
            normalizarCodigo(codigoOriginal);

        return (
          !esRegistroActual &&
          normalizarNombre(metodologia.nombre) === normalizarNombre(nombre)
        );
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

      // HU-41 / CP-096: Modificar una metodología existente.
      if (codigoOriginal !== null) {
        const indiceOriginal = metodologias.findIndex(function (metodologia) {
          return (
            normalizarCodigo(metodologia.codigo) ===
            normalizarCodigo(codigoOriginal)
          );
        });

        if (indiceOriginal === -1) {
          mensajeResultado.style.color = "var(--color-error)";
          mensajeResultado.textContent =
            "La metodología seleccionada ya no existe.";
          return;
        }

        // Actualizar el registro existente sin crear otro.
        metodologias[indiceOriginal] = {
          ...metodologias[indiceOriginal],
          codigo: codigo,
          nombre: nombre,
          descripcion: descripcion,
        };
      } else {
        // HU-38 / CP-089: Registrar una metodología nueva.
        const nuevaMetodologia = {
          codigo: codigo,
          nombre: nombre,
          descripcion: descripcion,
        };

        metodologias.push(nuevaMetodologia);
      }

      // Guardar la información actualizada.
      localStorage.setItem(CLAVE_ALMACENAMIENTO, JSON.stringify(metodologias));

      mensajeResultado.style.color = "var(--color-confirmacion)";

      if (codigoOriginal !== null) {
        codigoOriginal = codigo;

        // Actualizar la URL con el nuevo código de la metodología.
        const urlActualizada = new URL(window.location.href);
        urlActualizada.searchParams.set("codigo", codigo);
        window.history.replaceState(null, "", urlActualizada.href);

        mensajeResultado.textContent =
          "La metodología de aprendizaje se actualizó correctamente.";
      } else {
        formulario.reset();

        mensajeResultado.textContent =
          "La metodología de aprendizaje se registró correctamente.";
      }
    } catch (error) {
      console.error("Error al registrar la metodología:", error);

      mensajeResultado.textContent =
        "No fue posible guardar la metodología. Intente nuevamente.";
    }
  });

  // Limpia los mensajes al restablecer el formulario.
  formulario.addEventListener("reset", limpiarMensajes);
});
