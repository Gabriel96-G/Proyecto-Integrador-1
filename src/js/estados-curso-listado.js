// HU-24: Listado de estados del curso

const tablaEstados = document.getElementById("tabla-estados");
const cuerpoTabla = document.getElementById("cuerpo-tabla-estados");
const mensajeListado = document.getElementById("mensaje-listado");

// Obtiene los estados guardados por la HU-23.
function obtenerEstados() {
    try {
        const estados =
            JSON.parse(localStorage.getItem("estadosCurso")) || [];

        if (Array.isArray(estados)) {
            return estados;
        }
    } catch (error) {
        console.error("No fue posible cargar los estados del curso.", error);
    }

    return [];
}

// Agrega un estado como una nueva fila de la tabla.
function agregarFila(estado) {
    const fila = document.createElement("tr");

    const codigo = document.createElement("td");
    codigo.className = "tabla__codigo";
    codigo.textContent = estado.codigo;

    const nombre = document.createElement("td");
    nombre.textContent = estado.nombre;

    const descripcion = document.createElement("td");
    descripcion.textContent = estado.descripcion;

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(descripcion);
    cuerpoTabla.appendChild(fila);
}

// Muestra todos los estados registrados.
function mostrarEstados() {
    const estados = obtenerEstados();

    if (estados.length === 0) {
        tablaEstados.hidden = true;
        mensajeListado.hidden = false;
        return;
    }

    cuerpoTabla.innerHTML = "";
    mensajeListado.hidden = true;
    tablaEstados.hidden = false;

    estados.forEach(agregarFila);
}

mostrarEstados();
