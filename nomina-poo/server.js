/**
 * @file server.js
 * @description Servidor Backend con Node.js y Express para el Sistema de Nómina POO.
 * Expone la API REST y sirve la interfaz web de usuario.
 */

import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

import { GestorEmpleados } from './src/services/GestorEmpleados.js';
import { CalculadoraNomina } from './src/services/CalculadoraNomina.js';
import { EmpleadoFactory } from './src/models/EmpleadoFactory.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT || 3000;

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// Servicios de Dominio
const calculadora = new CalculadoraNomina();
const gestor = new GestorEmpleados(calculadora);

// =========================================================================
// RUTAS API REST
// =========================================================================

/**
 * GET /api/nomina
 * Retorna el listado de empleados registrados y la nómina consolidada.
 */
app.get('/api/nomina', (req, res) => {
  try {
    const liquidacion = gestor.liquidarNomina();
    res.json({
      ok: true,
      data: liquidacion
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * POST /api/empleados
 * Agrega un nuevo empleado y retorna su desprendible liquidado.
 */
app.post('/api/empleados', (req, res) => {
  try {
    const empleado = gestor.agregarEmpleado(req.body);
    const desprendible = calculadora.liquidarEmpleado(empleado);
    const consolidado = gestor.liquidarNomina();

    res.status(201).json({
      ok: true,
      mensaje: 'Empleado agregado exitosamente',
      desprendible,
      consolidado
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * POST /api/simular
 * Liquida un empleado temporalmente para simulación sin almacenarlo en memoria.
 */
app.post('/api/simular', (req, res) => {
  try {
    const empleado = EmpleadoFactory.crearEmpleado(req.body);
    const desprendible = calculadora.liquidarEmpleado(empleado);

    res.json({
      ok: true,
      desprendible
    });
  } catch (error) {
    res.status(400).json({
      ok: false,
      error: error.message
    });
  }
});

/**
 * POST /api/ejemplos
 * Carga empleados de ejemplo con todos los casos de negocio de la actividad.
 */
app.post('/api/ejemplos', (req, res) => {
  try {
    const liquidacion = gestor.cargarEjemplos();
    res.json({
      ok: true,
      mensaje: 'Ejemplos cargados correctamente',
      data: liquidacion
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

/**
 * DELETE /api/empleados
 * Vacia la lista de empleados.
 */
app.delete('/api/empleados', (req, res) => {
  try {
    gestor.vaciar();
    res.json({
      ok: true,
      mensaje: 'Lista de empleados vaciada correctamente',
      data: gestor.liquidarNomina()
    });
  } catch (error) {
    res.status(500).json({ ok: false, error: error.message });
  }
});

// Inicialización del servidor
app.listen(PORT, () => {
  console.log(`====================================================`);
  console.log(`🚀 Sistema de Nómina POO iniciado`);
  console.log(`📍 Servidor en: http://localhost:${PORT}`);
  console.log(`📑 API REST:    http://localhost:${PORT}/api/nomina`);
  console.log(`====================================================`);
});
