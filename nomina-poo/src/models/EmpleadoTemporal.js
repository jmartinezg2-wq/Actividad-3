import { Empleado } from './Empleado.js';
import { validarFechaISO, validarNumeroNoNegativo } from '../validation/validaciones.js';

export class EmpleadoTemporal extends Empleado {
  constructor(datos) {
    super({ ...datos, tipo: 'Temporal' });
    this.salarioBase = validarNumeroNoNegativo(datos.salarioBase, 'El salario temporal');
    this.fechaInicio = Object.hasOwn(datos, 'fechaInicio')
      ? validarFechaISO(datos.fechaInicio, 'La fecha de inicio')
      : undefined;
    this.fechaFin = Object.hasOwn(datos, 'fechaFin')
      ? validarFechaISO(datos.fechaFin, 'La fecha de finalización')
      : undefined;

    if (this.fechaInicio && this.fechaFin && this.fechaFin <= this.fechaInicio) {
      throw new Error('La fecha de finalización debe ser posterior a la fecha de inicio.');
    }
  }

  calcularSalarioBruto() {
    return this.salarioBase;
  }

  toJSON() {
    return {
      ...super.toJSON(),
      salarioBase: this.salarioBase,
      fechaInicio: this.fechaInicio,
      fechaFin: this.fechaFin
    };
  }
}
