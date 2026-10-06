/**
 * @file EmpleadoFactory.js
 * @description Patrón de Diseño Factory Method para crear instancias de empleados
 * a partir de datos recibidos del formulario o API REST. Cumple con OCP y SRP.
 */

import { EmpleadoAsalariado } from './EmpleadoAsalariado.js';
import { EmpleadoPorHoras } from './EmpleadoPorHoras.js';
import { EmpleadoPorComision } from './EmpleadoPorComision.js';
import { EmpleadoTemporal } from './EmpleadoTemporal.js';

export class EmpleadoFactory {
  /**
   * Crea la instancia de la subclase correspondiente.
   * @param {Object} datos
   * @param {string} datos.tipo 'Asalariado' | 'Por Horas' | 'Por Comisión' | 'Temporal'
   * @returns {import('./Empleado.js').Empleado}
   */
  static crearEmpleado(datos) {
    if (!datos || !datos.tipo) {
      throw new Error('El tipo de empleado es obligatorio para crear el registro.');
    }

    const tipoNormalizado = datos.tipo.trim().toLowerCase();

    switch (tipoNormalizado) {
      case 'asalariado':
        return new EmpleadoAsalariado({
          id: datos.id,
          nombre: datos.nombre,
          aniosServicio: datos.aniosServicio,
          salarioBase: datos.salarioBase ?? datos.salario
        });

      case 'por horas':
      case 'horas':
        return new EmpleadoPorHoras({
          id: datos.id,
          nombre: datos.nombre,
          aniosServicio: datos.aniosServicio,
          horasTrabajadas: datos.horasTrabajadas ?? datos.horas,
          tarifaHora: datos.tarifaHora ?? datos.tarifa,
          aceptaFondoAhorro: datos.aceptaFondoAhorro
        });

      case 'por comisión':
      case 'comision':
      case 'comisión':
        return new EmpleadoPorComision({
          id: datos.id,
          nombre: datos.nombre,
          aniosServicio: datos.aniosServicio,
          salarioBase: datos.salarioBase ?? datos.salario,
          ventasMes: datos.ventasMes ?? datos.ventas,
          porcentajeComision: datos.porcentajeComision
        });

      case 'temporal':
        return new EmpleadoTemporal({
          id: datos.id,
          nombre: datos.nombre,
          aniosServicio: datos.aniosServicio,
          salarioBase: datos.salarioBase ?? datos.salario,
          duracionMeses: datos.duracionMeses
        });

      default:
        throw new Error(`Tipo de empleado desconocido: "${datos.tipo}". Tipos válidos: Asalariado, Por Horas, Por Comisión, Temporal.`);
    }
  }
}
