(() => {
    const { elemento, fallo, editar, estadoListado } = SGC.UI;
    const buscar = document.getElementById('buscar');
    const filtroEscuela = document.getElementById('filtro-escuela');
    let escuelasAnteriores = '';

    function actualizarEscuelas(escuelas) {
        const firma = JSON.stringify(escuelas.map(e => [SGC.Datos.referenciaEscuela(e), e.nombre]));
        if (firma === escuelasAnteriores) return;
        const seleccion = filtroEscuela.value;
        const todas = elemento('option');
        todas.value = '';
        SGC.Idioma.texto(todas, 'Todas las escuelas');
        filtroEscuela.replaceChildren(todas);
        escuelas.forEach(escuela => {
            const opcion = elemento('option', '', escuela.nombre);
            opcion.value = SGC.Datos.referenciaEscuela(escuela);
            filtroEscuela.append(opcion);
        });
        if (seleccion && !escuelas.some(e => SGC.Datos.referenciaEscuela(e) === seleccion)) {
            const opcion = elemento('option');
            opcion.value = seleccion;
            SGC.Idioma.texto(opcion, 'Escuela no disponible');
            filtroEscuela.append(opcion);
        }
        filtroEscuela.value = seleccion;
        escuelasAnteriores = firma;
    }

    function listar() {
        try {
            const registros = SGC.CarrerasDatos.leer();
            const escuelas = SGC.CarrerasDatos.leerEscuelas();
            actualizarEscuelas(escuelas);
            const texto = SGC.Datos.normalizar(buscar.value);
            const codigo = SGC.Datos.normalizar(document.getElementById('filtro-codigo').value);
            const escuelaSeleccionada = filtroEscuela.value;
            const filtrados = registros.filter(carrera =>
                SGC.Datos.normalizar(carrera.codigo).includes(codigo) &&
                SGC.Datos.normalizar(carrera.nombre).includes(texto) &&
                (!escuelaSeleccionada || String(carrera.escuela) === escuelaSeleccionada));
            const cuerpo = document.getElementById('registros');
            cuerpo.replaceChildren();
            filtrados.forEach(carrera => {
                const fila = elemento('tr');
                const escuela = escuelas.find(e => SGC.Datos.referenciaEscuela(e) === String(carrera.escuela));
                const accion = elemento('td');
                if (carrera.id) {
                    const enlace = editar('carreras-formulario.html', carrera.id);
                    SGC.Idioma.atributo(enlace, 'aria-label', 'Editar carrera ' + carrera.nombre);
                    accion.append(enlace);
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
    const controles = ['buscar', 'filtro-codigo', 'filtro-escuela'].map(id => document.getElementById(id));
    controles.forEach(control => control.addEventListener('input', listar));
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
