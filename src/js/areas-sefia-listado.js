(() => {
    const dialogo = document.getElementById('confirmar-eliminar-area');
    const buscar = document.getElementById('buscar');
    let pendiente = null;
    let eliminando = false;

    function solicitarEliminacion(id) {
        try {
            const { area } = SGC.AreasSefiaDatos.comprobarEliminacion(id);
            pendiente = id;
            document.getElementById('area-elegida').textContent = area.codigo + ' · ' + area.nombre;
            dialogo.returnValue = '';
            dialogo.showModal();
        } catch (error) { SGC.UI.fallo(error); }
    }

    dialogo.addEventListener('close', async () => {
        const id = pendiente;
        pendiente = null;
        if (!id || dialogo.returnValue !== 'eliminar' || eliminando) return;
        eliminando = true;
        try {
            await SGC.AreasSefiaDatos.eliminar(id);
            listar();
            SGC.UI.aviso('Se eliminó el área S.E.F.I.A.', 'confirmacion');
        } catch (error) { SGC.UI.fallo(error); }
        finally { eliminando = false; buscar.focus(); }
    });

    function listar() {
        const cuerpo = document.getElementById('registros');
        cuerpo.replaceChildren();
        try {
            const areas = SGC.Datos.leer('sefia');
            const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
            const visibles = areas.filter(area =>
                SGC.Datos.normalizar(area.codigo).includes(texto) ||
                SGC.Datos.normalizar(area.nombre).includes(texto));
            visibles.forEach(area => {
                const fila = SGC.UI.elemento('tr');
                const acciones = SGC.UI.elemento('td', 'text-nowrap');
                if (area.id) {
                    const editar = SGC.UI.editar('areas-sefia-formulario.html', area.id);
                    SGC.Idioma.atributo(editar, 'aria-label', 'Editar área ' + area.nombre);
                    const eliminar = SGC.UI.elemento('button', 'btn btn-outline-danger btn-sm ms-2', 'Eliminar', true);
                    eliminar.type = 'button';
                    SGC.Idioma.atributo(eliminar, 'aria-label', 'Eliminar área ' + area.nombre);
                    eliminar.addEventListener('click', () => solicitarEliminacion(area.id));
                    acciones.append(editar, eliminar);
                } else SGC.Idioma.texto(acciones, 'Sin identificador');
                fila.append(
                    SGC.UI.elemento('td', 'tabla__codigo', area.codigo),
                    SGC.UI.elemento('td', 'tabla__nombre', area.nombre),
                    SGC.UI.elemento('td', '', area.descripcion || 'Sin descripción', !area.descripcion),
                    acciones
                );
                cuerpo.append(fila);
            });
            SGC.Idioma.texto(document.getElementById('cantidad'), visibles.length +
                (visibles.length === 1 ? ' registro' : ' registros'));
            const vacio = document.getElementById('vacio');
            vacio.hidden = visibles.length > 0;
            SGC.Idioma.texto(vacio, areas.length ? 'No se encontraron coincidencias.' : 'Todavía no hay áreas S.E.F.I.A registradas.');
            document.getElementById('aviso').hidden = true;
        } catch (error) {
            SGC.Idioma.texto(document.getElementById('cantidad'), '');
            document.getElementById('vacio').hidden = true;
            SGC.UI.fallo(error);
        }
    }
    document.getElementById('buscar').addEventListener('input', listar);
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
