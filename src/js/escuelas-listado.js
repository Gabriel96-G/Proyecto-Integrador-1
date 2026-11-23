// Cada carrera guarda la referencia estable de su escuela, aunque cambie el código visible.
const tablaEscuelas = document.getElementById("tabla-escuelas");
const cuerpoTabla = document.getElementById("cuerpo-tabla-escuelas");
const mensajeListado = document.getElementById("mensaje-listado");
const campoBusqueda = document.getElementById("buscar-escuela");
const aviso = document.getElementById("aviso-escuela");
const dialogo = document.getElementById("confirmar-eliminar");
const { leer, referenciaEscuela, normalizar } = SGC.Datos;
let pendiente = null;

function avisar(texto, exito = false) {
    SGC.Idioma.texto(aviso, texto);
    aviso.className = exito ? "alert alert-success" : "alert alert-warning";
    aviso.hidden = false;
}

function asociadas(registros, referencia) {
    return registros.filter(r => String(r.escuela) === referencia);
}

function agregarFila(escuela, carreras) {
    const fila = cuerpoTabla.insertRow();
    fila.insertCell().textContent = escuela.codigo;
    fila.cells[0].className = "tabla__codigo";
    fila.insertCell().textContent = escuela.nombre;
    fila.insertCell().textContent = escuela.directorAsociado;
    const referencia = referenciaEscuela(escuela);
    const nombres = asociadas(carreras, referencia).map(c => c.nombre);
    const celda = fila.insertCell();
    if (nombres.length) celda.textContent = nombres.join(", ");
    else SGC.Idioma.texto(celda, "Sin carreras asociadas");

    const accion = fila.insertCell();
    const editar = document.createElement("a");
    editar.className = "enlace-accion";
    editar.href = "escuelas-formulario.html?codigo=" + encodeURIComponent(escuela.codigo);
    SGC.Idioma.texto(editar, "Editar");
    SGC.Idioma.atributo(editar, "aria-label", "Editar escuela " + escuela.nombre);
    const eliminar = document.createElement("button");
    eliminar.type = "button";
    eliminar.className = "btn btn-outline-danger btn-sm ms-2";
    SGC.Idioma.texto(eliminar, "Eliminar");
    eliminar.addEventListener("click", () => eliminarEscuela(referencia, false));
    accion.append(editar, eliminar);
}

function listarEscuelas() {
    cuerpoTabla.replaceChildren();
    try {
        const escuelas = leer("escuelas");
        const carreras = leer("carreras");
        const texto = normalizar(campoBusqueda.value);
        const visibles = escuelas.filter(e => normalizar(e.codigo).includes(texto) || normalizar(e.nombre).includes(texto));
        visibles.forEach(e => agregarFila(e, carreras));
        tablaEscuelas.hidden = !visibles.length;
        mensajeListado.hidden = !!visibles.length;
        if (!visibles.length) SGC.Idioma.texto(mensajeListado, escuelas.length
            ? "No se encontraron escuelas con ese código o nombre." : "No existen escuelas registradas.");
    } catch {
        tablaEscuelas.hidden = true;
        mensajeListado.hidden = false;
        SGC.Idioma.texto(mensajeListado, "No se pudo cargar el listado de escuelas.");
    }
}

function eliminarEscuela(referencia, confirmado) {
    try {
        // Releer incluso al confirmar: los datos pudieron cambiar en otra pestaña.
        const sesion = JSON.parse(sessionStorage.getItem("usuarioActual"));
        const admin = sesion?.id && leer("usuarios").find(u => String(u.id) === String(sesion.id));
        if (!admin || admin.rol !== "administrador" || (admin.estado && admin.estado !== "activo")) {
            return avisar("Solo un administrador activo puede eliminar escuelas.");
        }
        const escuelas = leer("escuelas");
        const escuela = escuelas.find(e => referenciaEscuela(e) === referencia);
        if (!escuela) return avisar("La escuela ya no está disponible.");
        if (asociadas(leer("carreras"), referencia).length) {
            return avisar("No se puede eliminar la escuela porque tiene carreras asociadas.");
        }
        if (asociadas(leer("cursos"), referencia).length) {
            return avisar("No se puede eliminar la escuela porque tiene cursos asociados.");
        }
        if (!confirmado) {
            pendiente = referencia;
            aviso.hidden = true;
            document.getElementById("escuela-elegida").textContent = escuela.codigo + " · " + escuela.nombre;
            dialogo.returnValue = "";
            dialogo.showModal();
            return;
        }
        localStorage.setItem("escuelas", JSON.stringify(escuelas.filter(e => e !== escuela)));
        listarEscuelas();
        avisar("Se eliminó la escuela.", true);
        campoBusqueda.focus();
    } catch {
        avisar("No se pudieron verificar los registros. No se eliminó ninguna escuela.");
    }
}

dialogo.addEventListener("close", () => {
    const referencia = pendiente;
    pendiente = null;
    if (referencia !== null && dialogo.returnValue === "eliminar") eliminarEscuela(referencia, true);
});
campoBusqueda.addEventListener("input", listarEscuelas);
window.addEventListener("pageshow", listarEscuelas);
window.addEventListener("storage", listarEscuelas);
listarEscuelas();
