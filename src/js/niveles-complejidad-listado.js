// HU-44: Listado de niveles de complejidad

const tablaNiveles = document.getElementById("tabla-niveles");
const cuerpoTabla = document.getElementById("cuerpo-tabla-niveles");
const mensajeListado = document.getElementById("mensaje-listado");

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

    fila.appendChild(codigo);
    fila.appendChild(nombre);
    fila.appendChild(descripcion);

    cuerpoTabla.appendChild(fila);
}

// Muestra todos los niveles registrados.
function mostrarNiveles() {
    const niveles = obtenerNiveles();

    if (niveles.length === 0) {
        tablaNiveles.hidden = true;
        mensajeListado.hidden = false;
        return;
    }

    cuerpoTabla.innerHTML = "";
    mensajeListado.hidden = true;
    tablaNiveles.hidden = false;

    niveles.forEach(agregarFila);
}

crearNivelesIniciales();
mostrarNiveles();