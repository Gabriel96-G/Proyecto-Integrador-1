// Reglas del panel para las pantallas disponibles en esta iteración.
window.SGC = window.SGC || {};
SGC.Sesion = (() => {
    const roles = ["administrador", "director", "desarrollo", "rectoria", "vicerrectoria"];
    const cursos = ["cursos.html", "curso-detalle.html", "curso-formulario.html"];

    function permite(rol, pagina) {
        if (!roles.includes(rol)) return false;
        if (rol === "administrador") return true;
        if (["inicio.html", "cambiar-contrasena.html"].includes(pagina)) return true;
        return ["director", "desarrollo"].includes(rol) && cursos.includes(pagina);
    }

    function salir() {
        sessionStorage.removeItem("usuarioActual");
        location.replace("login.html");
    }

    function comprobar() {
        try {
            const sesion = JSON.parse(sessionStorage.getItem("usuarioActual"));
            if (!sesion?.id) return salir();
            const usuarios = SGC.Datos ? SGC.Datos.leer("usuarios") :
                (JSON.parse(localStorage.getItem("usuarios")) ??
                 JSON.parse(localStorage.getItem("sgc.aylin.sprint1.v1"))?.usuarios ?? []);
            const usuario = usuarios.find(u => String(u.id) === String(sesion.id));
            if (!usuario || !roles.includes(usuario.rol) || usuario.rol !== sesion.rol ||
                (usuario.estado && usuario.estado !== "activo")) return salir();

            const pagina = location.pathname.split("/").pop();
            if (!permite(usuario.rol, pagina)) {
                location.replace("inicio.html");
                return;
            }

            document.querySelectorAll("nav a[href], .modulos a[href]").forEach(enlace => {
                if (enlace.closest(".navegacion__salir")) return;
                if (!permite(usuario.rol, enlace.pathname.split("/").pop())) {
                    (enlace.closest(".modulo, li") || enlace).hidden = true;
                }
            });
            return usuario;
        } catch {
            salir();
        }
    }

    return { roles, comprobar, salir };
})();

if (!document.getElementById("formulario-login")) {
    SGC.Sesion.comprobar();
    window.addEventListener("pageshow", SGC.Sesion.comprobar);
    window.addEventListener("storage", evento => {
        if (evento.key === "usuarios" || evento.key === null) SGC.Sesion.comprobar();
    });
    document.addEventListener("click", evento => {
        if (evento.target.closest("a.navegacion__salir")) {
            evento.preventDefault();
            SGC.Sesion.salir();
        }
    });
}
