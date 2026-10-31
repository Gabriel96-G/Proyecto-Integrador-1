# Sistema de Gestión Curricular — CENFOTEC

Proyecto académico del curso Proyecto Integrador 1 de la Universidad CENFOTEC.

El sistema permite administrar usuarios, catálogos institucionales y la información de los cursos.

## Integrantes

- Alejandro Gabriel Medrano Ruiz
- Aylin Salazar Delgado
- Daniel García Monge

## Tecnologías

- HTML
- CSS
- JavaScript nativo
- localStorage para guardar los datos del prototipo
- sessionStorage para mantener la sesión del usuario

## Organización del proyecto

src/
├── index.html
├── pages/     Páginas del sistema
├── css/       Estilos compartidos y del módulo de cursos
├── js/        Validaciones, almacenamiento e interacción
└── img/       Logotipo e iconos

El documento de diseño se encuentra en la raíz del repositorio.

## Ejecución

1. Descargar o clonar el repositorio.
2. Abrir src/index.html en el navegador.
3. Seleccionar “Ingresar al sistema”.
4. Iniciar sesión con una cuenta de administrador registrada
   en el navegador utilizado para las pruebas.

Para trabajar con un servidor local, mantener la misma dirección
y puerto durante las pruebas.

## Módulos

- Usuarios: registro, consulta, búsqueda, edición y asignación de roles.
- Catálogos: información institucional utilizada en los cursos,
  como escuelas, carreras, áreas SEFIA y temáticas.
- Cursos: registro progresivo, listado y consulta de información.

## Almacenamiento de datos

Esta versión funciona como un prototipo con almacenamiento local.
No utiliza una base de datos ni un servidor de autenticación.

Los datos se guardan en el navegador utilizado. Al cambiar de navegador,
dirección o puerto, pueden no estar disponibles los mismos registros.
No se incluye una cuenta predeterminada en el código.

## Interfaz

Las páginas comparten colores, tipografía, navegación y estilos generales.
La distribución de la información se adapta a cada módulo y a los datos
que se necesitan consultar o registrar.

El selector de la cabecera permite cambiar entre español e inglés.
La selección se mantiene al navegar en la misma pestaña.
Los textos se organizan en `src/js/traducciones.js`.
