// HU-24, HU-25 y HU-26: Listado, búsqueda y acceso a la edición de estados.

const tablaEstados = document.getElementById("tabla-estados");
const cuerpoTabla = document.getElementById("cuerpo-tabla-estados");
const mensajeListado = document.getElementById("mensaje-listado");
const campoBusqueda = document.getElementById("buscar-estado");

// Permite buscar sin distinguir mayúsculas ni tildes.
function normalizarTexto(texto) {
    return String(texto ?? "").trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

let estados = [];

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
    SGC.Idioma.texto(editar, "Editar");
    editar.href = "estados-curso-formulario.html?codigo=" + encodeURIComponent(estado.codigo);
    SGC.Idioma.atributo(editar, 'aria-label', "Editar estado " + estado.nombre);
    accion.appendChild(editar);

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(descripcion);
    fila.appendChild(accion);
    cuerpoTabla.appendChild(fila);
}

// Muestra los estados cuyo código o nombre contiene el texto buscado.
function mostrarEstados() {
    const texto = normalizarTexto(campoBusqueda.value);
    const filtrados = estados.filter(function (estado) {
        return normalizarTexto(estado.codigo).includes(texto) ||
            normalizarTexto(estado.nombre).includes(texto);
    });

    cuerpoTabla.innerHTML = "";

    if (filtrados.length === 0) {
        tablaEstados.hidden = true;
        SGC.Idioma.texto(mensajeListado, estados.length === 0
            ? "No existen estados del curso registrados."
            : "No se encontraron estados con ese código o nombre.");
        mensajeListado.hidden = false;
        return;
    }

    mensajeListado.hidden = true;
    tablaEstados.hidden = false;

    filtrados.forEach(agregarFila);
}

async function cargarListado() {
    try {
        estados = await SGC.EstadosCurso.listar();
        mostrarEstados();
        campoBusqueda.addEventListener("input", mostrarEstados);
    } catch (error) {
        tablaEstados.hidden = true;
        SGC.Idioma.texto(mensajeListado, error.sinRuta ? error.message : "No se pudieron cargar los estados del curso.");
        mensajeListado.hidden = false;
    }
}

cargarListado();
