import { Empleado } from './Empleado.js';
import { validarNumeroNoNegativo } from '../validation/validaciones.js';

export class EmpleadoAsalariado extends Empleado {
  constructor(datos) {
    super({ ...datos, tipo: 'Asalariado' });
    this.salarioBase = validarNumeroNoNegativo(datos.salarioBase, 'El salario fijo mensual');
  }

  calcularSalarioBruto() {
    return this.salarioBase;
  }

  /** Aplica el bono del 10% solo al superar cinco años de servicio. */
  obtenerBonos() {
    return this.aniosServicio > 5
      ? [{ concepto: 'Bono de antigüedad (> 5 años, 10%)', valor: Math.round(this.salarioBase * 0.1) }]
      : [];
  }

  esPermanente() {
    return true;
  }

  toJSON() {
    return { ...super.toJSON(), salarioBase: this.salarioBase };
  }
}
