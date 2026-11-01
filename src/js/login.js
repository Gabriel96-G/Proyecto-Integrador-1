const formularioLogin = document.getElementById("formulario-login");
const campoCorreo = document.getElementById("correo");
const campoContrasena = document.getElementById("contrasena");
const errorCorreo = document.getElementById("correo-mensaje");
const errorContrasena = document.getElementById("contrasena-mensaje");
const mensajeLogin = document.getElementById("mensaje-login");

function mostrarMensajeLogin(texto) {
    SGC.Idioma.texto(mensajeLogin, texto);
    mensajeLogin.hidden = false;
}

// Crea el usuario de prueba si todavía no existe.
function prepararUsuarioPrueba() {
    const usuarios = SGC.Datos.leer("usuarios");
    const correoPrueba = "prueba@ucenfotec.ac.cr";

    const existe = usuarios.some(function (usuario) {
        return String(usuario.correo || "").trim().toLowerCase() === correoPrueba;
    });

    if (existe) return;

    usuarios.push({
        id: crypto.randomUUID(),
        identificacion: "PRUEBA-2026",
        nombre: "Usuario",
        primerApellido: "Prueba",
        correo: correoPrueba,
        contrasena: "Prueba2026",
        rol: "administrador",
        estado: "activo"
    });

    localStorage.setItem("usuarios", JSON.stringify(usuarios));
}

try {
    prepararUsuarioPrueba();
} catch (error) {
    mostrarMensajeLogin(
        "No se pudo preparar la cuenta de prueba. Revise los datos guardados en el navegador."
    );
}

formularioLogin.addEventListener("submit", function (evento) {
    evento.preventDefault();

    const correo = campoCorreo.value.trim().toLowerCase();
    const contrasena = campoContrasena.value;

    // Limpia los errores del intento anterior.
    SGC.Idioma.texto(errorCorreo, "");
    SGC.Idioma.texto(errorContrasena, "");
    campoCorreo.removeAttribute("aria-invalid");
    campoContrasena.removeAttribute("aria-invalid");
    mensajeLogin.hidden = true;

    if (correo === "") {
        SGC.Idioma.texto(errorCorreo, "Ingrese el correo institucional.");
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo)) {
        SGC.Idioma.texto(errorCorreo, "Ingrese un correo electrónico válido.");
    }

    if (contrasena === "") {
        SGC.Idioma.texto(errorContrasena, "Ingrese la contraseña.");
    }

    if (errorCorreo.textContent !== "") {
        campoCorreo.setAttribute("aria-invalid", "true");
    }
    if (errorContrasena.textContent !== "") {
        campoContrasena.setAttribute("aria-invalid", "true");
    }
    if (errorCorreo.textContent !== "" || errorContrasena.textContent !== "") {
        if (errorCorreo.textContent !== "") campoCorreo.focus();
        else campoContrasena.focus();
        return;
    }

    try {
        // Usa los mismos usuarios que guarda el formulario de registro.
        const usuarios = SGC.Datos.leer("usuarios");
        const usuario = usuarios.find(function (registro) {
            return String(registro.correo).trim().toLowerCase() === correo &&
                registro.contrasena === contrasena &&
                registro.rol === "administrador" &&
                (!registro.estado || registro.estado === "activo");
        });

        if (!usuario) {
            mostrarMensajeLogin("El correo o la contraseña no son correctos, o la cuenta no está habilitada.");
            return;
        }

        // Guarda los datos de la sesión sin copiar la contraseña.
        sessionStorage.setItem("usuarioActual", JSON.stringify({
            id: usuario.id,
            nombre: usuario.nombre,
            correo: correo,
            rol: usuario.rol
        }));

        window.location.href = "inicio.html";
    } catch (error) {
        mostrarMensajeLogin("No se pudo iniciar sesión. Revise los usuarios registrados y vuelva a intentarlo.");
    }
});
