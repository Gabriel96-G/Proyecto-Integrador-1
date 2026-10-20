(() => {
    const formulario = document.getElementById('catalogo-form');
    const codigo = document.getElementById('codigo');
    const guardar = document.getElementById('guardar');
    const normalizar = texto => texto.trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').toLowerCase();

    function leerTematicas() {
        const texto = localStorage.getItem('tematicas');
        const registros = texto === null ? [] : JSON.parse(texto);
        if (!Array.isArray(registros) || registros.some(r => !r ||
            typeof r.nombre !== 'string' || !Number.isSafeInteger(Number(r.codigo)) || Number(r.codigo) < 1)) {
            throw new Error('No se pudieron leer las temáticas. Los datos guardados se conservaron sin cambios.');
        }
        return registros;
    }

    function siguienteCodigo(registros) {
        const siguiente = registros.reduce((mayor, r) => Math.max(mayor, Number(r.codigo)), 0) + 1;
        if (!Number.isSafeInteger(siguiente)) throw new Error('No se puede generar otro código de temática.');
        return siguiente;
    }

    function actualizarCodigo() {
        try {
            codigo.value = siguienteCodigo(leerTematicas());
            guardar.disabled = false;
        } catch (error) {
            SGC.UI.fallo(error);
            guardar.disabled = true;
        }
    }

    formulario.addEventListener('input', () => {
        document.getElementById('aviso').hidden = true;
    });
    formulario.addEventListener('submit', evento => {
        evento.preventDefault();
        if (guardar.disabled) return;
        try {
            const registros = leerTematicas();
            const nombre = document.getElementById('nombre').value.trim();
            const descripcion = document.getElementById('descripcion').value.trim();
            const errores = {};
            if (!nombre) errores.nombre = 'Ingrese el nombre de la temática.';
            else if (nombre.length > 150) errores.nombre = 'Use como máximo 150 caracteres.';
            else if (registros.some(r => normalizar(r.nombre) === normalizar(nombre))) {
                errores.nombre = 'Esta temática ya está registrada.';
            }
            if (descripcion.length > 2000) errores.descripcion = 'Use como máximo 2000 caracteres.';
            if (!SGC.UI.errores(formulario, errores)) return;
            const registro = { id: crypto.randomUUID(), codigo: siguienteCodigo(registros), nombre, descripcion };
            registros.push(registro);
            localStorage.setItem('tematicas', JSON.stringify(registros));
            formulario.reset();
            SGC.UI.limpiar(formulario);
            actualizarCodigo();
            SGC.UI.aviso('La temática se guardó correctamente con el código ' + registro.codigo + '.', 'confirmacion');
        } catch (error) { SGC.UI.fallo(error); }
    });
    window.addEventListener('storage', evento => {
        if (evento.key === 'tematicas' || evento.key === null) actualizarCodigo();
    });
    actualizarCodigo();
})();
