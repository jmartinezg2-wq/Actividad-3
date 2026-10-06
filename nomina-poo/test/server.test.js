import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { crearServidor } from '../server.js';

const TASA_ARL_PRUEBA = 0.01;

async function conServidor(ejecutar) {
  const servidor = crearServidor({ tasaARL: TASA_ARL_PRUEBA });
  await new Promise((resolve, reject) => {
    servidor.once('error', reject);
    servidor.listen(0, '127.0.0.1', resolve);
  });
  const { port } = servidor.address();

  try {
    await ejecutar(`http://127.0.0.1:${port}`);
  } finally {
    servidor.closeAllConnections?.();
    await new Promise((resolve, reject) => {
      servidor.close((error) => error ? reject(error) : resolve());
    });
  }
}

async function solicitarJson(baseUrl, ruta, opciones) {
  const respuesta = await fetch(`${baseUrl}${ruta}`, opciones);
  return { respuesta, cuerpo: await respuesta.json() };
}

describe('API HTTP', () => {
  it('exige la configuración ARL al componer el servidor', () => {
    assert.throws(() => crearServidor(), /tasa ARL.*obligatorio/i);
  });

  it('entrega una nómina vacía al iniciar', async () => {
    await conServidor(async (baseUrl) => {
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/nomina');
      assert.equal(respuesta.status, 200);
      assert.equal(cuerpo.ok, true);
      assert.equal(cuerpo.data.totalEmpleados, 0);
      assert.deepEqual(cuerpo.data.desprendibles, []);
    });
  });

  it('crea un empleado válido y acepta cadenas numéricas del formulario', async () => {
    await conServidor(async (baseUrl) => {
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'Asalariado', nombre: 'Ana', salarioBase: '2000000'
        })
      });
      assert.equal(respuesta.status, 201);
      assert.equal(cuerpo.desprendible.empleado.aniosServicio, 0);
      assert.equal(cuerpo.desprendible.salarioBruto, 2000000);
      assert.equal(cuerpo.consolidado.totalEmpleados, 1);
    });
  });

  it('rechaza valores negativos y campos numéricos en blanco', async () => {
    await conServidor(async (baseUrl) => {
      const negativo = await solicitarJson(baseUrl, '/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tipo: 'Por Horas', nombre: 'Luis', horasTrabajadas: -1, tarifaHora: 20000
        })
      });
      assert.equal(negativo.respuesta.status, 400);
      assert.match(negativo.cuerpo.error, /horas/i);

      const blanco = await solicitarJson(baseUrl, '/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'Asalariado', nombre: 'Ana', salarioBase: '   ' })
      });
      assert.equal(blanco.respuesta.status, 400);
      assert.match(blanco.cuerpo.error, /obligatorio/i);
    });
  });

  it('responde 400 ante JSON malformado', async () => {
    await conServidor(async (baseUrl) => {
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: '{"tipo":'
      });
      assert.equal(respuesta.status, 400);
      assert.match(cuerpo.error, /JSON válido/);
    });
  });

  it('responde 404 para una ruta de API desconocida', async () => {
    await conServidor(async (baseUrl) => {
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/desconocida');
      assert.equal(respuesta.status, 404);
      assert.equal(cuerpo.ok, false);
    });
  });

  it('vacía los empleados registrados', async () => {
    await conServidor(async (baseUrl) => {
      await solicitarJson(baseUrl, '/api/empleados', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tipo: 'Temporal', nombre: 'Sara', salarioBase: 1800000 })
      });
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/empleados', {
        method: 'DELETE'
      });
      assert.equal(respuesta.status, 200);
      assert.equal(cuerpo.data.totalEmpleados, 0);
    });
  });

  it('carga los datos demostrativos', async () => {
    await conServidor(async (baseUrl) => {
      const { respuesta, cuerpo } = await solicitarJson(baseUrl, '/api/ejemplos', {
        method: 'POST'
      });
      assert.equal(respuesta.status, 200);
      assert.equal(cuerpo.data.totalEmpleados, 5);
      assert.equal(new Set(cuerpo.data.desprendibles.map(
        (item) => item.empleado.tipo
      )).size, 4);
    });
  });
});

describe('Archivos estáticos', () => {
  it('sirve el índice de la aplicación', async () => {
    await conServidor(async (baseUrl) => {
      const respuesta = await fetch(`${baseUrl}/`);
      const contenido = await respuesta.text();
      assert.equal(respuesta.status, 200);
      assert.match(respuesta.headers.get('content-type'), /^text\/html/);
      assert.match(contenido, /<title>Sistema de nómina<\/title>/);
    });
  });
});
