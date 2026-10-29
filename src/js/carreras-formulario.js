(() => {
    const { elemento, aviso, fallo, errores, limpiar } = SGC.UI;
    const formulario = document.getElementById('catalogo-form');
    const guardar = document.getElementById('guardar');
    const escuela = document.getElementById('escuela');
    const parametros = new URLSearchParams(location.search);
    const modificando = parametros.has('id');
    const id = parametros.get('id');
    let actual = null;
    let guardado = false;
    let cargado = false;
    let guardando = false;
    let hayEscuelas = false;
    function ajustarGuardar() {
        guardar.disabled = !cargado || guardando || !hayEscuelas;
    }
    function cargarEscuelas() {
        const valor = escuela.value;
        const escuelas = SGC.CarrerasDatos.leerEscuelas();
        escuela.replaceChildren();
        const primera = elemento('option', '', 'Seleccione una escuela');
        primera.value = '';
        escuela.append(primera);
        escuelas.forEach(e => {
            const opcion = elemento('option', '', e.nombre);
            opcion.value = SGC.Datos.referenciaEscuela(e);
            escuela.append(opcion);
        });
        escuela.value = valor;
        hayEscuelas = escuelas.length > 0;
        ajustarGuardar();
        if (!hayEscuelas) aviso('No hay escuelas registradas. Registre una en el catálogo de escuelas para guardar la carrera.', 'advertencia');
        else if (document.getElementById('aviso').classList.contains('aviso--advertencia')) document.getElementById('aviso').hidden = true;
    }
    try {
        if (modificando) {
            document.title = 'Modificar carrera | SGC';
            document.getElementById('titulo').textContent = 'Modificar carrera';
            document.getElementById('ruta').textContent = 'Catálogos / Carreras / Modificación';
            guardar.textContent = 'Guardar cambios';
            actual = SGC.CarrerasDatos.leer().find(r => r.id === id);
            if (!actual) throw new Error('No se encontró la carrera solicitada. Vuelva al listado.');
            ['codigo', 'nombre'].forEach(campo => { document.getElementById(campo).value = actual[campo] ?? ''; });
        }
        cargado = true;
        cargarEscuelas();
        if (actual) escuela.value = actual.escuela;
    } catch (error) { fallo(error); guardar.disabled = true; }
    window.addEventListener('storage', evento => {
        if (!cargado) return;
        if (evento.key === 'escuelas' || evento.key === null) {
            try { cargarEscuelas(); } catch (error) { fallo(error); guardar.disabled = true; }
        }
    });
    formulario.addEventListener('input', () => {
        if (guardado) { document.getElementById('aviso').hidden = true; guardado = false; }
    });
    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        if (guardar.disabled) return;
        try {
            const entrada = { codigo: document.getElementById('codigo').value.trim(),
                nombre: document.getElementById('nombre').value.trim(), escuela: escuela.value };
            if (actual) entrada.id = actual.id;
            if (!errores(formulario, SGC.CarrerasValidacion.validar(entrada, SGC.CarrerasDatos.leer(), SGC.CarrerasDatos.leerEscuelas()))) return;
            guardando = true;
            ajustarGuardar();
            const registro = await SGC.CarrerasDatos.guardar(entrada);
            if (actual) actual = registro;
            else formulario.reset();
            limpiar(formulario);
            aviso(modificando ? 'Los cambios de la carrera se guardaron correctamente.' :
                'La carrera se guardó correctamente. Puede consultarla en el listado.', 'confirmacion');
            guardado = true;
            if (!modificando) {
                mostrarMensajeExito('La carrera se guardó con éxito.', 'carreras-listado.html');
            }
        } catch (error) { fallo(error); }
        finally { guardando = false; ajustarGuardar(); }
    });
})();
