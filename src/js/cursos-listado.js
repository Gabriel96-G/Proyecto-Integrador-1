(() => {
  "use strict";

  const panel = document.getElementById("panel-cursos");
  const tabla = document.getElementById("tabla-cursos");
  const aviso = document.getElementById("aviso-cursos");
  const buscar = document.getElementById("buscar-curso");

  // HU-62 / CP-152: Filtro por escuela
  const filtroEscuela = document.getElementById("filtro-escuela");

  // HU-62 / CP-152: Filtro por estado
  const filtroEstado = document.getElementById("filtro-estado");

  const listado = document.getElementById("listado-cursos");
  const vacio = document.getElementById("vacio-cursos");

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

  // HU-62 / CP-152: Cargar las escuelas disponibles en el filtro.
  function cargarFiltroEscuelas(escuelas) {
    const seleccionActual = filtroEscuela.value;

    filtroEscuela.replaceChildren(
      new Option(SGC.Idioma.traducir("Todas las escuelas"), ""),
    );

    escuelas.forEach((escuela) => {
      const referencia = escuela.id ?? escuela.codigo;

      if (referencia === undefined || referencia === null) {
        return;
      }

      filtroEscuela.add(new Option(escuela.nombre, String(referencia)));
    });

    filtroEscuela.value = seleccionActual;

    if (filtroEscuela.selectedIndex === -1) {
      filtroEscuela.value = "";
    }
  }

  // Muestra el nombre del estado aunque cambie su código en el catálogo.
  function nombreEstado(referencia, estados) {
    const estado = estados.find(
      (registro) =>
        String(registro.id || registro.codigo) === String(referencia),
    );

    return estado ? estado.nombre : referencia || "Sin definir";
  }

  // HU-62 / CP-152: Cargar los estados disponibles en el filtro.
  function cargarFiltroEstados(estados) {
    const seleccionActual = filtroEstado.value;

    filtroEstado.replaceChildren(
      new Option(SGC.Idioma.traducir("Todos los estados"), ""),
    );

    estados.forEach((estado) => {
      const referencia = estado.id ?? estado.codigo;

      if (referencia === undefined || referencia === null) {
        return;
      }

      filtroEstado.add(new Option(estado.nombre, String(referencia)));
    });

    filtroEstado.value = seleccionActual;

    if (filtroEstado.selectedIndex === -1) {
      filtroEstado.value = "";
    }
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
    enlace.className = "enlace-accion";
    return enlace;
  }

  function mostrarCursos(cursos, escuelas, estados, total) {
    tabla.replaceChildren();
    SGC.Idioma.texto(
      document.getElementById("contador-cursos"),
      `${cursos.length} ${cursos.length === 1 ? "registro" : "registros"}`,
    );

    listado.hidden = cursos.length === 0;
    vacio.hidden = cursos.length > 0;
    SGC.Idioma.texto(
      vacio,
      total
        ? "No se encontraron coincidencias."
        : "No hay cursos registrados todavía.",
    );

    cursos.forEach((curso) => {
      const fila = document.createElement("tr");

      crearCelda(fila, curso.codigo);

      const nombre = crearCelda(fila, curso.nombre);
      nombre.className = "tabla__nombre";
      if (curso.estadoElaboracion === "borrador") {
        nombre.append(document.createTextNode(" ("));
        const borrador = document.createElement("span");
        SGC.Idioma.texto(borrador, "Borrador");
        nombre.append(borrador, document.createTextNode(")"));
      }

      const escuela = crearCelda(fila, nombreEscuela(curso.escuela, escuelas));
      if (
        !escuelas.some(
          (e) => String(e.id || e.codigo) === String(curso.escuela),
        )
      ) {
        SGC.Idioma.texto(escuela, "Escuela no disponible");
      }

      const estado = crearCelda(fila, nombreEstado(curso.estado, estados));
      if (!curso.estado) SGC.Idioma.texto(estado, "Sin definir");

      const fecha = crearCelda(fila, "");
      if (
        !curso.actualizado ||
        Number.isNaN(new Date(curso.actualizado).getTime())
      ) {
        SGC.Idioma.texto(fecha, mostrarFecha(curso.actualizado));
      } else
        SGC.Idioma.fecha(fecha, curso.actualizado, {
          dateStyle: "short",
          timeStyle: "short",
        });

      const acciones = document.createElement("td");
      const id = encodeURIComponent(curso.id);

      const consultar = crearEnlace("Consultar", `curso-detalle.html?id=${id}`);

      const editar = crearEnlace("Editar", `curso-formulario.html?id=${id}`);

      const enlaces = document.createElement("div");
      enlaces.className = "tabla__acciones";
      enlaces.append(consultar, editar);
      acciones.append(enlaces);

      fila.appendChild(acciones);
      tabla.appendChild(fila);
    });
  }

  function iniciar() {
    tabla.replaceChildren();
    listado.hidden = true;
    vacio.hidden = true;
    aviso.hidden = true;
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

      // HU-62 / CP-152: Actualizar las opciones del filtro.
      cargarFiltroEscuelas(escuelas);

      // HU-62 / CP-152: Actualizar las opciones del filtro por estado.
      cargarFiltroEstados(estados);

      // HU-62 / CP-152: Filtrar cursos por nombre, escuela y estado.
      const criterio = SGC.Datos.normalizar(buscar.value);
      const escuelaSeleccionada = filtroEscuela.value;
      const estadoSeleccionado = filtroEstado.value;

      const visibles = cursos.filter((curso) => {
        const coincideNombre = SGC.Datos.normalizar(curso.nombre).includes(
          criterio,
        );

        const coincideEscuela =
          !escuelaSeleccionada || String(curso.escuela) === escuelaSeleccionada;

        const coincideEstado =
          !estadoSeleccionado || String(curso.estado) === estadoSeleccionado;

        return coincideNombre && coincideEscuela && coincideEstado;
      });

      mostrarCursos(visibles, escuelas, estados, cursos.length);
      document.getElementById("nuevo-curso").hidden = false;

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

  buscar.addEventListener("input", iniciar);

  // HU-62 / CP-152: Actualizar los cursos al seleccionar una escuela.
  filtroEscuela.addEventListener("change", iniciar);

  // HU-62 / CP-152: Actualizar los cursos al seleccionar un estado.
  filtroEstado.addEventListener("change", iniciar);

  window.addEventListener("pageshow", iniciar);
  window.addEventListener("storage", iniciar);

  // HU-62: Actualizar los filtros al cambiar el idioma.
  window.addEventListener("idioma:cambiado", iniciar);

  iniciar();
})();
