(() => {
    const { elemento, fallo, editar, estadoListado } = SGC.UI;
    function listar() {
        try {
            const registros = SGC.CarrerasDatos.leer();
            const escuelas = SGC.CarrerasDatos.leerEscuelas();
            const texto = SGC.Datos.normalizar(document.getElementById('buscar').value);
            const filtrados = registros.filter(r => SGC.Datos.normalizar(r.nombre).includes(texto));
            const cuerpo = document.getElementById('registros');
            cuerpo.replaceChildren();
            filtrados.forEach(carrera => {
                const fila = elemento('tr');
                const escuela = escuelas.find(e => SGC.Datos.referenciaEscuela(e) === carrera.escuela);
                const accion = elemento('td');
                if (carrera.id) {
                    const enlace = editar('carreras-formulario.html', carrera.id);
                    enlace.setAttribute('aria-label', 'Editar carrera ' + carrera.nombre);
                    accion.append(enlace);
                }
                else accion.textContent = 'Sin identificador';
                fila.append(elemento('td', 'tabla__codigo', carrera.codigo), elemento('td', '', carrera.nombre),
                    elemento('td', '', escuela?.nombre || 'Escuela no disponible'), accion);
                cuerpo.append(fila);
            });
            estadoListado(registros.length, filtrados.length, 'carreras');
            document.getElementById('aviso').hidden = true;
        } catch (error) { fallo(error); }
    }
    document.getElementById('buscar').addEventListener('input', listar);
    window.addEventListener('storage', listar);
    window.addEventListener('pageshow', listar);
    listar();
})();
