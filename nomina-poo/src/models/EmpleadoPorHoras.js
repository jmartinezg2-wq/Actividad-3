/**
 * @file EmpleadoPorHoras.js
 * @description Subclase para empleados que liquidan por horas trabajadas, horas extras y fondo de ahorro.
 */

import { Empleado } from './Empleado.js';

export class EmpleadoPorHoras extends Empleado {
  /**
   * @param {Object} datos
   * @param {string} [datos.id]
   * @param {string} datos.nombre
   * @param {number} [datos.aniosServicio=0]
   * @param {number} datos.horasTrabajadas Horas totales trabajadas en el mes
   * @param {number} datos.tarifaHora Valor de la tarifa normal por hora
   * @param {boolean} [datos.aceptaFondoAhorro=false] Indica si se suscribe al fondo de ahorro (>1 año)
   */
  constructor(datos) {
    super({ ...datos, tipo: 'Por Horas' });

    const horas = Number(datos.horasTrabajadas);
    if (isNaN(horas) || horas < 0) {
      throw new Error('Las horas trabajadas no pueden ser negativas.');
    }

    const tarifa = Number(datos.tarifaHora);
    if (isNaN(tarifa) || tarifa < 0) {
      throw new Error('La tarifa por hora debe ser un número mayor o igual a 0.');
    }

    this.horasTrabajadas = horas;
    this.tarifaHora = tarifa;
    this.aceptaFondoAhorro = Boolean(datos.aceptaFondoAhorro);
  }

  /**
   * Horas normales: hasta 40 horas a tarifa normal.
   * Horas extras (más de 40 horas): se pagan a 1.5 x la tarifa normal.
   * @returns {number}
   */
  calcularSalarioBruto() {
    if (this.horasTrabajadas <= 40) {
      return Math.round(this.horasTrabajadas * this.tarifaHora);
    }

    const horasNormales = 40;
    const horasExtras = this.horasTrabajadas - 40;
    const pagoNormal = horasNormales * this.tarifaHora;
    const pagoExtras = horasExtras * (this.tarifaHora * 1.5);

    return Math.round(pagoNormal + pagoExtras);
  }

  /**
   * Regla de negocio: No recibe bonos.
   * @returns {Array}
   */
  obtenerBonos() {
    return [];
  }

  /**
   * No es empleado permanente, por lo que no recibe bono de alimentación.
   * @returns {boolean}
   */
  esPermanente() {
    return false;
  }

  /**
   * Beneficio y aporte a fondo de ahorro:
   * "Empleados por Horas con más de 1 año:
   *  Acceso a fondo de ahorro (2% del salario depositado mensualmente), si acepta el acceso al fondo."
   * Se registra como aporte/deducción destinada al fondo de ahorro del empleado.
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerDeduccionesEspeciales() {
    const deducciones = [];
    if (this.aniosServicio > 1 && this.aceptaFondoAhorro) {
      const salarioBruto = this.calcularSalarioBruto();
      deducciones.push({
        concepto: 'Fondo de Ahorro (2% ahorro del empleado)',
        valor: Math.round(salarioBruto * 0.02)
      });
    }
    return deducciones;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      horasTrabajadas: this.horasTrabajadas,
      tarifaHora: this.tarifaHora,
      aceptaFondoAhorro: this.aceptaFondoAhorro
    };
  }
}
