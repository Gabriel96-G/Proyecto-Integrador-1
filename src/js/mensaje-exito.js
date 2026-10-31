// Ventana de confirmación compartida por los catálogos.
function mostrarMensajeExito(texto, listado) {
    const ventana = document.createElement("dialog");
    ventana.className = "mensaje-exito";
    ventana.setAttribute("aria-labelledby", "mensaje-exito-titulo");
    ventana.setAttribute("aria-describedby", "mensaje-exito-texto");

    ventana.innerHTML = `
        <span class="mensaje-exito__icono" aria-hidden="true">✓</span>
        <h2 id="mensaje-exito-titulo">¡Guardado con éxito!</h2>
        <p id="mensaje-exito-texto"></p>
        <button class="boton boton--principal" type="button" autofocus>Aceptar</button>
    `;
    SGC.Idioma.texto(ventana.querySelector("h2"), "¡Guardado con éxito!");
    SGC.Idioma.texto(ventana.querySelector("button"), "Aceptar");
    SGC.Idioma.texto(ventana.querySelector("p"), texto);

    ventana.querySelector("button").addEventListener("click", function () {
        ventana.close();
    });

    ventana.addEventListener("close", function () {
        ventana.remove();
        window.location.href = listado;
    });

    document.body.appendChild(ventana);
    ventana.showModal();
}
