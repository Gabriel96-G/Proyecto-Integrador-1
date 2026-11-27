window.SGC = window.SGC || {};
SGC.UsuariosDatos = (() => {
    function comprobarEliminacion(id) {
        const usuarios = SGC.Datos.leer('usuarios');
        const sesion = JSON.parse(sessionStorage.getItem('usuarioActual') || 'null');
        const administrador = sesion?.id && usuarios.find(u => String(u.id) === String(sesion.id));
        if (!administrador || administrador.rol !== 'administrador' ||
            (administrador.estado && administrador.estado !== 'activo')) {
            throw new Error('Solo un administrador activo puede eliminar usuarios.');
        }
        const usuario = id && usuarios.find(u => String(u.id) === String(id));
        if (!usuario) throw new Error('El usuario ya no está disponible.');
        if (String(usuario.id) === String(administrador.id)) {
            throw new Error('No puede eliminar su propia cuenta.');
        }
        // Se consultan todos los cursos, incluidos los borradores de otras cuentas.
        if (SGC.Datos.leer('cursos').some(c => String(c.propietarioId) === String(usuario.id))) {
            throw new Error('No se puede eliminar el usuario porque tiene cursos asociados.');
        }
        const nombre = SGC.Datos.normalizar([usuario.nombre, usuario.primerApellido,
            usuario.segundoApellido].filter(Boolean).join(' '));
        if (nombre && SGC.Datos.leer('escuelas').some(e =>
            SGC.Datos.normalizar(e.directorAsociado) === nombre)) {
            throw new Error('No se puede eliminar el usuario porque es director de una escuela.');
        }
        return { usuarios, usuario };
    }

    async function eliminar(id) {
        const retirar = () => {
            const { usuarios, usuario } = comprobarEliminacion(id);
            localStorage.setItem('usuarios', JSON.stringify(usuarios.filter(u => u !== usuario)));
        };
        if (navigator.locks) return navigator.locks.request('sgc-usuarios', retirar);
        return retirar();
    }

    return { comprobarEliminacion, eliminar };
})();
