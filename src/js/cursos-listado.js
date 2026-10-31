(() => {
  "use strict";

  const panel = document.getElementById("panel-cursos");
  const tabla = document.getElementById("tabla-cursos");
  const aviso = document.getElementById("aviso-cursos");
  const rolUsuario = document.getElementById("rol-usuario");

  function mostrarAviso(mensaje) {
    SGC.Idioma.texto(aviso, mensaje);
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

  // Muestra el nombre del estado aunque cambie su código en el catálogo.
  function nombreEstado(referencia, estados) {
    const estado = estados.find(
      (registro) => String(registro.id || registro.codigo) === String(referencia),
    );

    return estado ? estado.nombre : referencia || "Sin definir";
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
    SGC.Idioma.texto(enlace, texto);
    enlace.href = destino;
    return enlace;
  }

  function mostrarCursos(cursos, escuelas, estados) {
    tabla.replaceChildren();
    SGC.Idioma.texto(document.getElementById("contador-cursos"), `${cursos.length} ${cursos.length === 1 ? "registro" : "registros"}`);

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

      const nombre = crearCelda(fila, curso.nombre);
      if (curso.estadoElaboracion === 'borrador') {
        nombre.append(document.createTextNode(' ('));
        const borrador = document.createElement('span');
        SGC.Idioma.texto(borrador, 'Borrador');
        nombre.append(borrador, document.createTextNode(')'));
      }

      const escuela = crearCelda(fila, nombreEscuela(curso.escuela, escuelas));
      if (!escuelas.some(e => String(e.id || e.codigo) === String(curso.escuela))) {
        SGC.Idioma.texto(escuela, 'Escuela no disponible');
      }

      const estado = crearCelda(fila, nombreEstado(curso.estado, estados));
      if (!curso.estado) SGC.Idioma.texto(estado, 'Sin definir');

      const fecha = crearCelda(fila, '');
      if (!curso.actualizado || Number.isNaN(new Date(curso.actualizado).getTime())) {
        SGC.Idioma.texto(fecha, mostrarFecha(curso.actualizado));
      } else SGC.Idioma.fecha(fecha, curso.actualizado, { dateStyle: 'short', timeStyle: 'short' });

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
      const estados = SGC.Datos.leer("estadosCurso");

      const nombresRoles = {
        administrador: "Administrador",
        "encargado de desarrollo curricular":
          "Encargado de Desarrollo Curricular",
        "director de escuela": "Director de escuela",
      };

      SGC.Idioma.texto(rolUsuario, nombresRoles[SGC.Datos.normalizar(sesion.rol)] || sesion.rol);

      mostrarCursos(cursos, escuelas, estados);

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
