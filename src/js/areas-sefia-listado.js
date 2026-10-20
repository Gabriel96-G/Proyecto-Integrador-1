(() => {
    function listar() {
        const cuerpo = document.getElementById('registros');
        cuerpo.replaceChildren();
        try {
            const areas = SGC.Datos.leer('sefia');
            const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
            const visibles = areas.filter(area => SGC.Datos.normalizar(area.nombre).includes(texto));
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
            vacio.textContent = areas.length ? 'No se encontraron coincidencias.' : 'Todavía no hay áreas SEFIA registradas.';
            document.getElementById('aviso').hidden = true;
        } catch (error) {
            document.getElementById('cantidad').textContent = '';
            document.getElementById('vacio').hidden = true;
            SGC.UI.fallo(error);
        }
    }
    document.getElementById('buscar').addEventListener('input', listar);
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
