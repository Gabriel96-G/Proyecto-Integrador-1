// HU-49: Listado de casas certificadoras
// Incluye búsqueda por nombre.

document.addEventListener("DOMContentLoaded", function () {
  const tabla = document.getElementById("tabla-casas-certificadoras");
  const cuerpoTabla = document.getElementById("cuerpo-tabla-casas");
  const mensajeListado = document.getElementById("mensaje-listado");

  // HU-50: Campos de búsqueda por código y nombre.
  const campoCodigo = document.getElementById("filtrar-casas-codigo");
  const campoBusqueda = document.getElementById("buscar-casas-certificadoras");

  const CLAVE_ALMACENAMIENTO = "casasCertificadoras";

  // Normalizar texto para realizar búsquedas.
  function normalizarTexto(texto) {
    return String(texto).trim().toLocaleLowerCase("es");
  }

  // Ocultar la tabla y limpiar los resultados anteriores.
  function limpiarListado() {
    tabla.hidden = false;
    tabla.style.display = "table";

    cuerpoTabla.innerHTML = "";

    SGC.Idioma.texto(mensajeListado, "");
    mensajeListado.hidden = true;
  }

  // Mostrar un mensaje informativo o de error.
  function mostrarMensaje(texto, tipo) {
    // Los errores reales se muestran en rojo.
    if (tipo === "error") {
      SGC.Idioma.texto(mensajeListado, texto);
      mensajeListado.className = "aviso aviso--error";
      mensajeListado.hidden = false;

      tabla.hidden = true;
      tabla.style.display = "none";
      return;
    }

    // Los mensajes informativos se muestran dentro de la tabla.
    mensajeListado.hidden = true;

    const fila = document.createElement("tr");
    const celda = document.createElement("td");

    celda.colSpan = 3;
    SGC.Idioma.texto(celda, texto);
    celda.style.textAlign = "center";
    celda.style.color = "#2c3e50";
    celda.style.padding = "24px 16px";

    fila.appendChild(celda);
    cuerpoTabla.appendChild(fila);
  }

  // Cargar los registros almacenados.
  function cargarCasasCertificadoras() {
    limpiarListado();

    let casasCertificadoras;

    try {
      const datosGuardados = localStorage.getItem(CLAVE_ALMACENAMIENTO);

      casasCertificadoras = datosGuardados ? JSON.parse(datosGuardados) : [];

      if (!Array.isArray(casasCertificadoras)) {
        throw new Error("Formato de datos inválido.");
      }
    } catch (error) {
      console.error("Error al cargar casas certificadoras:", error);

      mostrarMensaje(
        "No fue posible cargar las casas certificadoras.",
        "error",
      );

      return;
    }

    // Verificar si existen casas registradas.
    if (casasCertificadoras.length === 0) {
      mostrarMensaje("No hay casas certificadoras registradas.");
      return;
    }

    // HU-50: Obtener los criterios de búsqueda.
    const busquedaCodigo = campoCodigo
      ? normalizarTexto(campoCodigo.value)
      : "";

    const busquedaNombre = campoBusqueda
      ? normalizarTexto(campoBusqueda.value)
      : "";

    // HU-50: Filtrar por código y nombre simultáneamente.
    const casasFiltradas = casasCertificadoras.filter(function (casa) {
      const coincideCodigo = normalizarTexto(casa.codigo).includes(
        busquedaCodigo,
      );
      const coincideNombre = normalizarTexto(casa.nombre).includes(
        busquedaNombre,
      );

      return coincideCodigo && coincideNombre;
    });

    // HU-50: Mostrar aviso cuando no hay coincidencias.
    if (casasFiltradas.length === 0) {
      mostrarMensaje(
        "No se encontraron casas certificadoras con los criterios de búsqueda.",
      );
      return;
    }

    // Generar las filas de la tabla.
    casasFiltradas.forEach(function (casa) {
      const fila = document.createElement("tr");

      const celdaCodigo = document.createElement("td");
      celdaCodigo.textContent = casa.codigo;

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = casa.nombre;

      // HU-51: Opción para modificar una casa certificadora.
      const celdaAcciones = document.createElement("td");

      const enlaceEditar = document.createElement("a");
      enlaceEditar.textContent = "Editar";
      enlaceEditar.className = "boton boton--secundario";
      enlaceEditar.href =
        "casas-certificadoras-formulario.html?codigo=" +
        encodeURIComponent(casa.codigo);

      celdaAcciones.appendChild(enlaceEditar);

      fila.appendChild(celdaCodigo);
      fila.appendChild(celdaNombre);
      fila.appendChild(celdaAcciones);

      cuerpoTabla.appendChild(fila);
    });

    // Mostrar la tabla con los resultados.
    tabla.hidden = false;
    tabla.style.display = "table";
  }

  // HU-50: Actualizar resultados al escribir el código.
  if (campoCodigo) {
    campoCodigo.addEventListener("input", cargarCasasCertificadoras);
  }

  // Actualizar resultados al escribir el nombre.
  if (campoBusqueda) {
    campoBusqueda.addEventListener("input", cargarCasasCertificadoras);
  }

  // Cargar las casas al abrir la página.
  cargarCasasCertificadoras();
});
