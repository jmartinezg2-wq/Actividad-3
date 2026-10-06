/**
 * @file EmpleadoPorComision.js
 * @description Subclase para empleados que devengan salario base más comisión por ventas y bonos por metas.
 */

import { Empleado } from './Empleado.js';

export class EmpleadoPorComision extends Empleado {
  /**
   * @param {Object} datos
   * @param {string} [datos.id]
   * @param {string} datos.nombre
   * @param {number} [datos.aniosServicio=0]
   * @param {number} datos.salarioBase Salario base mensual
   * @param {number} datos.ventasMes Ventas totales logradas en el mes
   * @param {number} [datos.porcentajeComision=5] Porcentaje de comisión estándar (ej: 5%)
   */
  constructor(datos) {
    super({ ...datos, tipo: 'Por Comisión' });

    const salario = Number(datos.salarioBase);
    if (isNaN(salario) || salario < 0) {
      throw new Error('El salario base debe ser un número mayor o igual a 0.');
    }

    const ventas = Number(datos.ventasMes);
    if (isNaN(ventas) || ventas < 0) {
      throw new Error('Las ventas de un empleado por comisión no pueden ser menores a $0.');
    }

    const comision = Number(datos.porcentajeComision ?? 5);
    if (isNaN(comision) || comision < 0) {
      throw new Error('El porcentaje de comisión debe ser un número mayor o igual a 0.');
    }

    this.salarioBase = salario;
    this.ventasMes = ventas;
    this.porcentajeComision = comision;
  }

  /**
   * Salario bruto = Salario base + comisión sobre ventas.
   * @returns {number}
   */
  calcularSalarioBruto() {
    const comision = this.ventasMes * (this.porcentajeComision / 100);
    return Math.round(this.salarioBase + comision);
  }

  /**
   * Regla de negocio:
   * "Si las ventas superan $20.000.000, recibe un bono adicional del 3% sobre las ventas."
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerBonos() {
    const bonos = [];
    if (this.ventasMes > 20000000) {
      bonos.push({
        concepto: 'Bono Meta de Ventas (> $20.000.000, 3%)',
        valor: Math.round(this.ventasMes * 0.03)
      });
    }
    return bonos;
  }

  /**
   * Los empleados por comisión se consideran permanentes y reciben bono de alimentación.
   * @returns {boolean}
   */
  esPermanente() {
    return true;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      salarioBase: this.salarioBase,
      ventasMes: this.ventasMes,
      porcentajeComision: this.porcentajeComision
    };
  }
}
