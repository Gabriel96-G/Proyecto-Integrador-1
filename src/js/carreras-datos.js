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

    return { leer, leerEscuelas, guardar };
})();
