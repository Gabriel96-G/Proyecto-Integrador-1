window.SGC = window.SGC || {};

SGC.CursosDatos = (() => {
  const CLAVE = "cursos";

  const ROLES_PERMITIDOS = [
    "administrador",
    "encargado de desarrollo curricular",
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

    return registros.filter(
      (curso) =>
        curso.estadoElaboracion !== "borrador" ||
        String(curso.propietarioId) === String(usuario.id),
    );
  }

  function leerEscuelas() {
    obtenerUsuarioActual();
    return SGC.Datos.leer("escuelas");
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
    leer();

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
