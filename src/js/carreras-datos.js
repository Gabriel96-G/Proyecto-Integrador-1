window.SGC = window.SGC || {};
SGC.CarrerasDatos = (() => {
    function leer() {
        return SGC.Datos.leer('carreras');
    }

    function leerEscuelas() {
        return SGC.Datos.leer('escuelas');
    }

    function guardarRegistro(entrada) {
        const registros = leer();
        const indice = entrada.id ? registros.findIndex(carrera => carrera.id === entrada.id) : -1;
        if (entrada.id && indice < 0) {
            throw new Error('El registro que intenta modificar ya no está disponible.');
        }
        const errores = SGC.CarrerasValidacion.validar(entrada, registros, leerEscuelas());
        if (Object.keys(errores).length) throw new Error(Object.values(errores)[0]);

        const registro = {
            ...(indice >= 0 ? registros[indice] : {}),
            ...entrada,
            id: entrada.id || crypto.randomUUID(),
            actualizado: new Date().toISOString()
        };
        if (indice < 0) registros.push(registro);
        else registros[indice] = registro;
        localStorage.setItem('carreras', JSON.stringify(registros));
        return registro;
    }

    async function guardar(entrada) {
        if (navigator.locks) return navigator.locks.request('sgc-carreras', () => guardarRegistro(entrada));
        return guardarRegistro(entrada);
    }

    function comprobarEliminacion(id) {
        const sesion = JSON.parse(sessionStorage.getItem('usuarioActual') || 'null');
        const administrador = sesion?.id && SGC.Datos.leer('usuarios')
            .find(u => String(u.id) === String(sesion.id));
        if (!administrador || administrador.rol !== 'administrador' ||
            (administrador.estado && administrador.estado !== 'activo')) {
            throw new Error('Solo un administrador activo puede eliminar carreras.');
        }
        const registros = leer();
        const carrera = id && registros.find(c => String(c.id) === String(id));
        if (!carrera) throw new Error('La carrera ya no está disponible.');
        // Los registros anteriores pueden guardar el código en lugar del identificador.
        const referencias = [carrera.id, carrera.codigo].filter(v => v !== undefined && v !== null)
            .map(v => SGC.Datos.normalizar(v));
        const asociada = registro => [registro.carrera, ...(Array.isArray(registro.carreras)
            ? registro.carreras : [])].some(v => v !== undefined && v !== null &&
                referencias.includes(SGC.Datos.normalizar(v)));
        if (SGC.Datos.leer('cursos').some(asociada)) {
            throw new Error('No se puede eliminar la carrera porque tiene cursos asociados.');
        }
        if (SGC.Datos.leer('usuarios').some(asociada)) {
            throw new Error('No se puede eliminar la carrera porque tiene usuarios asociados.');
        }
        return { registros, carrera };
    }

    async function eliminar(id) {
        const retirar = () => {
            const { registros, carrera } = comprobarEliminacion(id);
            localStorage.setItem('carreras', JSON.stringify(registros.filter(c => c !== carrera)));
        };
        if (navigator.locks) return navigator.locks.request('sgc-carreras', retirar);
        return retirar();
    }

    return { leer, leerEscuelas, guardar, comprobarEliminacion, eliminar };
})();
