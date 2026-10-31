(() => {
    const buscar = document.getElementById('buscar');
    const cuerpo = document.getElementById('registros');
    const cantidad = document.getElementById('cantidad');
    const vacio = document.getElementById('vacio');
    const normalizar = texto => texto.trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function listar() {
        cuerpo.replaceChildren();
        SGC.Idioma.texto(cantidad, '');
        vacio.hidden = true;
        try {
            const texto = localStorage.getItem('tematicas');
            const registros = texto === null ? [] : JSON.parse(texto);
            if (!Array.isArray(registros) || registros.some(r => !r ||
                typeof r.nombre !== 'string' || !Number.isSafeInteger(Number(r.codigo)) ||
                Number(r.codigo) < 1 || (r.descripcion != null && typeof r.descripcion !== 'string'))) {
                throw new Error('No se pudieron leer las temáticas. Los datos guardados se conservaron sin cambios.');
            }
            const criterio = normalizar(buscar.value);
            const visibles = registros.filter(r => normalizar(r.nombre).includes(criterio));
            visibles.forEach(tematica => {
                const fila = SGC.UI.elemento('tr');
                fila.append(
                    SGC.UI.elemento('td', 'tabla__codigo', tematica.codigo),
                    SGC.UI.elemento('td', 'tabla__nombre', tematica.nombre),
                    SGC.UI.elemento('td', '', tematica.descripcion || 'Sin descripción', !tematica.descripcion)
                );
                cuerpo.append(fila);
            });
            SGC.Idioma.texto(cantidad, visibles.length + (visibles.length === 1 ? ' registro' : ' registros'));
            vacio.hidden = visibles.length > 0;
            SGC.Idioma.texto(vacio, registros.length ? 'No se encontraron coincidencias.' :
                'Todavía no hay temáticas registradas.');
            document.getElementById('aviso').hidden = true;
        } catch (error) {
            SGC.UI.fallo(error);
        }
    }

    buscar.addEventListener('input', listar);
    window.addEventListener('pageshow', listar);
    window.addEventListener('storage', evento => {
        if (evento.key === 'tematicas' || evento.key === null) listar();
    });
    listar();
})();
