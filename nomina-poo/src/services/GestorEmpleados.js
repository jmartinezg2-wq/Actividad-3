/**
 * @file GestorEmpleados.js
 * @description Repositorio y orquestador del estado de empleados y nómina en memoria.
 */

import { EmpleadoFactory } from '../models/EmpleadoFactory.js';
import { CalculadoraNomina } from './CalculadoraNomina.js';

export class GestorEmpleados {
  /**
   * @param {CalculadoraNomina} [calculadora]
   */
  constructor(calculadora = new CalculadoraNomina()) {
    this.calculadora = calculadora;
    /** @type {Map<string, import('../models/Empleado.js').Empleado>} */
    this.empleados = new Map();
  }

  /**
   * Registra un nuevo empleado validando sus reglas de negocio.
   * @param {Object} datosEmpleado
   * @returns {import('../models/Empleado.js').Empleado}
   */
  agregarEmpleado(datosEmpleado) {
    const empleado = EmpleadoFactory.crearEmpleado(datosEmpleado);
    this.empleados.set(empleado.id, empleado);
    return empleado;
  }

  /**
   * Obtiene todos los empleados registrados.
   * @returns {import('../models/Empleado.js').Empleado[]}
   */
  obtenerTodos() {
    return Array.from(this.empleados.values());
  }

  /**
   * Liquida la nómina actual de todos los empleados registrados.
   */
  liquidarNomina() {
    const lista = this.obtenerTodos();
    return this.calculadora.liquidarTodos(lista);
  }

  /**
   * Limpia todos los empleados registrados.
   */
  vaciar() {
    this.empleados.clear();
  }

  /**
   * Carga empleados de ejemplo para pruebas rápidas y demostración del sistema.
   * Cubre todos los tipos y casos de negocio de la actividad.
   */
  cargarEjemplos() {
    this.vaciar();
    const ejemplos = [
      // 1. Asalariado con más de 5 años (Recibe bono 10% y alimentación)
      {
        tipo: 'Asalariado',
        nombre: 'Carlos Gómez (Senior)',
        aniosServicio: 6,
        salarioBase: 3500000
      },
      // 2. Asalariado nuevo (Sin bono 10%, con alimentación)
      {
        tipo: 'Asalariado',
        nombre: 'Laura Morales (Junior)',
        aniosServicio: 2,
        salarioBase: 2000000
      },
      // 3. Empleado por horas con horas extras (>40) y fondo de ahorro (>1 año y acepta)
      {
        tipo: 'Por Horas',
        nombre: 'Andrés Castro (Con Horas Extras y Fondo)',
        aniosServicio: 3,
        horasTrabajadas: 48,
        tarifaHora: 25000,
        aceptaFondoAhorro: true
      },
      // 4. Empleado por comisión que supera meta de 20M (> $20.000.000, recibe bono 3% y alimentación)
      {
        tipo: 'Por Comisión',
        nombre: 'Mariana Ríos (Top Ventas)',
        aniosServicio: 4,
        salarioBase: 1500000,
        ventasMes: 25000000,
        porcentajeComision: 5
      },
      // 5. Empleado temporal (sin bonos ni beneficios)
      {
        tipo: 'Temporal',
        nombre: 'Diego Ramírez (Reemplazo Temporal)',
        aniosServicio: 0.5,
        salarioBase: 1800000,
        duracionMeses: 3
      }
    ];

    ejemplos.forEach(d => this.agregarEmpleado(d));
    return this.liquidarNomina();
  }
}
