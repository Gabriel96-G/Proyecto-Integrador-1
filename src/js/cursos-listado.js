(() => {
  "use strict";

  const panel = document.getElementById("panel-cursos");
  const tabla = document.getElementById("tabla-cursos");
  const aviso = document.getElementById("aviso-cursos");
  const rolUsuario = document.getElementById("rol-usuario");

  function mostrarAviso(mensaje) {
    aviso.textContent = mensaje;
    aviso.hidden = false;
  }

  function crearCelda(fila, contenido) {
    const celda = document.createElement("td");
    celda.textContent = String(contenido ?? "");
    fila.appendChild(celda);
    return celda;
  }

  function nombreEscuela(referencia, escuelas) {
    const escuela = escuelas.find(
      (registro) =>
        String(registro.id || registro.codigo) === String(referencia),
    );

    return escuela ? escuela.nombre : "Escuela no disponible";
  }

  function mostrarFecha(valor) {
    if (!valor) return "Sin registrar";

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      return "Fecha no disponible";
    }

    return new Intl.DateTimeFormat("es-CR", {
      dateStyle: "short",
      timeStyle: "short",
    }).format(fecha);
  }

  function crearEnlace(texto, destino) {
    const enlace = document.createElement("a");
    enlace.textContent = texto;
    enlace.href = destino;
    return enlace;
  }

  function mostrarCursos(cursos, escuelas) {
    tabla.replaceChildren();
    document.getElementById("contador-cursos").textContent =
      `${cursos.length} ${cursos.length === 1 ? "registro" : "registros"}`;

    if (cursos.length === 0) {
      const fila = document.createElement("tr");

      const celda = crearCelda(fila, "No hay cursos registrados todavía.");

      celda.colSpan = 6;
      tabla.appendChild(fila);
      return;
    }

    cursos.forEach((curso) => {
      const fila = document.createElement("tr");

      crearCelda(fila, curso.codigo);

      crearCelda(
        fila,
        curso.nombre +
          (curso.estadoElaboracion === "borrador" ? " (Borrador)" : ""),
      );

      crearCelda(fila, nombreEscuela(curso.escuela, escuelas));

      crearCelda(fila, curso.estado || "Sin definir");

      crearCelda(fila, mostrarFecha(curso.actualizado));

      const acciones = document.createElement("td");
      const id = encodeURIComponent(curso.id);

      const consultar = crearEnlace("Consultar", `curso-detalle.html?id=${id}`);

      const modificar = crearEnlace(
        "Modificar",
        `curso-formulario.html?id=${id}`,
      );

      acciones.appendChild(consultar);
      acciones.appendChild(document.createTextNode(" | "));
      acciones.appendChild(modificar);

      fila.appendChild(acciones);
      tabla.appendChild(fila);
    });
  }

  function iniciar() {
    try {
      const sesion = JSON.parse(
        sessionStorage.getItem("usuarioActual") || "null",
      );

      if (!sesion || !sesion.id) {
        window.location.replace("login.html");
        return;
      }

      const cursos = SGC.CursosDatos.leer();
      const escuelas = SGC.CursosDatos.leerEscuelas();

      const nombresRoles = {
        administrador: "Administrador",
        "encargado de desarrollo curricular":
          "Encargado de Desarrollo Curricular",
        "director de escuela": "Director de escuela",
      };

      rolUsuario.textContent =
        nombresRoles[SGC.Datos.normalizar(sesion.rol)] || sesion.rol;

      mostrarCursos(cursos, escuelas);

      panel.hidden = false;
    } catch (error) {
      if (/sesión|permisos|iniciar sesión|inactivo/i.test(error.message)) {
        window.location.replace("login.html");
        return;
      }

      tabla.replaceChildren();

      mostrarAviso("No se pudieron cargar los cursos. " + error.message);

      document.getElementById("nuevo-curso").hidden = true;
      panel.hidden = false;
    }
  }

  iniciar();
})();
