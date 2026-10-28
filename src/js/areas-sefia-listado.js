(() => {
    function listar() {
        const cuerpo = document.getElementById('registros');
        cuerpo.replaceChildren();
        try {
            const areas = SGC.Datos.leer('sefia');
            const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
            const codigo = SGC.Datos.normalizar(document.getElementById('filtro-codigo').value);
            const descripcion = SGC.Datos.normalizar(document.getElementById('filtro-descripcion').value);
            const visibles = areas.filter(area =>
                SGC.Datos.normalizar(area.codigo).includes(codigo) &&
                SGC.Datos.normalizar(area.nombre).includes(texto) &&
                SGC.Datos.normalizar(area.descripcion).includes(descripcion)
            );
            visibles.forEach(area => {
                const fila = SGC.UI.elemento('tr');
                fila.append(
                    SGC.UI.elemento('td', 'tabla__codigo', area.codigo),
                    SGC.UI.elemento('td', 'tabla__nombre', area.nombre),
                    SGC.UI.elemento('td', '', area.descripcion || 'Sin descripción')
                );
                cuerpo.append(fila);
            });
            document.getElementById('cantidad').textContent = visibles.length +
                (visibles.length === 1 ? ' registro' : ' registros');
            const vacio = document.getElementById('vacio');
            vacio.hidden = visibles.length > 0;
            vacio.textContent = areas.length ? 'No se encontraron coincidencias.' : 'Todavía no hay áreas S.E.F.I.A registradas.';
            document.getElementById('aviso').hidden = true;
        } catch (error) {
            document.getElementById('cantidad').textContent = '';
            document.getElementById('vacio').hidden = true;
            SGC.UI.fallo(error);
        }
    }
    document.getElementById('buscar').addEventListener('input', listar);
    document.getElementById('filtro-codigo').addEventListener('input', listar);
    document.getElementById('filtro-descripcion').addEventListener('input', listar);
    document.getElementById('limpiar-filtros').addEventListener('click', () => {
        document.getElementById('buscar').value = '';
        document.getElementById('filtro-codigo').value = '';
        document.getElementById('filtro-descripcion').value = '';
        listar();
    });
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
