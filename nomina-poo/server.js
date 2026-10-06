import { createServer } from 'node:http';
import { readFile, stat } from 'node:fs/promises';
import { extname, join, normalize, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

import { GestorEmpleados } from './src/services/GestorEmpleados.js';
import { CalculadoraNomina } from './src/services/CalculadoraNomina.js';
import { EmpleadoFactory } from './src/models/EmpleadoFactory.js';

const ROOT = fileURLToPath(new URL('.', import.meta.url));
const tiposContenido = new Map([
  ['.html', 'text/html; charset=utf-8'],
  ['.css', 'text/css; charset=utf-8'],
  ['.js', 'text/javascript; charset=utf-8'],
  ['.json', 'application/json; charset=utf-8']
]);

function responderJson(respuesta, estado, contenido) {
  respuesta.writeHead(estado, { 'Content-Type': 'application/json; charset=utf-8' });
  respuesta.end(JSON.stringify(contenido));
}

async function leerJson(solicitud) {
  const partes = [];
  let bytes = 0;
  for await (const parte of solicitud) {
    bytes += parte.length;
    if (bytes > 100000) throw new Error('La solicitud supera el tamaño permitido.');
    partes.push(parte);
  }
  try {
    return JSON.parse(Buffer.concat(partes).toString('utf8') || '{}');
  } catch {
    throw new Error('El cuerpo de la solicitud debe ser JSON válido.');
  }
}

function manejarApi(solicitud, respuesta, ruta, gestor) {
  if (solicitud.method === 'GET' && ruta === '/api/nomina') {
    responderJson(respuesta, 200, { ok: true, data: gestor.liquidarNomina() });
    return true;
  }
  if (solicitud.method === 'DELETE' && ruta === '/api/empleados') {
    gestor.vaciar();
    responderJson(respuesta, 200, { ok: true, data: gestor.liquidarNomina() });
    return true;
  }
  if (solicitud.method === 'POST' && ruta === '/api/ejemplos') {
    responderJson(respuesta, 200, { ok: true, data: gestor.cargarEjemplos() });
    return true;
  }
  return false;
}

async function manejarApiConCuerpo(
  solicitud,
  respuesta,
  ruta,
  { gestor, calculadora, creadorEmpleado }
) {
  if (ruta !== '/api/empleados' && ruta !== '/api/simular') {
    return false;
  }
  const datos = await leerJson(solicitud);
  if (ruta === '/api/empleados') {
    const empleado = gestor.agregarEmpleado(datos);
    responderJson(respuesta, 201, {
      ok: true,
      desprendible: calculadora.liquidarEmpleado(empleado),
      consolidado: gestor.liquidarNomina()
    });
    return true;
  }
  if (ruta === '/api/simular') {
    const empleado = creadorEmpleado(datos);
    responderJson(respuesta, 200, { ok: true, desprendible: calculadora.liquidarEmpleado(empleado) });
    return true;
  }
  return false;
}

async function servirArchivo(respuesta, ruta) {
  const solicitada = ruta === '/' ? 'index.html' : decodeURIComponent(ruta.slice(1));
  const relativa = normalize(solicitada).replace(/^(\.\.[/\\])+/, '');
  const archivo = join(ROOT, relativa);

  if (!archivo.startsWith(ROOT)) {
    responderJson(respuesta, 403, { ok: false, error: 'Ruta no permitida.' });
    return;
  }

  try {
    const datosArchivo = await readFile(archivo);
    const informacion = await stat(archivo);
    if (!informacion.isFile()) throw new Error('No es un archivo');
    respuesta.writeHead(200, { 'Content-Type': tiposContenido.get(extname(archivo)) || 'application/octet-stream' });
    respuesta.end(datosArchivo);
  } catch {
    responderJson(respuesta, 404, { ok: false, error: 'Recurso no encontrado.' });
  }
}

export function crearServidor({ tasaARL, tasaSeguridadSocialPension } = {}) {
  const calculadora = new CalculadoraNomina({ tasaARL, tasaSeguridadSocialPension });
  const creadorEmpleado = (datos) => EmpleadoFactory.crearEmpleado(datos);
  const gestor = new GestorEmpleados({ calculadora, creadorEmpleado });

  return createServer(async (solicitud, respuesta) => {
    try {
      const ruta = new URL(
        solicitud.url,
        `http://${solicitud.headers.host || 'localhost'}`
      ).pathname;
      if (ruta.startsWith('/api/')) {
        if (manejarApi(solicitud, respuesta, ruta, gestor)) return;
        if (solicitud.method === 'POST' && await manejarApiConCuerpo(
          solicitud,
          respuesta,
          ruta,
          { gestor, calculadora, creadorEmpleado }
        )) return;
        responderJson(respuesta, 404, { ok: false, error: 'Ruta de API no encontrada.' });
        return;
      }
      if (solicitud.method !== 'GET') {
        responderJson(respuesta, 405, { ok: false, error: 'Método no permitido.' });
        return;
      }
      await servirArchivo(respuesta, ruta);
    } catch (error) {
      responderJson(respuesta, 400, { ok: false, error: error.message });
    }
  });
}

const esEjecucionDirecta = process.argv[1]
  && resolve(process.argv[1]) === fileURLToPath(import.meta.url);

if (esEjecucionDirecta) {
  try {
    const puerto = Number(process.env.PORT ?? 3000);
    if (!Number.isInteger(puerto) || puerto < 1 || puerto > 65535) {
      throw new Error('PORT debe ser un entero entre 1 y 65535.');
    }
    const servidor = crearServidor({ tasaARL: process.env.TASA_ARL });
    servidor.listen(puerto, () => {
      console.log(`Sistema de nómina disponible en http://localhost:${puerto}`);
    });
  } catch (error) {
    console.error(`No se pudo iniciar el servidor: ${error.message}`);
    process.exitCode = 1;
  }
}
