// Muestra el panel únicamente cuando hay una sesión de administrador.
try {
    const sesion = JSON.parse(sessionStorage.getItem("usuarioActual"));
    const usuarios = SGC.Datos.leer("usuarios");
    const usuario = usuarios.find(function (registro) {
        return sesion && sesion.rol === "administrador" &&
            String(registro.correo).trim().toLowerCase() === sesion.correo &&
            registro.rol === "administrador" &&
            (!registro.estado || registro.estado === "activo");
    });

    if (!usuario) {
        sessionStorage.removeItem("usuarioActual");
        window.location.replace("login.html");
    } else {
        document.getElementById("nombre-usuario").textContent = usuario.nombre;
        document.getElementById("panel-inicio").hidden = false;
    }
} catch (error) {
    window.location.replace("login.html");
}
