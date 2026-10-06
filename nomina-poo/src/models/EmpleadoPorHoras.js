import { Empleado } from './Empleado.js';
import { validarNumeroNoNegativo } from '../validation/validaciones.js';

export class EmpleadoPorHoras extends Empleado {
  constructor(datos) {
    super({ ...datos, tipo: 'Por Horas' });
    this.horasTrabajadas = validarNumeroNoNegativo(datos.horasTrabajadas, 'Las horas trabajadas');
    this.tarifaHora = validarNumeroNoNegativo(datos.tarifaHora, 'La tarifa por hora');
    this.aceptaFondoAhorro = datos.aceptaFondoAhorro === true;
  }

  calcularSalarioBruto() {
    const horasNormales = Math.min(this.horasTrabajadas, 40);
    const horasExtras = Math.max(this.horasTrabajadas - 40, 0);
    return Math.round((horasNormales * this.tarifaHora) + (horasExtras * this.tarifaHora * 1.5));
  }

  /** Descuenta el aporte voluntario del 2% cuando se cumplen antigüedad y aceptación. */
  obtenerDeduccionesEspeciales() {
    if (this.aniosServicio <= 1 || !this.aceptaFondoAhorro) {
      return [];
    }

    return [{
      concepto: 'Aporte voluntario al fondo de ahorro (2%)',
      valor: Math.round(this.calcularSalarioBruto() * 0.02)
    }];
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
