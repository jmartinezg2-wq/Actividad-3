/**
 * @file EmpleadoTemporal.js
 * @description Subclase para empleados temporales con contrato a término fijo sin bonos ni beneficios.
 */

import { Empleado } from './Empleado.js';

export class EmpleadoTemporal extends Empleado {
  /**
   * @param {Object} datos
   * @param {string} [datos.id]
   * @param {string} datos.nombre
   * @param {number} [datos.aniosServicio=0]
   * @param {number} datos.salarioBase Salario fijo pactado
   * @param {number} [datos.duracionMeses=6] Duración del contrato en meses
   */
  constructor(datos) {
    super({ ...datos, tipo: 'Temporal' });

    const salario = Number(datos.salarioBase);
    if (isNaN(salario) || salario < 0) {
      throw new Error('El salario del empleado temporal debe ser un número mayor o igual a 0.');
    }

    const meses = Number(datos.duracionMeses ?? 6);
    if (isNaN(meses) || meses <= 0) {
      throw new Error('La duración del contrato temporal debe ser mayor a 0 meses.');
    }

    this.salarioBase = salario;
    this.duracionMeses = meses;
  }

  /**
   * Salario bruto corresponde al salario pactado.
   * @returns {number}
   */
  calcularSalarioBruto() {
    return this.salarioBase;
  }

  /**
   * Regla de negocio: No aplican bonos.
   * @returns {Array}
   */
  obtenerBonos() {
    return [];
  }

  /**
   * Regla de negocio: No aplican beneficios adicionales (no es permanente).
   * @returns {boolean}
   */
  esPermanente() {
    return false;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      salarioBase: this.salarioBase,
      duracionMeses: this.duracionMeses
    };
  }
}
