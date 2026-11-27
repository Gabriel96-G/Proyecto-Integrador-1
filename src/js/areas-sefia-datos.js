window.SGC = window.SGC || {};
SGC.AreasSefiaDatos = (() => {
    function comprobarEliminacion(id) {
        const sesion = JSON.parse(sessionStorage.getItem('usuarioActual') || 'null');
        const administrador = sesion?.id && SGC.Datos.leer('usuarios')
            .find(u => String(u.id) === String(sesion.id));
        if (!administrador || administrador.rol !== 'administrador' ||
            (administrador.estado && administrador.estado !== 'activo')) {
            throw new Error('Solo un administrador activo puede eliminar áreas S.E.F.I.A.');
        }
        const areas = SGC.Datos.leer('sefia');
        const area = id && areas.find(a => String(a.id) === String(id));
        if (!area) throw new Error('El área S.E.F.I.A ya no está disponible.');
        const referencias = [area.id, area.codigo].filter(v => v !== undefined && v !== null).map(String);
        // Se revisan todos los cursos, incluidos los borradores de otros usuarios.
        if (SGC.Datos.leer('cursos').some(c => referencias.includes(String(c.areaSefia)))) {
            throw new Error('No se puede eliminar el área S.E.F.I.A porque tiene cursos asociados.');
        }
        return { areas, area };
    }

    async function eliminar(id) {
        const retirar = () => {
            const { areas, area } = comprobarEliminacion(id);
            localStorage.setItem('areasSEFIA', JSON.stringify(areas.filter(a => a !== area)));
        };
        if (navigator.locks) return navigator.locks.request('sgc-areasSEFIA', retirar);
        return retirar();
    }

    return { comprobarEliminacion, eliminar };
})();
