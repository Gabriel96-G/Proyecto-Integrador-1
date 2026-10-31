// HU-24, HU-25 y HU-26: Listado, búsqueda y acceso a la edición de estados.

const tablaEstados = document.getElementById("tabla-estados");
const cuerpoTabla = document.getElementById("cuerpo-tabla-estados");
const mensajeListado = document.getElementById("mensaje-listado");
const campoBusqueda = document.getElementById("buscar-estado");

// Permite buscar sin distinguir mayúsculas ni tildes.
function normalizarTexto(texto) {
    return String(texto || "").trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

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

    const accion = document.createElement("td");
    const editar = document.createElement("a");
    editar.className = "enlace-accion";
    editar.textContent = "Editar";
    editar.href = "estados-curso-formulario.html?codigo=" + encodeURIComponent(estado.codigo);
    editar.setAttribute("aria-label", "Editar estado " + estado.nombre);
    accion.appendChild(editar);

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(descripcion);
    fila.appendChild(accion);
    cuerpoTabla.appendChild(fila);
}

// Muestra los estados cuyo nombre contiene el texto buscado.
function mostrarEstados() {
    const estados = obtenerEstados();
    const texto = normalizarTexto(campoBusqueda.value);
    const filtrados = estados.filter(function (estado) {
        return normalizarTexto(estado.nombre).includes(texto);
    });

    cuerpoTabla.innerHTML = "";

    if (filtrados.length === 0) {
        tablaEstados.hidden = true;
        mensajeListado.textContent = estados.length === 0
            ? "No existen estados del curso registrados."
            : "No se encontraron estados con ese nombre.";
        mensajeListado.hidden = false;
        return;
    }

    mensajeListado.hidden = true;
    tablaEstados.hidden = false;

    filtrados.forEach(agregarFila);
}

mostrarEstados();

// Actualiza el listado cada vez que el usuario escribe o borra la búsqueda.
campoBusqueda.addEventListener("input", mostrarEstados);
