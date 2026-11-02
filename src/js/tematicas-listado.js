(() => {
    const buscar = document.getElementById('buscar');
    const tabla = document.getElementById('tabla-tematicas');
    const cuerpo = document.getElementById('registros');
    const cantidad = document.getElementById('cantidad');
    const vacio = document.getElementById('vacio');
    const normalizar = texto => String(texto ?? '').trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function listar() {
        cuerpo.replaceChildren();
        SGC.Idioma.texto(cantidad, '');
        vacio.hidden = true;
        tabla.hidden = true;
        try {
            const texto = localStorage.getItem('tematicas');
            const registros = texto === null ? [] : JSON.parse(texto);
            if (!Array.isArray(registros) || registros.some(r => !r ||
                typeof r.nombre !== 'string' || !Number.isSafeInteger(Number(r.codigo)) ||
                Number(r.codigo) < 1 || (r.descripcion != null && typeof r.descripcion !== 'string'))) {
                throw new Error('No se pudieron leer las temáticas. Los datos guardados se conservaron sin cambios.');
            }
            const criterio = normalizar(buscar.value);
            const codigo = normalizar(document.getElementById('filtro-codigo').value);
            const descripcion = normalizar(document.getElementById('filtro-descripcion').value);
            const visibles = registros.filter(r =>
                normalizar(r.codigo).includes(codigo) && normalizar(r.nombre).includes(criterio) &&
                normalizar(r.descripcion).includes(descripcion));
            visibles.forEach(tematica => {
                const fila = SGC.UI.elemento('tr');
                const acciones = SGC.UI.elemento('td');
                if (tematica.id) {
                    const editar = SGC.UI.editar('tematicas-formulario.html', tematica.id);
                    SGC.Idioma.atributo(editar, 'aria-label', 'Editar temática ' + tematica.nombre);
                    acciones.append(editar);
                } else SGC.Idioma.texto(acciones, 'Sin identificador');
                fila.append(
                    SGC.UI.elemento('td', '', tematica.codigo),
                    SGC.UI.elemento('td', 'tabla__nombre', tematica.nombre),
                    SGC.UI.elemento('td', '', tematica.descripcion || 'Sin descripción', !tematica.descripcion),
                    acciones
                );
                cuerpo.append(fila);
            });
            SGC.Idioma.texto(cantidad, visibles.length + (visibles.length === 1 ? ' registro' : ' registros'));
            vacio.hidden = visibles.length > 0;
            tabla.hidden = visibles.length === 0;
            SGC.Idioma.texto(vacio, registros.length ? 'No se encontraron coincidencias.' :
                'Todavía no hay temáticas registradas.');
            document.getElementById('aviso').hidden = true;
        } catch (error) {
            SGC.UI.fallo(error);
        }
    }

    const controles = ['buscar', 'filtro-codigo', 'filtro-descripcion'].map(id => document.getElementById(id));
    controles.forEach(control => control.addEventListener('input', listar));
    window.addEventListener('pageshow', listar);
    window.addEventListener('storage', evento => {
        if (evento.key === 'tematicas' || evento.key === null) listar();
    });
    listar();
})();

