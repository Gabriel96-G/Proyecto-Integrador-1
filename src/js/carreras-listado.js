(() => {
    const { elemento, fallo, editar, estadoListado } = SGC.UI;
    const buscar = document.getElementById('buscar');
    const filtroEscuela = document.getElementById('filtro-escuela');

    function cargarEscuelas(escuelas) {
        const seleccion = filtroEscuela.value;
        const todas = elemento('option', '', 'Todas las escuelas', true);
        todas.value = '';
        filtroEscuela.replaceChildren(todas);
        escuelas.forEach(escuela => {
            const opcion = elemento('option', '', escuela.nombre);
            opcion.value = SGC.Datos.referenciaEscuela(escuela);
            filtroEscuela.append(opcion);
        });
        // Mantiene la escuela elegida cuando se actualiza el catálogo.
        filtroEscuela.value = seleccion;
        if (filtroEscuela.selectedIndex === -1) filtroEscuela.value = '';
    }

    function listar() {
        try {
            const registros = SGC.CarrerasDatos.leer();
            const escuelas = SGC.CarrerasDatos.leerEscuelas();
            cargarEscuelas(escuelas);
            const texto = SGC.Datos.normalizar(buscar.value);
            const filtrados = registros.filter(carrera => {
                const coincideTexto = SGC.Datos.normalizar(carrera.codigo).includes(texto) ||
                    SGC.Datos.normalizar(carrera.nombre).includes(texto);
                const coincideEscuela = !filtroEscuela.value || String(carrera.escuela) === filtroEscuela.value;
                return coincideTexto && coincideEscuela;
            });
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
    buscar.addEventListener('input', listar);
    filtroEscuela.addEventListener('change', listar);
    document.getElementById('limpiar-filtros').addEventListener('click', () => {
        buscar.value = '';
        filtroEscuela.value = '';
        listar();
    });
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
