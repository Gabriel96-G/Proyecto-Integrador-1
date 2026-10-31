// HU-44, HU-45 y HU-46: Listado, búsqueda y acceso a la edición de niveles.

const tablaNiveles = document.getElementById("tabla-niveles");
const cuerpoTabla = document.getElementById("cuerpo-tabla-niveles");
const mensajeListado = document.getElementById("mensaje-listado");
const campoBusqueda = document.getElementById("buscar-nivel");

// Permite buscar sin distinguir mayúsculas ni tildes.
function normalizarTexto(texto) {
    return String(texto || "").trim().toLowerCase()
        .normalize("NFD").replace(/[\u0300-\u036f]/g, "");
}

// Agrega los valores iniciales si el catálogo todavía no existe.
function crearNivelesIniciales() {
    if (localStorage.getItem("nivelesComplejidad") === null) {
        const nivelesIniciales = [
            {
                codigo: "1",
                nombre: "Básico",
                descripcion: "Nivel básico."
            },
            {
                codigo: "2",
                nombre: "Intermedio",
                descripcion: "Nivel intermedio."
            },
            {
                codigo: "3",
                nombre: "Avanzado",
                descripcion: "Nivel avanzado."
            },
            {
                codigo: "4",
                nombre: "Certificación",
                descripcion: "Nivel de certificación."
            },
            {
                codigo: "5",
                nombre: "Nivel variable",
                descripcion: "Nivel definido según el curso."
            }
        ];

        localStorage.setItem(
            "nivelesComplejidad",
            JSON.stringify(nivelesIniciales)
        );
    }
}

// Obtiene los niveles guardados.
function obtenerNiveles() {
    try {
        const niveles =
            JSON.parse(localStorage.getItem("nivelesComplejidad")) || [];

        if (Array.isArray(niveles)) {
            return niveles;
        }
    } catch (error) {
        console.error(
            "No fue posible cargar los niveles de complejidad.",
            error
        );
    }

    return [];
}

// Agrega un nivel a la tabla.
function agregarFila(nivel) {
    const fila = document.createElement("tr");

    const codigo = document.createElement("td");
    codigo.className = "tabla__codigo";
    codigo.textContent = nivel.codigo;

    const nombre = document.createElement("td");
    nombre.textContent = nivel.nombre;

    const descripcion = document.createElement("td");
    descripcion.textContent = nivel.descripcion;

    const accion = document.createElement("td");
    const editar = document.createElement("a");
    editar.className = "enlace-accion";
    SGC.Idioma.texto(editar, "Editar");
    editar.href = "niveles-complejidad-formulario.html?codigo=" + encodeURIComponent(nivel.codigo);
    SGC.Idioma.atributo(editar, 'aria-label', "Editar nivel " + nivel.nombre);
    accion.appendChild(editar);

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(descripcion);
    fila.appendChild(accion);

    cuerpoTabla.appendChild(fila);
}

// Muestra los niveles cuyo nombre contiene el texto buscado.
function mostrarNiveles() {
    const niveles = obtenerNiveles();
    const texto = normalizarTexto(campoBusqueda.value);
    const filtrados = niveles.filter(function (nivel) {
        return normalizarTexto(nivel.nombre).includes(texto);
    });

    cuerpoTabla.innerHTML = "";

    if (filtrados.length === 0) {
        tablaNiveles.hidden = true;
        SGC.Idioma.texto(mensajeListado, niveles.length === 0
            ? "No existen niveles de complejidad registrados."
            : "No se encontraron niveles con ese nombre.");
        mensajeListado.hidden = false;
        return;
    }

    mensajeListado.hidden = true;
    tablaNiveles.hidden = false;

    filtrados.forEach(agregarFila);
}

crearNivelesIniciales();
mostrarNiveles();

// Actualiza el listado al escribir o borrar la búsqueda.
campoBusqueda.addEventListener("input", mostrarNiveles);
