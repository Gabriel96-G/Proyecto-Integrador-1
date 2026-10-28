(() => {
    const { aviso, fallo, errores, limpiar } = SGC.UI;
    const formulario = document.getElementById('catalogo-form');
    const codigo = document.getElementById('codigo');
    const guardar = document.getElementById('guardar');
    let guardado = false;
    try { codigo.value = SGC.Datos.siguienteCodigo(); }
    catch (error) { fallo(error); guardar.disabled = true; }
    window.addEventListener('storage', () => {
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
            const entrada = { nombre: document.getElementById('nombre').value.trim(),
                descripcion: document.getElementById('descripcion').value.trim() };
            if (!errores(formulario, SGC.Validacion.sefia(entrada, SGC.Datos.leer('sefia')))) return;
            guardar.disabled = true;
            const registro = await SGC.Datos.guardar('sefia', entrada);
            formulario.reset();
            limpiar(formulario);
            codigo.value = SGC.Datos.siguienteCodigo();
            aviso('El área S.E.F.I.A se guardó correctamente con el código ' + registro.codigo + '.', 'confirmacion');
            guardado = true;
        } catch (error) { fallo(error); }
        finally { guardar.disabled = false; }
    });
})();
