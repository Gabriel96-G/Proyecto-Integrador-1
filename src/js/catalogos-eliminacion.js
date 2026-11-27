SGC.EliminacionCatalogo = (() => {
    function preparar(campo, listar, busqueda) {
        const dialogo = document.getElementById("confirmar-eliminar");
        const elegido = document.getElementById("registro-elegido");
        const aviso = document.getElementById("aviso-eliminacion");
        let pendiente = null;

        function avisar(mensaje, exito = false) {
            SGC.Idioma.texto(aviso, mensaje);
            aviso.className = exito ? "alert alert-success" : "alert alert-warning";
            aviso.hidden = false;
        }

        dialogo.addEventListener("close", async () => {
            const registro = pendiente;
            pendiente = null;
            if (!registro || dialogo.returnValue !== "eliminar") return;

            try {
                await SGC.CatalogosCurso.eliminar(campo, registro);
                listar();
                avisar("Se eliminó el registro.", true);
                busqueda.focus();
            } catch (error) {
                avisar(error.message);
            }
        });

        return (celda, registro) => {
            const boton = document.createElement("button");
            boton.type = "button";
            boton.className = "btn btn-outline-danger btn-sm";
            SGC.Idioma.texto(boton, "Eliminar");
            SGC.Idioma.atributo(boton, "aria-label", "Eliminar registro " + registro.nombre);
            boton.addEventListener("click", () => {
                try {
                    SGC.CatalogosCurso.comprobarBaja(campo, registro);
                    pendiente = registro;
                    elegido.textContent = registro.codigo + " · " + registro.nombre;
                    aviso.hidden = true;
                    dialogo.returnValue = "";
                    dialogo.showModal();
                } catch (error) {
                    avisar(error.message);
                }
            });
            celda.classList.add("tabla__acciones-catalogo");
            celda.appendChild(boton);
        };
    }

    return { preparar };
})();
