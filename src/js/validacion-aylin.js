window.SGC = window.SGC || {};
SGC.Validacion = (() => {
    const correoValido = valor => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(valor);
    const claveValida = valor => valor.length >= 8 && valor.length <= 15 &&
        /[A-Z]/.test(valor) && /[a-z]/.test(valor) && /\d/.test(valor);

    function fechaValida(valor) {
        if (!valor) return true;
        if (!/^\d{4}-\d{2}-\d{2}$/.test(valor)) return false;
        const [anio, mes, dia] = valor.split('-').map(Number);
        const fecha = new Date(anio, mes - 1, dia);
        const hoy = new Date();
        hoy.setHours(23, 59, 59, 999);
        return fecha.getFullYear() === anio && fecha.getMonth() === mes - 1 &&
            fecha.getDate() === dia && fecha <= hoy;
    }

    function edad(valor) {
        if (!valor || !fechaValida(valor)) return '';
        const hoy = new Date();
        const [anio, mes, dia] = valor.split('-').map(Number);
        let cantidad = hoy.getFullYear() - anio;
        if (hoy.getMonth() + 1 < mes || (hoy.getMonth() + 1 === mes && hoy.getDate() < dia)) cantidad--;
        return cantidad;
    }

    function usuario(entrada, registros, clave) {
        const errores = {};
        const otros = registros.filter(r => !entrada.id || r.id !== entrada.id);
        const iguales = (a, b) => SGC.Datos.normalizar(a) === SGC.Datos.normalizar(b);
        if (!entrada.nombre) errores.nombre = 'Ingrese el nombre.';
        if (!entrada.primerApellido) errores.primerApellido = 'Ingrese el primer apellido.';
        if (!entrada.identificacion) errores.identificacion = 'Ingrese la identificación.';
        else if (otros.some(r => iguales(r.identificacion, entrada.identificacion))) {
            errores.identificacion = 'Esta identificación ya pertenece a otro usuario.';
        }
        if (!correoValido(entrada.correo)) errores.correo = 'Ingrese un correo institucional válido.';
        else if (otros.some(r => iguales(r.correo, entrada.correo))) errores.correo = 'Este correo ya está registrado.';
        if (entrada.correoPersonal && !correoValido(entrada.correoPersonal)) errores.correoPersonal = 'Ingrese un correo personal válido.';
        if (entrada.telefono && (!/^[+\d\s()-]+$/.test(entrada.telefono) ||
            !/^\d{8,15}$/.test(entrada.telefono.replace(/\D/g, '')))) {
            errores.telefono = 'Ingrese un teléfono con entre 8 y 15 dígitos.';
        }
        if (!fechaValida(entrada.nacimiento)) errores.nacimiento = 'Seleccione una fecha válida que no sea futura.';
        if (!['', 'femenino', 'masculino', 'otro', 'no-indica'].includes(entrada.sexo)) errores.sexo = 'Seleccione una opción válida.';
        if (entrada.rol !== 'administrador') errores.rol = 'Seleccione el rol de administrador.';
        if ((!entrada.id || clave) && !claveValida(clave)) {
            errores.clave = 'Use de 8 a 15 caracteres con mayúscula, minúscula y número.';
        }
        return errores;
    }

    function carrera(entrada, registros, escuelas) {
        const errores = {};
        if (!entrada.codigo) errores.codigo = 'Ingrese el código de la carrera.';
        else if (registros.some(r => (!entrada.id || r.id !== entrada.id) &&
            SGC.Datos.normalizar(r.codigo) === SGC.Datos.normalizar(entrada.codigo))) {
            errores.codigo = 'Este código ya está registrado.';
        }
        if (!entrada.nombre) errores.nombre = 'Ingrese el nombre de la carrera.';
        if (!escuelas.some(e => SGC.Datos.referenciaEscuela(e) === entrada.escuela)) {
            errores.escuela = 'Seleccione una escuela registrada.';
        }
        return errores;
    }

    function sefia(entrada, registros) {
        const errores = {};
        if (!entrada.nombre) errores.nombre = 'Ingrese el nombre del área S.E.F.I.A.';
        else if (entrada.nombre.length > 150) errores.nombre = 'Use como máximo 150 caracteres.';
        else if (registros.some(r => (!entrada.id || r.id !== entrada.id) &&
            SGC.Datos.normalizar(r.nombre) === SGC.Datos.normalizar(entrada.nombre))) {
            errores.nombre = 'Este nombre ya está registrado.';
        }
        if (entrada.descripcion.length > 2000) errores.descripcion = 'Use como máximo 2000 caracteres.';
        return errores;
    }

    return { usuario, carrera, sefia, edad, fechaValida };
})();
