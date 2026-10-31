// HU-49: Listado de casas certificadoras
// Incluye búsqueda por nombre.

document.addEventListener("DOMContentLoaded", function () {
  const tabla = document.getElementById("tabla-casas-certificadoras");
  const cuerpoTabla = document.getElementById("cuerpo-tabla-casas");
  const mensajeListado = document.getElementById("mensaje-listado");

  const campoBusqueda = document.getElementById("buscar-casas-certificadoras");

  const CLAVE_ALMACENAMIENTO = "casasCertificadoras";

  // Normalizar texto para realizar búsquedas.
  function normalizarTexto(texto) {
    return String(texto).trim().normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "").toLocaleLowerCase("es");
  }

  // Ocultar la tabla y limpiar los resultados anteriores.
  function limpiarListado() {
    tabla.hidden = true;

    cuerpoTabla.innerHTML = "";

    SGC.Idioma.texto(mensajeListado, "");
    mensajeListado.hidden = true;
  }

  // Mostrar un mensaje informativo o de error.
  function mostrarMensaje(texto, tipo) {
    SGC.Idioma.texto(mensajeListado, texto);
    mensajeListado.className = tipo === "error" ? "aviso aviso--error" : "estado-vacio";
    mensajeListado.setAttribute("role", tipo === "error" ? "alert" : "status");
    mensajeListado.hidden = false;
    tabla.hidden = true;
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

    const busquedaNombre = campoBusqueda
      ? normalizarTexto(campoBusqueda.value)
      : "";

    const casasFiltradas = casasCertificadoras.filter(function (casa) {
      return normalizarTexto(casa.nombre).includes(busquedaNombre);
    });

    // HU-50: Mostrar aviso cuando no hay coincidencias.
    if (casasFiltradas.length === 0) {
      mostrarMensaje(
        "No se encontraron coincidencias.",
      );
      return;
    }

    // Generar las filas de la tabla.
    casasFiltradas.forEach(function (casa) {
      const fila = document.createElement("tr");

      const celdaCodigo = document.createElement("td");
      celdaCodigo.textContent = casa.codigo;

      const celdaNombre = document.createElement("td");
      celdaNombre.className = "tabla__nombre";
      celdaNombre.textContent = casa.nombre;

      // HU-51: Opción para modificar una casa certificadora.
      const celdaAcciones = document.createElement("td");

      const enlaceEditar = document.createElement("a");
      SGC.Idioma.texto(enlaceEditar, "Editar");
      enlaceEditar.className = "enlace-accion";
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
  }

  // Actualizar resultados al escribir el nombre.
  if (campoBusqueda) {
    campoBusqueda.addEventListener("input", cargarCasasCertificadoras);
  }

  window.addEventListener("pageshow", cargarCasasCertificadoras);
  window.addEventListener("storage", evento => {
    if (evento.key === CLAVE_ALMACENAMIENTO || evento.key === null) cargarCasasCertificadoras();
  });

  cargarCasasCertificadoras();
});
