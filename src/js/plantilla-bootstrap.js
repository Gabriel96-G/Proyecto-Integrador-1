// Se ejecuta antes de idioma.js y sesion.js: ambos necesitan estos elementos.
(() => {
    const cabecera = document.querySelector("header[data-raiz]");
    if (!cabecera) return;
    const menu = document.querySelector("nav[data-seccion]");
    const raiz = cabecera.dataset.raiz; // "./" desde index; "../" desde pages.

    cabecera.innerHTML = `
        <a class="cabecera__marca" href="${menu ? "inicio.html" : raiz + "index.html"}">
            <img class="cabecera__logo" src="${raiz}img/logo-cenfotec.png" alt="Universidad CENFOTEC">
        </a>
        <span class="cabecera__nombre" data-i18n="gestionCurricular">Gestión curricular</span>
        ${menu ? `<button class="navbar-toggler" type="button"
            data-bs-toggle="collapse" data-bs-target="#menu-principal"
            aria-controls="menu-principal" aria-expanded="false" data-i18n="menu">Menú</button>` :
        '<span class="cabecera__institucion">Universidad CENFOTEC</span>'}
        <form id="formulario-idioma" class="selector-idioma">
            <label for="idioma" data-i18n="idioma">Idioma</label>
            <select class="form-select" id="idioma" name="idioma">
                <option value="es" lang="es">Español</option>
                <option value="en" lang="en">English</option>
            </select>
            <button class="btn" type="submit" data-i18n="aplicarIdioma">Aplicar</button>
            <span id="estado-idioma" class="visually-hidden selector-idioma__estado" role="status" aria-live="polite"></span>
        </form>`;

    if (!menu) return; // Las pantallas públicas no tienen menú ni cierre de sesión.
    const opciones = [
        ["inicio", "Inicio"], ["usuarios", "Usuarios"],
        ["catalogos", "Catálogos"], ["cursos", "Cursos"]
    ];
    const enlaces = opciones.map(([clave, nombre]) => `
        <li class="nav-item navegacion__item">
            <a class="nav-link navegacion__enlace" href="${clave}.html"
               ${clave === menu.dataset.seccion ? 'aria-current="page"' : ""}>
                <img class="icono-menu" src="${raiz}img/${clave}.svg" alt="">
                <span data-i18n="${clave}">${nombre}</span>
            </a>
        </li>`).join("");
    menu.innerHTML = `
        <div class="collapse navbar-collapse flex-column align-items-stretch gap-3" id="menu-principal">
            <ul class="nav navegacion__lista">${enlaces}</ul>
            <a class="navegacion__salir" href="login.html">
                <img class="icono-menu" src="${raiz}img/cerrar.svg" alt="">
                <span data-i18n="cerrarSesion">Cerrar sesión</span>
            </a>
        </div>`;

    const panel = document.getElementById("menu-principal");
    const boton = cabecera.querySelector(".navbar-toggler");
    // Escape cierra el menú móvil y devuelve el foco al botón que lo abrió.
    document.addEventListener("keydown", evento => {
        if (evento.key === "Escape" && panel.classList.contains("show") &&
            boton.offsetWidth && (panel.contains(evento.target) || evento.target === boton)) {
            bootstrap.Collapse.getInstance(panel)?.hide();
            boton.focus();
        }
    });

    // Si el CDN no responde, mostrar los enlaces para que se pueda navegar y salir.
    document.addEventListener("DOMContentLoaded", () => {
        if (!window.bootstrap?.Collapse) {
            panel.classList.remove("collapse");
            boton.hidden = true;
        }
    });
})();
