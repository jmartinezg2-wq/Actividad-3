/**
 * @file EmpleadoAsalariado.js
 * @description Subclase para empleados asalariados con salario fijo y bono por antigüedad (> 5 años).
 * Cumple con OCP y LSP.
 */

import { Empleado } from './Empleado.js';

export class EmpleadoAsalariado extends Empleado {
  /**
   * @param {Object} datos
   * @param {string} [datos.id]
   * @param {string} datos.nombre
   * @param {number} [datos.aniosServicio=0]
   * @param {number} datos.salarioBase Salario fijo mensual
   */
  constructor(datos) {
    super({ ...datos, tipo: 'Asalariado' });

    const salario = Number(datos.salarioBase);
    if (isNaN(salario) || salario < 0) {
      throw new Error('El salario fijo mensual debe ser un número mayor o igual a 0.');
    }

    this.salarioBase = salario;
  }

  /**
   * En empleado asalariado, el salario bruto básico es su salario fijo mensual.
   * @returns {number}
   */
  calcularSalarioBruto() {
    return this.salarioBase;
  }

  /**
   * Beneficio de antigüedad:
   * Bono Mensual del 10% del salario si lleva más de 5 años en la empresa.
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerBonos() {
    const bonos = [];
    if (this.aniosServicio > 5) {
      bonos.push({
        concepto: 'Bono Antigüedad (>5 años, 10%)',
        valor: Math.round(this.salarioBase * 0.10)
      });
    }
    return bonos;
  }

  /**
   * Los empleados asalariados son considerados empleados permanentes.
   * @returns {boolean}
   */
  esPermanente() {
    return true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      salarioBase: this.salarioBase
    };
  }
}
