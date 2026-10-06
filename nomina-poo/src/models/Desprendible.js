/**
 * @file Desprendible.js
 * @description Representa el desprendible de nómina (resultado de la liquidación).
 * Objeto inmutable de valor con el desglose transparente de haberes y deducciones.
 */

export class Desprendible {
  constructor({
    id = `DESP-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    fecha = new Date().toISOString(),
    empleado,
    salarioBruto,
    bonos = [],
    beneficios = [],
    deducciones = []
  }) {
    this.id = id;
    this.fecha = fecha;
    this.empleado = empleado;
    this.salarioBruto = salarioBruto;
    this.bonos = bonos;
    this.beneficios = beneficios;
    this.deducciones = deducciones;

    this.totalBonos = this.bonos.reduce((acc, b) => acc + b.valor, 0);
    this.totalBeneficios = this.beneficios.reduce((acc, b) => acc + b.valor, 0);
    this.totalDevengado = this.salarioBruto + this.totalBonos + this.totalBeneficios;

    this.totalDeducciones = this.deducciones.reduce((acc, d) => acc + d.valor, 0);

    const neto = this.totalDevengado - this.totalDeducciones;
    if (neto < 0) {
      throw new Error(`El salario neto no puede ser negativo. Devengado: $${this.totalDevengado}, Deducciones: $${this.totalDeducciones}`);
    }

    this.salarioNeto = neto;
  }

  toJSON() {
    return {
      id: this.id,
      fecha: this.fecha,
      empleado: this.empleado,
      salarioBruto: this.salarioBruto,
      bonos: this.bonos,
      totalBonos: this.totalBonos,
      beneficios: this.beneficios,
      totalBeneficios: this.totalBeneficios,
      totalDevengado: this.totalDevengado,
      deducciones: this.deducciones,
      totalDeducciones: this.totalDeducciones,
      salarioNeto: this.salarioNeto
    };
  }
}
