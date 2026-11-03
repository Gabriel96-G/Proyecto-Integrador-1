// Ejecutar con Playwright disponible: node tests/confirmaciones-catalogos.cjs
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const { chromium } = require('playwright');
const root = path.resolve(__dirname, '../src');
const catalogos = [
  ['casas-certificadoras', 'casasCertificadoras', 'codigo'],
  ['carreras', 'carreras', 'id'],
  ['escuelas', 'escuelas', 'codigo'],
  ['areas-sefia', 'areasSEFIA', 'id'],
  ['metodologias', 'metodologiasAprendizaje', 'codigo'],
];

async function main() {
  const server = http.createServer((req, res) => {
    const file = path.resolve(root, '.' + new URL(req.url, 'http://localhost').pathname);
    if (!file.startsWith(root + path.sep)) return res.writeHead(403).end();
    fs.readFile(file, (error, data) => {
      if (error) return res.writeHead(404).end();
      res.setHeader('Content-Type', ({ '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css' }[path.extname(file)] || 'application/octet-stream') + '; charset=utf-8');
      res.end(data);
    });
  });
  await new Promise(resolve => server.listen(0, '127.0.0.1', resolve));
  let browser;
  let casos = 0;
  try {
    browser = await chromium.launch({ headless: true, ...(process.env.SGC_BROWSER ? { executablePath: process.env.SGC_BROWSER } : {}) });
    const base = `http://127.0.0.1:${server.address().port}/pages/`;
    for (const width of [1280, 390]) for (const idioma of ['es', 'en']) {
      let referencia;
      for (const editar of [false, true]) for (const [pagina, clave, parametro] of catalogos) {
        const context = await browser.newContext({ viewport: { width, height: 900 } });
        await context.addInitScript(({ idioma, claves }) => {
          const user = { id: 'admin', nombre: 'Administradora', correo: 'prueba@example.test', rol: 'administrador', estado: 'activo' };
          localStorage.setItem('usuarios', JSON.stringify([user]));
          sessionStorage.setItem('usuarioActual', JSON.stringify(user));
          sessionStorage.setItem('sgcIdioma', idioma);
          for (const clave of claves) localStorage.setItem(clave, JSON.stringify([
            { id: 'registro', codigo: '1', nombre: 'Registro existente', descripcion: 'Descripción', escuela: 'registro', directorAsociado: 'Directora' }
          ]));
        }, { idioma, claves: catalogos.map(c => c[1]) });
        const page = await context.newPage();
        const errores = [];
        page.on('pageerror', error => errores.push(error.message));
        await page.goto(base + pagina + '-formulario.html' + (editar ? `?${parametro}=${parametro === 'id' ? 'registro' : '1'}` : ''));
        if (pagina === 'metodologias') assert.equal(await page.locator('button[type="reset"]').count(), 0);
        const submit = page.locator('main button[type="submit"]');
        // Un formulario inválido no debe mostrar éxito ni guardar datos.
        await page.locator('#nombre').fill('');
        await submit.click();
        assert.equal(await page.locator('dialog[open]').count(), 0);
        assert.equal(await page.evaluate(key => JSON.parse(localStorage.getItem(key)).length, clave), 1);
        if (pagina !== 'areas-sefia') await page.locator('#codigo').fill(editar ? '1' : '2');
        await page.locator('#nombre').fill(editar ? 'Registro actualizado' : 'Registro nuevo');
        if (await page.locator('#descripcion').count()) await page.locator('#descripcion').fill('Descripción de prueba');
        if (pagina === 'carreras') await page.locator('#escuela').selectOption('registro');
        if (pagina === 'escuelas') await page.locator('#director-asociado').selectOption('Director de prueba');
        await submit.click();
        const dialog = page.locator('dialog[open]');
        await dialog.waitFor();
        await page.mouse.move(0, 0);
        assert.equal(await dialog.count(), 1);
        assert.equal(await dialog.locator('h2').innerText(), idioma === 'es' ? '¡Guardado con éxito!' : 'Saved successfully!');
        assert.match(await dialog.locator('p').innerText(), idioma === 'es' ? (editar ? /modificó con éxito/ : /guardó con éxito/) : (editar ? /updated successfully/ : /saved successfully/));
        const estilos = await dialog.evaluate(el => [el, el.querySelector('h2'), el.querySelector('p'), el.querySelector('span'), el.querySelector('button')].map(n => {
          const s = getComputedStyle(n);
          return Object.fromEntries(['width', 'padding', 'borderRadius', 'color', 'backgroundColor', 'fontSize', 'fontWeight', 'fontFamily', 'textAlign', 'display'].map(k => [k, s[k]]));
        }));
        if (!referencia) referencia = estilos;
        else assert.deepEqual(estilos, referencia, `${pagina}: estilos iguales a casas certificadoras`);
        const registros = await page.evaluate(key => JSON.parse(localStorage.getItem(key)), clave);
        assert.equal(registros.length, editar ? 1 : 2);
        assert.ok(registros.some(r => r.nombre === (editar ? 'Registro actualizado' : 'Registro nuevo')));
        await dialog.locator('button').click();
        await page.waitForURL(base + pagina + '-listado.html');
        assert.deepEqual(errores, []);
        await context.close();
        casos++;
      }
    }
    console.log(`${casos} casos aprobados: registro y edición, escritorio y móvil, español e inglés; validación, persistencia, estilo y navegación.`);
  } finally {
    if (browser) await browser.close();
    await new Promise(resolve => server.close(resolve));
  }
}
main().catch(error => { console.error(error); process.exitCode = 1; });
