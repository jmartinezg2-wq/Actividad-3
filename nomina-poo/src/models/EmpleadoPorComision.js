import { Empleado } from './Empleado.js';
import { validarNumeroNoNegativo, validarPorcentaje } from '../validation/validaciones.js';

export class EmpleadoPorComision extends Empleado {
  constructor(datos) {
    super({ ...datos, tipo: 'Por Comisión' });
    this.salarioBase = validarNumeroNoNegativo(datos.salarioBase, 'El salario base');
    this.ventasMes = validarNumeroNoNegativo(datos.ventasMes, 'Las ventas');
    this.porcentajeComision = validarPorcentaje(
      datos.porcentajeComision,
      'El porcentaje de comisión'
    );
  }

  calcularSalarioBruto() {
    return Math.round(this.salarioBase + (this.ventasMes * this.porcentajeComision / 100));
  }

  /** Aplica el bono del 3% únicamente cuando las ventas superan $20.000.000. */
  obtenerBonos() {
    return this.ventasMes > 20000000
      ? [{ concepto: 'Bono por ventas superiores a $20.000.000 (3%)', valor: Math.round(this.ventasMes * 0.03) }]
      : [];
  }

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
