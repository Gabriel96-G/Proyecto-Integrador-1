(() => {
    const { elemento, fallo, editar, estadoListado } = SGC.UI;
    const buscar = document.getElementById('buscar');
    const dialogo = document.getElementById('confirmar-eliminar-carrera');
    let pendiente = null;
    let eliminando = false;

    function solicitarEliminacion(id) {
        try {
            const { carrera } = SGC.CarrerasDatos.comprobarEliminacion(id);
            pendiente = id;
            document.getElementById('carrera-elegida').textContent = carrera.codigo + ' · ' + carrera.nombre;
            dialogo.returnValue = '';
            dialogo.showModal();
        } catch (error) { fallo(error); }
    }

    dialogo.addEventListener('close', async () => {
        const id = pendiente;
        pendiente = null;
        if (!id || dialogo.returnValue !== 'eliminar' || eliminando) return;
        eliminando = true;
        try {
            await SGC.CarrerasDatos.eliminar(id);
            listar();
            SGC.UI.aviso('Se eliminó la carrera.', 'confirmacion');
        } catch (error) { fallo(error); }
        finally { eliminando = false; buscar.focus(); }
    });

    function listar() {
        try {
            const registros = SGC.CarrerasDatos.leer();
            const escuelas = SGC.CarrerasDatos.leerEscuelas();
            const texto = SGC.Datos.normalizar(buscar.value);
            const filtrados = registros.filter(carrera =>
                SGC.Datos.normalizar(carrera.codigo).includes(texto) ||
                SGC.Datos.normalizar(carrera.nombre).includes(texto));
            const cuerpo = document.getElementById('registros');
            cuerpo.replaceChildren();
            filtrados.forEach(carrera => {
                const fila = elemento('tr');
                const escuela = escuelas.find(e => SGC.Datos.referenciaEscuela(e) === String(carrera.escuela));
                const accion = elemento('td', 'text-nowrap');
                if (carrera.id) {
                    const enlace = editar('carreras-formulario.html', carrera.id);
                    SGC.Idioma.atributo(enlace, 'aria-label', 'Editar carrera ' + carrera.nombre);
                    const eliminar = elemento('button', 'btn btn-outline-danger btn-sm ms-2', 'Eliminar', true);
                    eliminar.type = 'button';
                    SGC.Idioma.atributo(eliminar, 'aria-label', 'Eliminar carrera ' + carrera.nombre);
                    eliminar.addEventListener('click', () => solicitarEliminacion(carrera.id));
                    accion.append(enlace, eliminar);
                }
                else SGC.Idioma.texto(accion, 'Sin identificador');
                fila.append(elemento('td', 'tabla__codigo', carrera.codigo), elemento('td', '', carrera.nombre),
                    elemento('td', '', escuela?.nombre || 'Escuela no disponible', !escuela), accion);
                cuerpo.append(fila);
            });
            estadoListado(registros.length, filtrados.length, 'carreras');
            document.getElementById('aviso').hidden = true;
        } catch (error) { fallo(error); }
    }
    buscar.addEventListener('input', listar);
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
