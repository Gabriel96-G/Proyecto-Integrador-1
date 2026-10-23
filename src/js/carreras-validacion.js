window.SGC = window.SGC || {};
SGC.CarrerasValidacion = (() => {
    function validar(entrada, registros, escuelas) {
        const errores = {};
        if (!entrada.codigo.trim()) errores.codigo = 'Ingrese el código de la carrera.';
        else if (entrada.codigo.length > 40) errores.codigo = 'Use como máximo 40 caracteres.';
        else if (registros.some(r => (!entrada.id || r.id !== entrada.id) &&
            SGC.Datos.normalizar(r.codigo) === SGC.Datos.normalizar(entrada.codigo))) {
            errores.codigo = 'Este código ya está registrado.';
        }
        if (!entrada.nombre.trim()) errores.nombre = 'Ingrese el nombre de la carrera.';
        else if (entrada.nombre.length > 150) errores.nombre = 'Use como máximo 150 caracteres.';
        if (!escuelas.some(e => SGC.Datos.referenciaEscuela(e) === entrada.escuela)) {
            errores.escuela = 'Seleccione una escuela registrada.';
        }
        return errores;
    }

    return { validar };
})();
