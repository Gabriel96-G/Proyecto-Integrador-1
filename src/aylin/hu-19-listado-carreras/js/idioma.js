window.SGC = window.SGC || {};
SGC.Idioma = (() => {
  const textos = {
      sistema:'Gestión curricular', administrador:'Administrador', idioma:'Idioma', inicio:'Inicio', usuarios:'Usuarios', catalogos:'Catálogos', menu:'Menú', saltar:'Saltar al contenido',
      tituloInicio:'Su espacio de trabajo', rutaInicio:'Inicio / Panel principal', bienvenida:'Gestione la información curricular', bienvenidaDetalle:'Registre y mantenga organizada la información de su equipo y sus catálogos.',
      usuariosDetalle:'Registro y consulta de cuentas.', abrirUsuarios:'Abrir usuarios', carreras:'Carreras', sefia:'Áreas SEFIA', tematicas:'Temáticas', catalogosDetalle:'Clasificación institucional y diseño académico.', abrirCatalogos:'Abrir catálogos',
      tituloUsuarios:'Directorio de usuarios', rutaUsuarios:'Usuarios / Listado', registrarUsuario:'Registrar usuario', rutaNuevoUsuario:'Usuarios / Nuevo registro',
      nombreCorreo:'Nombre y correo', identificacion:'Identificación', rol:'Rol', estado:'Estado', accion:'Acción', editar:'Editar', ver:'Ver', todos:'Todos', todas:'Todas', sinUsuarios:'Todavía no hay usuarios registrados.', sinResultados:'No se encontraron coincidencias.', resultados:'{cantidad} registro(s)',
      personales:'01 Personales', contacto:'02 Contacto', acceso:'03 Acceso', nombre:'Nombre', primerApellido:'Primer apellido', segundoApellido:'Segundo apellido', nacimiento:'Fecha de nacimiento', sexo:'Sexo', edad:'Edad calculada', pendienteEdad:'Desde el nacimiento', anios:'{edad} años',
      correo:'Correo institucional', correoPersonal:'Correo personal', telefono:'Teléfono celular', telefonoAyuda:'Entre 8 y 15 dígitos. Puede incluir espacios, +, guiones y paréntesis.', clave:'Contraseña', claveAyuda:'De 8 a 15 caracteres; al menos una mayúscula, una minúscula y un número.', claveEditarAyuda:'Deje este campo vacío para conservar la contraseña actual.',
      activo:'Activo', inactivo:'Inactivo', desarrollo:'Desarrollo Curricular', director:'Director de escuela', rectoria:'Rectoría', vicerrectoria:'Vicerrectoría', seleccionar:'Seleccione una opción', femenino:'Femenino', masculino:'Masculino', otro:'Otro', 'no-indica':'Prefiero no indicarlo',
      imagenOpcional:'Imagen opcional', elegirImagen:'Elegir imagen', imagenAyuda:'Archivo de imagen de hasta 2 MB. La imagen se ajustará al perfil.', guardarUsuario:'Guardar usuario', guardarCambios:'Guardar cambios', cancelar:'Cancelar', obligatorio:'* Campo obligatorio', rolAyuda:'Cada cuenta tendrá un único rol predefinido. El acceso de este prototipo se mantiene como administrador.',
      tituloCatalogos:'Catálogos institucionales', rutaCatalogos:'Catálogos / Seleccione una clasificación', estructura:'Estructura y seguimiento', diseno:'Diseño académico', carreraDetalle:'Código, nombre y escuela asociada.', sefiaDetalle:'Clasifique las áreas de formación.', tematicasDetalle:'Organice las temáticas de los cursos.',
      registrarCarrera:'Registrar carrera', registrarSefia:'Registrar área SEFIA', registrarTematica:'Registrar temática', editarCarrera:'Modificar carrera', editarSefia:'Modificar área SEFIA', editarTematica:'Modificar temática',
      codigo:'Código', escuela:'Escuela asociada', descripcion:'Descripción', descripcionOpcional:'Descripción opcional', nombreCodigo:'Código, nombre o descripción…', buscarCarrera:'Código o nombre…', filtros:'Filtrar registros', filtrarCodigo:'Código contiene', filtrarNombre:'Nombre contiene', filtrarDescripcion:'Descripción contiene', limpiarFiltros:'Limpiar filtros',
      registrar:'Registrar', guardarRegistro:'Guardar registro', volverCatalogos:'Volver a catálogos', sinCatalogos:'Todavía no hay registros en este catálogo.', codigoAutomatico:'El código se genera al guardar y no se modifica.', sinEscuelas:'No hay escuelas disponibles. Integre el catálogo de escuelas antes de registrar una carrera.',
      usuarioGuardado:'El usuario se guardó correctamente.', registroGuardado:'El registro se guardó correctamente.', guardando:'Guardando…', revisarErrores:'Revise los campos marcados. No se guardaron cambios.',
      nombreObligatorio:'Ingrese el nombre.', apellidoObligatorio:'Ingrese el primer apellido.', identificacionObligatoria:'Ingrese la identificación.', identificacionDuplicada:'Esta identificación ya pertenece a otro usuario.', correoInvalido:'Ingrese un correo institucional válido.', correoDuplicado:'Este correo institucional ya está registrado.', correoPersonalInvalido:'Ingrese un correo personal válido.', telefonoInvalido:'Ingrese un teléfono con entre 8 y 15 dígitos.', fechaInvalida:'Seleccione una fecha de nacimiento válida que no sea futura.', seleccionInvalida:'Seleccione una opción válida.', rolInvalido:'Seleccione un único rol de la lista.', claveInvalida:'La contraseña debe tener de 8 a 15 caracteres e incluir mayúscula, minúscula y número.',
      codigoObligatorio:'Ingrese el código.', codigoDuplicado:'Este código ya está registrado.', nombreDuplicado:'Este nombre ya está registrado en el catálogo.', escuelaInvalida:'Seleccione una escuela disponible.', imagenInvalida:'Seleccione un archivo de imagen válido.', imagenGrande:'La imagen debe pesar como máximo 2 MB.', imagenCargando:'Espere a que se termine de cargar la imagen.',
      almacenamiento:'No se pudo guardar o consultar la información local. Revise el espacio disponible y los permisos del navegador.', datosInvalidos:'Los datos locales no tienen el formato esperado. Se conservaron sin modificarlos.', conflicto:'Este registro cambió en otra pestaña. Recargue para revisar la última versión antes de editar.', registroNoExiste:'El registro solicitado ya no está disponible.', catalogoInvalido:'El catálogo solicitado no está disponible.', credencialNoDisponible:'Abra el proyecto desde el servidor local para preparar la contraseña.', errorGeneral:'No se pudo completar la operación. Sus entradas permanecen en el formulario.',
      sinDescripcion:'Sin descripción', listado:'Consulta y edición', nuevoRegistro:'Nuevo registro', modificacion:'Modificación', vistaListado:'Listado con desplazamiento horizontal', apellidoCompleto:'Datos personales', limpiarBusqueda:'Limpiar búsqueda', avisoEscuelas:'Escuelas disponibles para asociar carreras.',
  };
  function t(clave, valores = {}) {
    return (textos[clave] || clave).replace(/\{(\w+)\}/g, (_, nombre) => valores[nombre] ?? '');
  }
  function aplicar() {
    document.documentElement.lang = 'es';
    document.querySelectorAll('[data-i18n]').forEach(nodo => { nodo.textContent = t(nodo.dataset.i18n); });
    document.querySelectorAll('[data-i18n-placeholder]').forEach(nodo => { nodo.placeholder = t(nodo.dataset.i18nPlaceholder); });
    document.querySelectorAll('[data-i18n-label]').forEach(nodo => { nodo.setAttribute('aria-label', t(nodo.dataset.i18nLabel)); });
    if (document.body.dataset.titulo) document.title = t(document.body.dataset.titulo) + ' | SGC';
  }
  aplicar();
  return { t, aplicar };
})();
