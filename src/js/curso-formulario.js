(() => {
  "use strict";

  const formulario = document.getElementById("curso-form");
  const guardar = document.getElementById("guardar");
  const botonBorrador = document.getElementById("guardar-borrador");
  const aviso = document.getElementById("aviso");
  const panel = document.getElementById("panel-formulario");
  const parametros = new URLSearchParams(window.location.search);
  const idCurso = parametros.get("id");

  let cursoActual = null;
  let guardando = false;

  const campo = (id) => document.getElementById(id);

  const catalogos = {
    estado: ["estadosCurso", "estadosCursos", "estados-curso"],
    areaSefia: ["areasSEFIA"],
    tematica: ["tematicas"],
    metodologia: ["metodologiasAprendizaje"],
    nivelComplejidad: ["nivelesComplejidad", "niveles-complejidad"],
    modalidad: ["modalidades"],
    moneda: ["monedas"],
    casaCertificadora: ["casasCertificadoras", "casas-certificadoras"],
  };

  function mostrarAviso(mensaje, tipo = "confirmacion") {
    aviso.textContent = mensaje;
    aviso.className = `aviso aviso--${tipo}`;
    aviso.hidden = false;
  }

  function mostrarFecha(id, valor) {
    const elemento = campo(id);

    if (!valor) {
      elemento.textContent = "Aún sin registrar";
      elemento.removeAttribute("datetime");
      return;
    }

    const fecha = new Date(valor);

    if (Number.isNaN(fecha.getTime())) {
      elemento.textContent = "Fecha no disponible";
      return;
    }

    elemento.textContent = fecha.toLocaleString("es-CR");
    elemento.dateTime = fecha.toISOString();
  }

  function leerCatalogo(claves) {
    for (const clave of claves) {
      const texto = localStorage.getItem(clave);

      if (texto === null) continue;

      const registros = JSON.parse(texto);

      if (!Array.isArray(registros)) {
        throw new Error(`El catálogo ${clave} no tiene un formato válido.`);
      }

      return registros.filter(
        (registro) => registro && typeof registro.nombre === "string",
      );
    }

    return [];
  }

  function cargarOpciones(id, registros) {
    const select = campo(id);
    const textoInicial = select.options[0].textContent;

    select.replaceChildren(new Option(textoInicial, ""));

    registros.forEach((registro) => {
      const referencia = registro.id ?? registro.codigo;

      if (referencia === undefined || referencia === null) {
        return;
      }

      select.add(new Option(registro.nombre, String(referencia)));
    });
  }

  function cargarCatalogos() {
    cargarOpciones("escuela", SGC.CursosDatos.leerEscuelas());

    Object.entries(catalogos).forEach(([id, claves]) => {
      cargarOpciones(id, leerCatalogo(claves));
    });
  }

  function calcularTotalHoras() {
    const horasClase = campo("horasClase").value;
    const horasExtraclase = campo("horasExtraclase").value;

    if (horasClase === "" && horasExtraclase === "") {
      campo("totalHoras").textContent = "0";
      return;
    }

    const total = Number(horasClase || 0) + Number(horasExtraclase || 0);

    campo("totalHoras").textContent = Number.isFinite(total)
      ? String(total)
      : "0";
  }

  function contarCaracteres() {
    campo("cantidadCaracteres").textContent = String(
      campo("nombrePowerCampus").value.length,
    );
  }

  function limpiarErrores() {
    formulario.querySelectorAll("[data-error-for]").forEach((elemento) => {
      elemento.textContent = "";
    });

    formulario.querySelectorAll("[aria-invalid]").forEach((elemento) => {
      elemento.removeAttribute("aria-invalid");
    });
  }

  function mostrarErrores(errores) {
    limpiarErrores();

    let primerCampo = null;

    Object.entries(errores).forEach(([nombre, mensaje]) => {
      const control = campo(nombre);
      const mensajeError = campo(`${nombre}-mensaje`);

      if (mensajeError) {
        mensajeError.textContent = mensaje;
      }

      if (control) {
        control.setAttribute("aria-invalid", "true");
        if (!primerCampo) primerCampo = control;
      }
    });

    if (primerCampo) primerCampo.focus();

    return Object.keys(errores).length === 0;
  }

  function actualizarTitulo() {
    const modificando = Boolean(cursoActual);

    document.title = modificando
      ? "Modificar curso | SGC"
      : "Registrar curso | SGC";

    campo("titulo").textContent = modificando
      ? "Modificar curso"
      : "Registrar curso";

    campo("ruta").textContent = modificando
      ? "Cursos / Modificación"
      : "Cursos / Nuevo registro";

    guardar.textContent = modificando ? "Guardar cambios" : "Guardar curso";
  }

  function cargarCurso(curso) {
    formulario.querySelectorAll("[name]").forEach((control) => {
      if (control.name in curso && "value" in control) {
        control.value = curso[control.name] ?? "";
      }
    });

    mostrarFecha("fechaModificacion", curso.actualizado);
    mostrarFecha("fechaModificacionMetadata", curso.fechaModificacionMetadata);

    calcularTotalHoras();
    contarCaracteres();
  }

  function obtenerDatos() {
    const datos = Object.fromEntries(new FormData(formulario).entries());

    Object.keys(datos).forEach((clave) => {
      datos[clave] = String(datos[clave]).trim();
    });

    if (cursoActual) {
      datos.id = cursoActual.id;
    }

    const horasClase = Number(datos.horasClase || 0);
    const horasExtraclase = Number(datos.horasExtraclase || 0);

    datos.totalHoras = horasClase + horasExtraclase;
    datos.cantidadCaracteres = datos.nombrePowerCampus.length;

    if (!cursoActual || datos.metadata !== cursoActual.metadata) {
      datos.fechaModificacionMetadata = new Date().toISOString();
    } else {
      datos.fechaModificacionMetadata =
        cursoActual.fechaModificacionMetadata ?? null;
    }

    return datos;
  }

  function iniciar() {
    try {
      // Comprueba que existe una sesión autorizada.
      SGC.CursosDatos.leer();

      const sesion = JSON.parse(sessionStorage.getItem("usuarioActual"));

      campo("rol-usuario").textContent = sesion.rol;

      cargarCatalogos();

      if (idCurso !== null) {
        cursoActual = SGC.CursosDatos.obtenerPorId(idCurso);

        if (!cursoActual) {
          throw new Error("No se encontró el curso solicitado.");
        }

        cargarCurso(cursoActual);
      }

      actualizarTitulo();
      panel.hidden = false;

      if (campo("escuela").options.length <= 1) {
        guardar.disabled = true;
        mostrarAviso(
          "No hay escuelas registradas. Debe registrar una escuela antes de crear cursos.",
          "advertencia",
        );
      }
    } catch (error) {
      if (/sesión|permisos|iniciar sesión|inactivo/i.test(error.message)) {
        window.location.replace("login.html");
        return;
      }

      panel.hidden = false;
      guardar.disabled = true;
      mostrarAviso(error.message, "advertencia");
    }
  }

  campo("horasClase").addEventListener("input", calcularTotalHoras);
  campo("horasExtraclase").addEventListener("input", calcularTotalHoras);

  campo("nombrePowerCampus").addEventListener("input", contarCaracteres);

  formulario.addEventListener("submit", async (evento) => {
    evento.preventDefault();

    if (guardando || guardar.disabled) return;

    try {
      const datos = obtenerDatos();

      const errores = SGC.CursosValidacion.validar(
        datos,
        SGC.CursosDatos.leer(),
        SGC.CursosDatos.leerEscuelas(),
      );

      if (!mostrarErrores(errores)) {
        mostrarAviso(
          "Revise los campos señalados antes de guardar.",
          "advertencia",
        );
        return;
      }

      guardando = true;
      guardar.disabled = true;

      const modificando = Boolean(cursoActual);
      const registro = await SGC.CursosDatos.guardar(datos);

      cursoActual = registro;
      actualizarTitulo();

      mostrarFecha("fechaModificacion", registro.actualizado);

      mostrarFecha(
        "fechaModificacionMetadata",
        registro.fechaModificacionMetadata,
      );

      limpiarErrores();

      mostrarAviso(
        modificando
          ? "Los cambios del curso se guardaron correctamente."
          : "El curso se registró correctamente.",
      );
    } catch (error) {
      mostrarAviso(error.message, "advertencia");
    } finally {
      guardando = false;
      guardar.disabled = false;
    }
  });

  // HU-55 / CP-130: guardar un curso como borrador.
  botonBorrador.addEventListener("click", async () => {
    if (guardando || botonBorrador.disabled || guardar.disabled) {
      return;
    }

    try {
      const datos = obtenerDatos();

      const errores = SGC.CursosValidacion.validar(
        datos,
        SGC.CursosDatos.leer(),
        SGC.CursosDatos.leerEscuelas(),
      );

      if (!mostrarErrores(errores)) {
        mostrarAviso(
          "Para guardar el borrador, complete correctamente los campos señalados.",
          "advertencia",
        );
        return;
      }

      guardando = true;
      guardar.disabled = true;
      botonBorrador.disabled = true;

      const registro = await SGC.CursosDatos.guardarBorrador(datos);

      cursoActual = registro;

      // Conserva el ID para continuar editando el mismo borrador.
      const url = new URL(window.location.href);
      url.searchParams.set("id", registro.id);
      window.history.replaceState(null, "", url);

      actualizarTitulo();

      mostrarFecha("fechaModificacion", registro.actualizado);
      mostrarFecha(
        "fechaModificacionMetadata",
        registro.fechaModificacionMetadata,
      );

      limpiarErrores();

      mostrarAviso(
        "El curso se guardó como borrador correctamente.",
        "confirmacion",
      );
    } catch (error) {
      mostrarAviso(error.message, "advertencia");
    } finally {
      guardando = false;
      guardar.disabled = false;
      botonBorrador.disabled = false;
    }
  });

  iniciar();
})();
