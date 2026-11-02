(() => {
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
                const acciones = SGC.UI.elemento('td');
                if (area.id) {
                    const editar = SGC.UI.editar('areas-sefia-formulario.html', area.id);
                    SGC.Idioma.atributo(editar, 'aria-label', 'Editar área ' + area.nombre);
                    acciones.append(editar);
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
