// HU-14 y HU-15: Listado y bÃºsqueda de escuelas

const tablaEscuelas = document.getElementById("tabla-escuelas");
const cuerpoTabla = document.getElementById("cuerpo-tabla-escuelas");
const mensajeListado = document.getElementById("mensaje-listado");
const campoBusqueda = document.getElementById("buscar-escuela");

// Obtiene las escuelas guardadas por la HU-13.
function obtenerEscuelas() {
    try {
        const escuelas = JSON.parse(localStorage.getItem("escuelas")) || [];

        if (Array.isArray(escuelas)) {
            return escuelas;
        }
    } catch (error) {
        console.error("No fue posible cargar las escuelas.", error);
    }

    return [];
}

// Agrega una escuela como una nueva fila de la tabla.
function agregarFila(escuela) {
    const fila = document.createElement("tr");

    const codigo = document.createElement("td");
    codigo.className = "tabla__codigo";
    codigo.textContent = escuela.codigo;

    const nombre = document.createElement("td");
    nombre.textContent = escuela.nombre;

    const director = document.createElement("td");
    director.textContent = escuela.directorAsociado;

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(director);
    cuerpoTabla.appendChild(fila);
}

// Muestra las escuelas recibidas en la tabla.
function mostrarEscuelas(escuelas, mensajeVacio) {
    cuerpoTabla.innerHTML = "";

    if (escuelas.length === 0) {
        tablaEscuelas.hidden = true;
        mensajeListado.textContent = mensajeVacio;
        mensajeListado.hidden = false;
        return;
    }

    mensajeListado.hidden = true;
    tablaEscuelas.hidden = false;

    escuelas.forEach(agregarFila);
}

const escuelas = obtenerEscuelas();

mostrarEscuelas(escuelas, "No existen escuelas registradas.");

// Filtra las escuelas mientras el usuario escribe.
campoBusqueda.addEventListener("input", function () {
    const texto = campoBusqueda.value.trim().toLowerCase();

    const escuelasFiltradas = escuelas.filter(function (escuela) {
        return escuela.nombre.toLowerCase().includes(texto);
    });

    mostrarEscuelas(
        escuelasFiltradas,
        "No se encontraron escuelas con ese nombre."
    );
});