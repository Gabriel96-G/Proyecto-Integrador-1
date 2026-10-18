# HU-18 · Registro de carreras · SGCS-76

Rama: `feature/hu-18-registro-carreras`. Esta carpeta contiene únicamente la pantalla de prueba de esta historia y sus recursos necesarios.

En el repositorio del equipo, abrí `http://127.0.0.1:8765/src/aylin/hu-18-registro-carreras/index.html` después de ejecutar `py -3 -m http.server 8765` desde la raíz. Usa el CSS común en `src/css/estilos.css`.

Los formularios guardan datos de prueba en `localStorage` (`sgc.aylin.sprint1.v1`). Los listados leen esa misma clave. Para probar un listado con datos, registrá primero datos en la rama de su HU de registro usando el mismo navegador, host y puerto. Para carreras hay tres escuelas ficticias que deberán sustituirse por el catálogo del equipo. Esta carpeta es un módulo demostrativo: su integración con la navegación, autenticación y persistencia compartida del proyecto sigue pendiente.
