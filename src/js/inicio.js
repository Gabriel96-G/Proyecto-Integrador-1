// Un solo panel: la sesión determina qué módulos aparecen.
(() => {
    const usuario = SGC.Sesion.comprobar();
    if (!usuario) return;
    document.getElementById("nombre-usuario").textContent = usuario.nombre;
    SGC.Idioma.rol(document.getElementById("rol-usuario"), usuario.rol);
    const soloReportes = ["rectoria", "vicerrectoria"].includes(usuario.rol);
    document.getElementById("aviso-reportes").hidden = !soloReportes;
    document.getElementById("elegir-modulo").hidden = soloReportes;
    document.getElementById("panel-inicio").hidden = false;
})();
