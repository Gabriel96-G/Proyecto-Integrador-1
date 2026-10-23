// Revisa la sesión al abrir la página y al regresar con el botón Atrás.
function comprobarSesion() {
    if (!sessionStorage.getItem("usuarioActual")) {
        window.location.replace("login.html");
    }
}

comprobarSesion();
window.addEventListener("pageshow", comprobarSesion);

const enlaceCerrarSesion = document.querySelector(".navegacion__salir");

if (enlaceCerrarSesion) {
    enlaceCerrarSesion.addEventListener("click", function (evento) {
        evento.preventDefault();

        // Elimina únicamente la sesión. Los registros guardados se conservan.
        sessionStorage.removeItem("usuarioActual");
        window.location.replace("login.html");
    });
}
