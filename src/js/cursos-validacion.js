
window.SGC = window.SGC || {};

SGC.CursosValidacion = (() => {
    function normalizar(valor) {
        return String(valor ?? '')
            .trim()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLowerCase();
    }

    function validar(entrada, registros, escuelas) {
        const errores = {};

        // Validar la escuela asociada.
        if (!entrada.escuela) {
            errores.escuela = 'Seleccione una escuela.';
        } else if (!escuelas.some(escuela =>
            String(escuela.id || escuela.codigo) === String(entrada.escuela)
        )) {
            errores.escuela = 'Seleccione una escuela registrada.';
        }

        // Validar el código del curso.
        if (!String(entrada.codigo ?? '').trim()) {
            errores.codigo = 'Ingrese el código del curso.';
        } else if (registros.some(curso =>
            curso.id !== entrada.id &&
            normalizar(curso.codigo) === normalizar(entrada.codigo)
        )) {
            errores.codigo = 'Este código de curso ya está registrado.';
        }

        // Validar el nombre del curso.
        if (!String(entrada.nombre ?? '').trim()) {
            errores.nombre = 'Ingrese el nombre del curso.';
        }

        // Límites establecidos en el Documento de Diseño.
        if (String(entrada.nombrePowerCampus ?? '').length > 40) {
            errores.nombrePowerCampus =
                'El nombre en Power Campus no puede superar 40 caracteres.';
        }

        if (String(entrada.descripcionCorta ?? '').length > 250) {
            errores.descripcionCorta =
                'La descripción corta no puede superar 250 caracteres.';
        }

        if (String(entrada.metadescripcion ?? '').length > 155) {
            errores.metadescripcion =
                'La metadescripción no puede superar 155 caracteres.';
        }

        // Validar créditos y horas cuando se ingresen.
        ['creditos', 'horasClase', 'horasExtraclase'].forEach(campo => {
            const valor = entrada[campo];

            if (valor !== undefined && valor !== null && valor !== '') {
                if (!Number.isFinite(Number(valor)) || Number(valor) < 0) {
                    errores[campo] =
                        'Ingrese un número válido mayor o igual a cero.';
                }
            }
        });

        return errores;
    }

    return { validar };
})();
