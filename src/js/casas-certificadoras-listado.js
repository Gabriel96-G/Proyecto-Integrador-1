// HU-49: Listado de casas certificadoras
// Incluye búsqueda por nombre.

document.addEventListener("DOMContentLoaded", function () {
  const tabla = document.getElementById("tabla-casas-certificadoras");
  const cuerpoTabla = document.getElementById("cuerpo-tabla-casas");
  const mensajeListado = document.getElementById("mensaje-listado");

  // Buscador que agregaremos al HTML del listado.
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

    mensajeListado.textContent = "";
    mensajeListado.hidden = true;
  }

  // Mostrar un mensaje informativo o de error.
  function mostrarMensaje(texto, tipo) {
    // Los errores reales se muestran en rojo.
    if (tipo === "error") {
      mensajeListado.textContent = texto;
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

    celda.colSpan = 2;
    celda.textContent = texto;
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

    // Obtener el texto del buscador.
    const busqueda = campoBusqueda ? normalizarTexto(campoBusqueda.value) : "";

    // Filtrar por nombre.
    const casasFiltradas = casasCertificadoras.filter(function (casa) {
      return normalizarTexto(casa.nombre).includes(busqueda);
    });

    // Mostrar aviso cuando no hay coincidencias.
    if (casasFiltradas.length === 0) {
      mostrarMensaje("No se encontraron casas certificadoras con ese nombre.");
      return;
    }

    // Generar las filas de la tabla.
    casasFiltradas.forEach(function (casa) {
      const fila = document.createElement("tr");

      const celdaCodigo = document.createElement("td");
      celdaCodigo.textContent = casa.codigo;

      const celdaNombre = document.createElement("td");
      celdaNombre.textContent = casa.nombre;

      fila.appendChild(celdaCodigo);
      fila.appendChild(celdaNombre);

      cuerpoTabla.appendChild(fila);
    });

    // Mostrar la tabla con los resultados.
    tabla.hidden = false;
    tabla.style.display = "table";
  }

  // Actualizar resultados mientras se escribe.
  if (campoBusqueda) {
    campoBusqueda.addEventListener("input", cargarCasasCertificadoras);
  }

  // Cargar las casas al abrir la página.
  cargarCasasCertificadoras();
});
