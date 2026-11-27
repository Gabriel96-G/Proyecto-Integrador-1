window.SGC = window.SGC || {};

SGC.CursosDatos = (() => {
  const CLAVE = "cursos";

  const ROLES_PERMITIDOS = [
    "administrador",
    "desarrollo",
    "encargado de desarrollo curricular",
    "director",
    "director de escuela",
  ];

  function obtenerUsuarioActual() {
    const sesion = JSON.parse(
      sessionStorage.getItem("usuarioActual") || "null",
    );

    if (!sesion || !sesion.id) {
      throw new Error("Debe iniciar sesión para gestionar cursos.");
    }

    const usuarios = SGC.Datos.leer("usuarios");

    const usuario = usuarios.find(
      (registro) =>
        String(registro.id) === String(sesion.id) &&
        SGC.Datos.normalizar(registro.correo) ===
          SGC.Datos.normalizar(sesion.correo) &&
        registro.rol === sesion.rol &&
        (!registro.estado || registro.estado === "activo"),
    );

    if (!usuario) {
      throw new Error("La sesión no es válida o el usuario está inactivo.");
    }

    if (!ROLES_PERMITIDOS.includes(SGC.Datos.normalizar(usuario.rol))) {
      throw new Error("No tiene permisos para gestionar cursos.");
    }

    return usuario;
  }

  function leer() {
    obtenerUsuarioActual();

    const texto = localStorage.getItem(CLAVE);
    if (texto === null) return [];

    const registros = JSON.parse(texto);

    if (
      !Array.isArray(registros) ||
      registros.some(
        (curso) =>
          !curso ||
          typeof curso !== "object" ||
          typeof curso.nombre !== "string" ||
          typeof curso.codigo !== "string",
      )
    ) {
      throw new Error(
        "Los datos almacenados de cursos no tienen un formato válido.",
      );
    }

    const usuario = obtenerUsuarioActual();

    const escuelas = escuelasDelDirector(usuario);
    return registros.filter(
      (curso) =>
        (!escuelas || escuelas.some(e => String(e.id || e.codigo) === String(curso.escuela))) &&
        (curso.estadoElaboracion !== "borrador" || String(curso.propietarioId) === String(usuario.id)),
    );
  }

  // Escuelas guarda el nombre completo del director. Si hay homónimos no se concede acceso.
  function escuelasDelDirector(usuario) {
    if (!["director", "director de escuela"].includes(usuario.rol)) return null;
    const nombre = u => SGC.Datos.normalizar([u.nombre, u.primerApellido, u.segundoApellido].filter(Boolean).join(" "));
    const completo = nombre(usuario);
    if (!completo || SGC.Datos.leer("usuarios").filter(u =>
        ["director", "director de escuela"].includes(u.rol) && nombre(u) === completo).length !== 1) return [];
    return SGC.Datos.leer("escuelas").filter(e => SGC.Datos.normalizar(e.directorAsociado) === completo);
  }

  function leerEscuelas() {
    return escuelasDelDirector(obtenerUsuarioActual()) || SGC.Datos.leer("escuelas");
  }

  function obtenerPorId(id) {
    const curso = leer().find((registro) => String(registro.id) === String(id));

    if (!curso) {
      return null;
    }

    // HU-55 / CP-131: solo el propietario puede abrir su borrador.
    if (curso.estadoElaboracion === "borrador") {
      const usuario = obtenerUsuarioActual();

      if (String(curso.propietarioId) !== String(usuario.id)) {
        throw new Error("Solo el propietario puede abrir este borrador.");
      }
    }

    return curso;
  }

  function guardarRegistro(entrada, comoBorrador = false) {
    const usuario = obtenerUsuarioActual();

    // Validar los datos almacenados antes de guardar.
    const visibles = leer();
    if (entrada.id && !visibles.some(c => c.id === entrada.id)) {
      throw new Error("El curso no está disponible para esta cuenta.");
    }

    // Trabajar con todos los registros para no perder borradores ajenos.
    const registros = JSON.parse(localStorage.getItem(CLAVE) || "[]");

    const indice = entrada.id
      ? registros.findIndex((curso) => curso.id === entrada.id)
      : -1;

    if (entrada.id && indice === -1) {
      throw new Error("El curso que intenta modificar ya no está disponible.");
    }

    const escuelas = leerEscuelas();

    const errores = SGC.CursosValidacion.validar(entrada, registros, escuelas);

    if (entrada.areaSefia && !SGC.Datos.leer('sefia').some(area =>
      String(area.id ?? area.codigo) === String(entrada.areaSefia))) {
      errores.areaSefia = 'Seleccione un área S.E.F.I.A disponible en el catálogo.';
    }

    if (Object.keys(errores).length > 0) {
      throw new Error(Object.values(errores)[0]);
    }

    const ahora = new Date().toISOString();
    const anterior = indice >= 0 ? registros[indice] : null;

    // HU-55 / CP-131: solo el propietario puede modificar su borrador.
    if (
      anterior &&
      anterior.estadoElaboracion === "borrador" &&
      String(anterior.propietarioId) !== String(usuario.id)
    ) {
      throw new Error("Solo el propietario puede modificar este borrador.");
    }

    const datos = { ...entrada };

    // Estos campos los administra el sistema.
    delete datos.creado;
    delete datos.actualizado;
    delete datos.propietarioId;
    delete datos.estadoElaboracion;

    const registro = {
      ...(anterior || {}),
      ...datos,
      id: anterior ? anterior.id : crypto.randomUUID(),
      propietarioId: anterior ? anterior.propietarioId : usuario.id,
      creado: anterior ? anterior.creado : ahora,
      actualizado: ahora,
      estadoElaboracion: comoBorrador ? "borrador" : "registrado",
    };

    if (indice === -1) {
      registros.push(registro);
    } else {
      registros[indice] = registro;
    }

    localStorage.setItem(CLAVE, JSON.stringify(registros));

    return registro;
  }

  async function guardar(entrada, comoBorrador = false) {
    if (navigator.locks) {
      return navigator.locks.request("sgc-cursos", () =>
        guardarRegistro(entrada, comoBorrador),
      );
    }

    return guardarRegistro(entrada, comoBorrador);
  }

  // HU-55 / CP-130: guardar el curso con estado de borrador.
  async function guardarBorrador(entrada) {
    return guardar(entrada, true);
  }

  return {
    leer,
    leerEscuelas,
    obtenerPorId,
    guardar,
    guardarBorrador,
  };
})();
