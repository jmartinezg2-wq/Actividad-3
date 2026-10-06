import { validarNumeroNoNegativo } from '../validation/validaciones.js';

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
    this.salarioBruto = validarNumeroNoNegativo(salarioBruto, 'El salario bruto');
    this.bonos = bonos;
    this.beneficios = beneficios;
    this.deducciones = deducciones;

    this.totalBonos = this.#sumarConceptos(bonos);
    this.totalBeneficios = this.#sumarConceptos(beneficios);
    this.totalSalarial = this.salarioBruto + this.totalBonos;
    this.totalDevengado = this.totalSalarial;
    this.totalCompensacion = this.totalSalarial + this.totalBeneficios;
    this.totalDeducciones = this.#sumarConceptos(deducciones);
    this.salarioNeto = this.totalSalarial - this.totalDeducciones;

    // El bono de alimentación lo cubre la empresa: se informa, pero no aumenta el neto pagado.
    if (this.salarioNeto < 0) {
      throw new Error(
        `El salario neto no puede ser negativo. Total salarial: $${this.totalSalarial}, deducciones: $${this.totalDeducciones}.`
      );
    }
  }

  #sumarConceptos(conceptos) {
    return conceptos.reduce(
      (total, concepto) => total + validarNumeroNoNegativo(concepto.valor, `El valor de ${concepto.concepto}`),
      0
    );
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
      totalSalarial: this.totalSalarial,
      totalDevengado: this.totalDevengado,
      totalCompensacion: this.totalCompensacion,
      deducciones: this.deducciones,
      totalDeducciones: this.totalDeducciones,
      salarioNeto: this.salarioNeto
    };
  }
}
