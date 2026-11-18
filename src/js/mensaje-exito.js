// El mismo aviso y sus traducciones sirven para todos los catálogos.
function mostrarMensajeExito(texto, listado) {
    const migrada = document.body.classList.contains("con-bootstrap");
    const usarBootstrap = migrada && window.bootstrap?.Modal;
    const origen = document.activeElement;
    const ventana = document.createElement(usarBootstrap ? "div" : "dialog");
    ventana.className = usarBootstrap ? "modal" : "mensaje-exito";
    ventana.setAttribute("aria-labelledby", "mensaje-exito-titulo");
    ventana.setAttribute("aria-describedby", "mensaje-exito-texto");

    const contenido = `
        <span class="mensaje-exito__icono" aria-hidden="true">✓</span>
        <h2 id="mensaje-exito-titulo"></h2>
        <p id="mensaje-exito-texto"></p>
        <button class="boton boton--principal" type="button"></button>`;
    ventana.innerHTML = usarBootstrap
        ? `<div class="modal-dialog modal-dialog-centered"><div class="modal-content mensaje-exito">${contenido}</div></div>`
        : contenido;

    const aceptar = ventana.querySelector("button");
    SGC.Idioma.texto(ventana.querySelector("h2"), "¡Guardado con éxito!");
    SGC.Idioma.texto(ventana.querySelector("p"), texto);
    SGC.Idioma.texto(aceptar, "Aceptar");
    document.body.appendChild(ventana);

    let aceptado = false;
    function alCerrar() {
        ventana.remove();
        if (aceptado || !migrada) window.location.href = listado;
        else origen?.focus(); // Si se cierra con Escape, el registro sigue guardado.
    }

    if (usarBootstrap) {
        ventana.tabIndex = -1;
        aceptar.classList.add("btn", "btn-primary");
        const modal = new bootstrap.Modal(ventana);
        // Aceptar es el único control del aviso; Tab y Mayús+Tab permanecen en él.
        aceptar.addEventListener("keydown", evento => {
            if (evento.key === "Tab") evento.preventDefault();
        });
        aceptar.addEventListener("click", () => { aceptado = true; modal.hide(); });
        ventana.addEventListener("shown.bs.modal", () => aceptar.focus());
        ventana.addEventListener("hidden.bs.modal", () => { modal.dispose(); alCerrar(); });
        modal.show();
    } else {
        // Los módulos sin Bootstrap y los navegadores sin acceso al CDN usan el aviso original.
        aceptar.addEventListener("click", () => { aceptado = true; ventana.close(); });
        ventana.addEventListener("close", alCerrar);
        ventana.showModal();
        aceptar.focus();
    }
}
