window.SGC = window.SGC || {};
SGC.Datos = (() => {
    const claveAnterior = 'sgc.aylin.sprint1.v1';
    const claves = { usuarios: 'usuarios', carreras: 'carreras', sefia: 'areasSEFIA' };
    const normalizar = valor => String(valor ?? '').trim().normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '').toLocaleLowerCase('es');

    function consultar(clave) {
        const texto = localStorage.getItem(clave);
        return texto === null ? null : JSON.parse(texto);
    }

    function leer(tipo) {
        const clave = claves[tipo] || tipo;
        const actuales = consultar(clave);
        if (actuales !== null) {
            if (!Array.isArray(actuales) || actuales.some(dato => !dato || typeof dato.nombre !== 'string')) {
                throw new Error('El formato de los datos guardados no es válido. No se modificó la información.');
            }
            return actuales;
        }
        // Permite consultar los registros de las versiones anteriores de mis historias.
        if (claves[tipo]) {
            const anteriores = consultar(claveAnterior);
            if (anteriores !== null) {
                if (anteriores.version !== 1 || !Array.isArray(anteriores[tipo]) ||
                    anteriores[tipo].some(dato => !dato || typeof dato.nombre !== 'string')) {
                    throw new Error('No se pudieron leer los registros anteriores. Se conservaron sin cambios.');
                }
                return anteriores[tipo];
            }
        }
        return [];
    }

    function guardar(tipo, entrada) {
        const registros = leer(tipo);
        const indice = entrada.id ? registros.findIndex(r => r.id === entrada.id) : -1;
        if (entrada.id && indice < 0) throw new Error('El registro que intenta modificar ya no está disponible.');
        const otros = registros.filter((r, i) => i !== indice);
        if (tipo === 'usuarios') {
            if (otros.some(r => normalizar(r.identificacion) === normalizar(entrada.identificacion))) {
                throw new Error('Esta identificación ya pertenece a otro usuario.');
            }
            if (otros.some(r => normalizar(r.correo) === normalizar(entrada.correo))) {
                throw new Error('Este correo institucional ya está registrado.');
            }
        } else if (tipo === 'carreras') {
            if (otros.some(r => normalizar(r.codigo) === normalizar(entrada.codigo))) {
                throw new Error('Este código de carrera ya está registrado.');
            }
            if (!leer('escuelas').some(e => referenciaEscuela(e) === entrada.escuela)) {
                throw new Error('Seleccione una escuela disponible en el catálogo de escuelas.');
            }
        } else if (otros.some(r => normalizar(r.nombre) === normalizar(entrada.nombre))) {
            throw new Error('Este nombre ya está registrado en áreas S.E.F.I.A.');
        }
        const registro = {
            ...entrada,
            id: entrada.id || crypto.randomUUID(),
            actualizado: new Date().toISOString()
        };
        if (tipo === 'sefia' && indice < 0) registro.codigo = siguienteCodigo();
        if (indice < 0) registros.push(registro);
        else registros[indice] = registro;
        // setItem se ejecuta únicamente cuando todos los datos son válidos.
        localStorage.setItem(claves[tipo], JSON.stringify(registros));
        return registro;
    }

    function siguienteCodigo() {
        return leer('sefia').reduce((mayor, r) => Math.max(mayor, Number(r.codigo) || 0), 0) + 1;
    }

    function referenciaEscuela(escuela) {
        return String(escuela.id || escuela.codigo);
    }

    async function guardarSeguro(tipo, entrada) {
        if (navigator.locks) return navigator.locks.request('sgc-' + claves[tipo], () => guardar(tipo, entrada));
        return guardar(tipo, entrada);
    }

    return { leer, guardar: guardarSeguro, normalizar, siguienteCodigo, referenciaEscuela };
})();
