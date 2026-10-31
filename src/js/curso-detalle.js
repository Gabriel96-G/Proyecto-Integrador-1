
(() => {
    'use strict';

    const panel = document.getElementById('panel-detalle');
    const contenido = document.getElementById('contenido-detalle');
    const aviso = document.getElementById('aviso-detalle');
    const nombreCurso = document.getElementById('nombre-curso');
    const rolUsuario = document.getElementById('rol-usuario');
    const editarCurso = document.getElementById('editar-curso');

    const parametros = new URLSearchParams(window.location.search);
    const idCurso = parametros.get('id');

    const secciones = {
        identificacion: [
            ['Escuela', 'escuela'],
            ['Código', 'codigo'],
            ['Nombre del curso', 'nombre']
        ],
        clasificacion: [
            ['Estado del curso', 'estado'],
            ['Área S.E.F.I.A', 'areaSefia'],
            ['Temática', 'tematica'],
            ['Metodología de aprendizaje', 'metodologia'],
            ['Nivel de complejidad', 'nivelComplejidad'],
            ['Modalidad', 'modalidad']
        ],
        carga: [
            ['Créditos', 'creditos'],
            ['Horas de clase', 'horasClase'],
            ['Horas extraclase', 'horasExtraclase'],
            ['Total de horas', 'totalHoras']
        ],
        'power-campus': [
            ['Nombre en Power Campus', 'nombrePowerCampus'],
            ['Cantidad de caracteres', 'cantidadCaracteres']
        ],
        descriptiva: [
            ['Descripción corta', 'descripcionCorta'],
            ['Metadescripción', 'metadescripcion'],
            ['Descripción larga', 'descripcionLarga'],
            ['Competencia', 'competencia'],
            ['Capacidades específicas', 'capacidadesEspecificas'],
            ['Requisitos indispensables', 'requisitosIndispensables'],
            ['Requisitos deseables', 'requisitosDeseables'],
            ['Perfil de ingreso', 'perfilIngreso'],
            ['Perfil de salida', 'perfilSalida'],
            ['Palabras clave', 'palabrasClave']
        ],
        administrativa: [
            ['Disponible en e-commerce', 'ecommerce'],
            ['Período de e-commerce', 'periodoEcommerce'],
            ['Pertenece a un programa', 'pertenecePrograma'],
            ['Nombre del programa', 'nombrePrograma'],
            ['Moneda', 'moneda']
        ],
        certificacion: [
            ['Casa certificadora', 'casaCertificadora'],
            ['Nombre de la certificación', 'nombreCertificacion']
        ],
        complementaria: [
            ['Metadata', 'metadata'],
            ['Fecha de creación', 'creado'],
            ['Última modificación', 'actualizado'],
            ['Última modificación de metadata',
                'fechaModificacionMetadata']
        ]
    };

    const clavesCatalogos = {
        estado: ['estadosCurso', 'estadosCursos', 'estados-curso'],
        areaSefia: ['areasSEFIA'],
        tematica: ['tematicas'],
        metodologia: ['metodologiasAprendizaje'],
        nivelComplejidad: [
            'nivelesComplejidad',
            'niveles-complejidad'
        ],
        modalidad: ['modalidades'],
        moneda: ['monedas'],
        casaCertificadora: [
            'casasCertificadoras',
            'casas-certificadoras'
        ]
    };

    function mostrarAviso(mensaje) {
        SGC.Idioma.texto(aviso, mensaje);
        aviso.hidden = false;
    }

    function obtenerCatalogo(claves) {
        for (const clave of claves) {
            const texto = localStorage.getItem(clave);

            if (texto === null) continue;

            const registros = JSON.parse(texto);

            if (!Array.isArray(registros)) {
                throw new Error(
                    `El catálogo ${clave} no tiene un formato válido.`
                );
            }

            return registros;
        }

        return [];
    }

    function obtenerNombreCatalogo(valor, registros) {
        const registro = registros.find(elemento =>
            elemento &&
            String(elemento.id ?? elemento.codigo) === String(valor)
        );

        return registro ? registro.nombre : String(valor);
    }

    function formatearFecha(valor) {
        if (!valor) return 'Sin registrar';

        const fecha = new Date(valor);

        if (Number.isNaN(fecha.getTime())) {
            return 'Fecha no disponible';
        }

        return new Intl.DateTimeFormat('es-CR', {
            dateStyle: 'long',
            timeStyle: 'short'
        }).format(fecha);
    }

    function obtenerValor(curso, propiedad, escuelas) {
        const valor = curso[propiedad];

        if (valor === undefined || valor === null || valor === '') {
            return 'Sin registrar';
        }

        if (['creado', 'actualizado',
            'fechaModificacionMetadata'].includes(propiedad)) {
            return formatearFecha(valor);
        }

        if (propiedad === 'escuela') {
            return obtenerNombreCatalogo(valor, escuelas);
        }

        if (clavesCatalogos[propiedad]) {
            const registros = obtenerCatalogo(
                clavesCatalogos[propiedad]
            );

            return obtenerNombreCatalogo(valor, registros);
        }

        if (propiedad === 'ecommerce' ||
            propiedad === 'pertenecePrograma') {
            if (valor === 'si') return 'Sí';
            if (valor === 'no') return 'No';
        }

        return String(valor);
    }

    function agregarDato(contenedor, etiqueta, valor, curso, propiedad) {
        const grupo = document.createElement('div');
        grupo.className = 'formulario__campo';

        const termino = document.createElement('dt');
        termino.className = 'formulario__etiqueta';
        SGC.Idioma.texto(termino, etiqueta);

        const descripcion = document.createElement('dd');
        const original = curso[propiedad];
        if (original === undefined || original === null || original === '' ||
            (['ecommerce', 'pertenecePrograma'].includes(propiedad) && ['si', 'no'].includes(original))) {
            SGC.Idioma.texto(descripcion, valor);
        } else if (['creado', 'actualizado', 'fechaModificacionMetadata'].includes(propiedad)) {
            if (Number.isNaN(new Date(original).getTime())) SGC.Idioma.texto(descripcion, 'Fecha no disponible');
            else SGC.Idioma.fecha(descripcion, original, { dateStyle: 'long', timeStyle: 'short' });
        } else descripcion.textContent = valor;
        descripcion.style.margin = '0';
        descripcion.style.whiteSpace = 'pre-wrap';

        grupo.appendChild(termino);
        grupo.appendChild(descripcion);

        contenedor.appendChild(grupo);
    }

    function mostrarSeccion(nombre, campos, curso, escuelas) {
        const contenedor = document.getElementById(
            `detalle-${nombre}`
        );

        contenedor.replaceChildren();

        campos.forEach(([etiqueta, propiedad]) => {
            agregarDato(
                contenedor,
                etiqueta,
                obtenerValor(curso, propiedad, escuelas),
                curso,
                propiedad
            );
        });
    }

    function mostrarDetalle(curso, escuelas) {
        nombreCurso.textContent = curso.nombre;

        Object.entries(secciones).forEach(([nombre, campos]) => {
            mostrarSeccion(
                nombre,
                campos,
                curso,
                escuelas
            );
        });

        editarCurso.href =
            `curso-formulario.html?id=${encodeURIComponent(curso.id)}`;

        contenido.hidden = false;
    }

    function iniciar() {
        try {
            const sesion = JSON.parse(
                sessionStorage.getItem('usuarioActual') || 'null'
            );

            if (!sesion || !sesion.id) {
                window.location.replace('login.html');
                return;
            }

            // Comprueba los permisos mediante el módulo de datos.
            SGC.CursosDatos.leer();

            SGC.Idioma.rol(rolUsuario, sesion.rol);

            if (!idCurso) {
                throw new Error(
                    'No se indicó el curso que desea consultar.'
                );
            }

            const curso = SGC.CursosDatos.obtenerPorId(idCurso);

            if (!curso) {
                throw new Error(
                    'No se encontró el curso solicitado.'
                );
            }

            const escuelas = SGC.CursosDatos.leerEscuelas();

            mostrarDetalle(curso, escuelas);
            panel.hidden = false;

        } catch (error) {
            if (/sesión|permisos|iniciar sesión|inactivo/i.test(
                error.message
            )) {
                window.location.replace('login.html');
                return;
            }

            mostrarAviso(
                'No se pudo consultar el curso. ' + error.message
            );

            panel.hidden = false;
        }
    }

    iniciar();
})();
