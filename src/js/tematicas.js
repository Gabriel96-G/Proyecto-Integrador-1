(() => {
    const formulario = document.getElementById('catalogo-form');
    const codigo = document.getElementById('codigo');
    const guardar = document.getElementById('guardar');
    const parametros = new URLSearchParams(location.search);
    const modificando = parametros.has('id');
    const id = parametros.get('id');
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
            const registros = leerTematicas();
            if (modificando) {
                const actual = registros.find(r => r.id === id);
                if (!actual) throw new Error('No se encontró la temática solicitada. Vuelva al listado.');
                codigo.value = actual.codigo;
            } else codigo.value = siguienteCodigo(registros);
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
            const indice = modificando ? registros.findIndex(r => r.id === id) : -1;
            if (modificando && indice < 0) throw new Error('La temática ya no está disponible. Vuelva al listado.');
            const nombre = document.getElementById('nombre').value.trim();
            const descripcion = document.getElementById('descripcion').value.trim();
            const errores = {};
            if (!nombre) errores.nombre = 'Ingrese el nombre de la temática.';
            else if (nombre.length > 150) errores.nombre = 'Use como máximo 150 caracteres.';
            else if (registros.some((r, i) => i !== indice && normalizar(r.nombre) === normalizar(nombre))) {
                errores.nombre = 'Esta temática ya está registrada.';
            }
            if (descripcion.length > 2000) errores.descripcion = 'Use como máximo 2000 caracteres.';
            if (!SGC.UI.errores(formulario, errores)) return;
            const registro = modificando ? { ...registros[indice], nombre, descripcion } :
                { id: crypto.randomUUID(), codigo: siguienteCodigo(registros), nombre, descripcion };
            if (modificando) registros[indice] = registro;
            else registros.push(registro);
            localStorage.setItem('tematicas', JSON.stringify(registros));
            if (!modificando) formulario.reset();
            SGC.UI.limpiar(formulario);
            actualizarCodigo();
    SGC.UI.aviso(
        modificando
            ? 'Los cambios de la temática se guardaron correctamente.'
            : 'La temática se guardó correctamente con el código ' + registro.codigo + '.',
        'confirmacion'
    );
    mostrarMensajeExito('La temática se guardó con éxito.', 'tematicas-listado.html');
        } catch (error) { SGC.UI.fallo(error); }
    });
    window.addEventListener('storage', evento => {
        if (evento.key === 'tematicas' || evento.key === null) actualizarCodigo();
    });
    if (modificando) {
        SGC.Idioma.texto(document.querySelector('title'), 'Modificar temática | SGC');
        SGC.Idioma.texto(document.getElementById('titulo'), 'Modificar temática');
        SGC.Idioma.texto(document.getElementById('ruta'), 'Catálogos / Temáticas / Modificación');
        SGC.Idioma.texto(guardar, 'Guardar cambios');
        try {
            const actual = leerTematicas().find(r => r.id === id);
            if (!actual) throw new Error('No se encontró la temática solicitada. Vuelva al listado.');
            document.getElementById('nombre').value = actual.nombre;
            document.getElementById('descripcion').value = actual.descripcion || '';
        } catch (error) { SGC.UI.fallo(error); }
    }
    actualizarCodigo();
})();
