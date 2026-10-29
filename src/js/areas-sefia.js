(() => {
    const { aviso, fallo, errores, limpiar } = SGC.UI;
    const formulario = document.getElementById('catalogo-form');
    const codigo = document.getElementById('codigo');
    const guardar = document.getElementById('guardar');
    const parametros = new URLSearchParams(location.search);
    const modificando = parametros.has('id');
    let actual = null;
    let guardado = false;
    function comprobarAdministrador() {
        const sesion = JSON.parse(sessionStorage.getItem('usuarioActual'));
        const administrador = sesion && SGC.Datos.leer('usuarios').find(usuario =>
            SGC.Datos.normalizar(usuario.correo) === SGC.Datos.normalizar(sesion.correo));
        if (!administrador || administrador.rol !== 'administrador' ||
            (administrador.estado && administrador.estado !== 'activo')) {
            throw new Error('Solo un administrador activo puede guardar áreas S.E.F.I.A.');
        }
    }
    try {
        comprobarAdministrador();
        if (modificando) {
            document.title = 'Modificar área S.E.F.I.A | SGC';
            document.getElementById('titulo').textContent = 'Modificar área S.E.F.I.A';
            document.getElementById('ruta').textContent = 'Catálogos / Áreas S.E.F.I.A / Modificación';
            guardar.textContent = 'Guardar cambios';
            actual = SGC.Datos.leer('sefia').find(area => area.id === parametros.get('id'));
            if (!actual) throw new Error('No se encontró el área solicitada. Vuelva al listado.');
            codigo.value = actual.codigo;
            document.getElementById('nombre').value = actual.nombre;
            document.getElementById('descripcion').value = actual.descripcion || '';
        } else codigo.value = SGC.Datos.siguienteCodigo();
    }
    catch (error) { fallo(error); guardar.disabled = true; }
    window.addEventListener('storage', () => {
        if (modificando) return;
        try { codigo.value = SGC.Datos.siguienteCodigo(); }
        catch (error) { fallo(error); guardar.disabled = true; }
    });
    formulario.addEventListener('input', () => {
        if (guardado) { document.getElementById('aviso').hidden = true; guardado = false; }
    });
    formulario.addEventListener('submit', async evento => {
        evento.preventDefault();
        if (guardar.disabled) return;
        try {
            comprobarAdministrador();
            // Conserva el código y los demás datos del área que se está editando.
            const entrada = { ...actual, nombre: document.getElementById('nombre').value.trim(),
                descripcion: document.getElementById('descripcion').value.trim() };
            if (!errores(formulario, SGC.Validacion.sefia(entrada, SGC.Datos.leer('sefia')))) return;
            guardar.disabled = true;
            const registro = await SGC.Datos.guardar('sefia', entrada);
            if (modificando) actual = registro;
            else formulario.reset();
            limpiar(formulario);
            codigo.value = modificando ? registro.codigo : SGC.Datos.siguienteCodigo();
            aviso(modificando ? 'Los cambios del área S.E.F.I.A se guardaron correctamente.' :
                'El área S.E.F.I.A se guardó correctamente con el código ' + registro.codigo + '.', 'confirmacion');
            guardado = true;
            if (!modificando) {
                mostrarMensajeExito('El área S.E.F.I.A se guardó con éxito.', 'areas-sefia-listado.html');
            }
        } catch (error) { fallo(error); }
        finally { guardar.disabled = false; }
    });
})();
