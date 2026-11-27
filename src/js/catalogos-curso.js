window.SGC = window.SGC || {};

SGC.CatalogosCurso = (() => {
    const claves = {
        metodologia: ["metodologiasAprendizaje"],
        casaCertificadora: ["casasCertificadoras", "casas-certificadoras"],
        nivelComplejidad: ["nivelesComplejidad", "niveles-complejidad"]
    };
    const nivelesIniciales = new Set(["1", "2", "3", "4", "5"]);
    const normalizarCodigo = valor => String(valor ?? "").trim().replace(/^0+(?=\d)/, "");

    function leer(campo) {
        const clavesCatalogo = claves[campo];
        const clave = clavesCatalogo.find(nombre => localStorage.getItem(nombre) !== null);
        return SGC.Datos.leer(clave ?? clavesCatalogo[0]);
    }

    function coincideReferencia(registro, referencia) {
        return referencia != null && referencia !== "" &&
            ((registro.id != null && String(registro.id) === String(referencia)) ||
                normalizarCodigo(registro.codigo) === normalizarCodigo(referencia));
    }

    function validarReferencias(datos, anterior) {
        for (const campo of Object.keys(claves)) {
            const referencia = datos[campo];
            if (referencia && referencia !== anterior?.[campo] &&
                !leer(campo).some(registro => coincideReferencia(registro, referencia))) {
                throw new Error("Un valor seleccionado del catálogo ya no está disponible. Revise el formulario.");
            }
        }
    }

    function conBloqueo(operacion) {
        return navigator.locks ? navigator.locks.request("sgc-cursos", operacion) : operacion();
    }

    function comprobarBaja(campo, seleccion) {
        const sesion = JSON.parse(sessionStorage.getItem("usuarioActual"));
        const administrador = sesion?.id && SGC.Datos.leer("usuarios").find(usuario =>
            String(usuario.id) === String(sesion.id) && usuario.rol === sesion.rol);
        if (!administrador || administrador.rol !== "administrador" ||
            (administrador.estado && administrador.estado !== "activo")) {
            throw new Error("Solo un administrador activo puede eliminar registros del catálogo.");
        }

        const registros = leer(campo);
        const indice = registros.findIndex(registro =>
            registro.id === seleccion.id &&
            String(registro.codigo) === String(seleccion.codigo) &&
            registro.nombre === seleccion.nombre);
        if (indice < 0) throw new Error("Este registro cambió o ya no está disponible. Actualice el listado.");

        const registro = registros[indice];
        if (campo === "nivelComplejidad" &&
            [registro.id, registro.codigo].some(valor => nivelesIniciales.has(normalizarCodigo(valor)))) {
            throw new Error("No se puede eliminar un nivel inicial protegido.");
        }
        if (SGC.Datos.leer("cursos").some(curso => coincideReferencia(registro, curso[campo]))) {
            throw new Error("No se puede eliminar el registro porque tiene cursos asociados.");
        }
        return { registros, indice };
    }

    function eliminar(campo, seleccion) {
        return conBloqueo(() => {
            const { registros, indice } = comprobarBaja(campo, seleccion);
            registros.splice(indice, 1);
            localStorage.setItem(claves[campo][0], JSON.stringify(registros));
        });
    }

    return { claves, leer, validarReferencias, conBloqueo, comprobarBaja, eliminar };
})();
