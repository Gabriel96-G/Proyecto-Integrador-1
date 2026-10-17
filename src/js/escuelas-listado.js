// HU-14: Listado de escuelas

const tablaEscuelas = document.getElementById("tabla-escuelas");
const cuerpoTabla = document.getElementById("cuerpo-tabla-escuelas");
const mensajeListado = document.getElementById("mensaje-listado");

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

// Muestra todas las escuelas registradas.
function mostrarEscuelas() {
    const escuelas = obtenerEscuelas();

    if (escuelas.length === 0) {
        tablaEscuelas.hidden = true;
        mensajeListado.hidden = false;
        return;
    }

    cuerpoTabla.innerHTML = "";
    mensajeListado.hidden = true;
    tablaEscuelas.hidden = false;

    escuelas.forEach(agregarFila);
}

mostrarEscuelas();
