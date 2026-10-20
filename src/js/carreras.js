(() => {
    const { elemento, aviso, fallo, errores, limpiar, editar, estadoListado } = SGC.UI;
    const formulario = document.getElementById('catalogo-form');
    if (!formulario) {
        function listar() {
            try {
                const registros = SGC.Datos.leer('carreras');
                const escuelas = SGC.Datos.leer('escuelas');
                const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
                const filtrados = registros.filter(r => SGC.Datos.normalizar(r.nombre).includes(texto));
                const cuerpo = document.getElementById('registros');
                cuerpo.replaceChildren();
                filtrados.forEach(carrera => {
                    const fila = elemento('tr');
                    const escuela = escuelas.find(e => SGC.Datos.referenciaEscuela(e) === carrera.escuela);
                    const accion = elemento('td');
                    if (carrera.id) accion.append(editar('carreras-formulario.html', carrera.id));
                    else accion.textContent = 'Sin identificador';
                    fila.append(elemento('td', 'tabla__codigo', carrera.codigo), elemento('td', '', carrera.nombre),
                        elemento('td', '', escuela?.nombre || 'Escuela no disponible'), accion);
                    cuerpo.append(fila);
                });
                estadoListado(registros.length, filtrados.length, 'carreras');
            } catch (error) { fallo(error); }
        }
        document.getElementById('buscar').addEventListener('input', listar);
        window.addEventListener('storage', listar);
        listar();
        return;
    }

    const guardar = document.getElementById('guardar');
    const escuela = document.getElementById('escuela');
    const id = new URLSearchParams(location.search).get('id');
    let actual = null;
    let guardado = false;
    function cargarEscuelas() {
        const valor = escuela.value;
        const escuelas = SGC.Datos.leer('escuelas');
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
        guardar.disabled = !escuelas.length;
        if (!escuelas.length) aviso('No hay escuelas registradas. Registre una en el catálogo de escuelas antes de crear una carrera.', 'advertencia');
        else if (document.getElementById('aviso').classList.contains('aviso--advertencia')) document.getElementById('aviso').hidden = true;
    }
    try {
        cargarEscuelas();
        if (id) {
            actual = SGC.Datos.leer('carreras').find(r => r.id === id);
            if (!actual) throw new Error('No se encontró la carrera solicitada. Vuelva al listado.');
            ['codigo', 'nombre', 'escuela'].forEach(campo => { document.getElementById(campo).value = actual[campo]; });
            document.title = 'Modificar carrera | SGC';
            document.getElementById('titulo').textContent = 'Modificar carrera';
            document.getElementById('ruta').textContent = 'Catálogos / Carreras / Modificación';
        }
    } catch (error) { fallo(error); guardar.disabled = true; }
    window.addEventListener('storage', evento => {
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
            if (!errores(formulario, SGC.Validacion.carrera(entrada, SGC.Datos.leer('carreras'), SGC.Datos.leer('escuelas')))) return;
            guardar.disabled = true;
            const registro = await SGC.Datos.guardar('carreras', entrada);
            if (actual) actual = registro;
            else formulario.reset();
            limpiar(formulario);
            aviso('La carrera se guardó correctamente. Puede consultarla en el listado.', 'confirmacion');
            guardado = true;
        } catch (error) { fallo(error); }
        finally { guardar.disabled = false; }
    });
})();
