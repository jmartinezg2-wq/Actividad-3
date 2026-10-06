import { Desprendible } from '../models/Desprendible.js';
import { validarNumeroNoNegativo, validarTasa } from '../validation/validaciones.js';

export const TASA_SEGURIDAD_SOCIAL_PENSION = 0.04;

export class CalculadoraNomina {
  constructor({
    tasaSeguridadSocialPension = TASA_SEGURIDAD_SOCIAL_PENSION,
    tasaARL
  } = {}) {
    this.tasaSeguridadSocialPension = validarTasa(
      tasaSeguridadSocialPension,
      'La tasa de seguridad social y pensión'
    );
    // El enunciado no fija una tasa ARL; la composición debe proporcionarla explícitamente.
    this.tasaARL = validarTasa(tasaARL, 'La tasa ARL');
  }

  liquidarEmpleado(empleado) {
    const operacionesRequeridas = [
      'calcularSalarioBruto',
      'obtenerBonos',
      'obtenerBeneficiosAdicionales',
      'obtenerDeduccionesEspeciales',
      'toJSON'
    ];
    if (!empleado || operacionesRequeridas.some((operacion) => typeof empleado[operacion] !== 'function')) {
      throw new Error('El empleado no cumple el contrato requerido para liquidar la nómina.');
    }

    const salarioBruto = validarNumeroNoNegativo(
      empleado.calcularSalarioBruto(),
      'El salario bruto'
    );
    const bonos = empleado.obtenerBonos();
    const totalBonos = bonos.reduce(
      (total, bono) => total + validarNumeroNoNegativo(bono.valor, `El valor de ${bono.concepto}`),
      0
    );
    // Los bonos salariales integran la base obligatoria; la alimentación empresarial no.
    const baseDeduccionesObligatorias = salarioBruto + totalBonos;
    const deducciones = [
      {
        concepto: `Seguridad social y pensión (${this.tasaSeguridadSocialPension * 100}%)`,
        valor: Math.round(baseDeduccionesObligatorias * this.tasaSeguridadSocialPension)
      },
      {
        concepto: `ARL (${(this.tasaARL * 100).toFixed(3)}%)`,
        valor: Math.round(baseDeduccionesObligatorias * this.tasaARL)
      },
      ...empleado.obtenerDeduccionesEspeciales()
    ];

    return new Desprendible({
      empleado: empleado.toJSON(),
      salarioBruto,
      bonos,
      beneficios: empleado.obtenerBeneficiosAdicionales(),
      deducciones
    });
  }

  liquidarTodos(empleados = []) {
    if (!Array.isArray(empleados)) {
      throw new Error('La lista de empleados debe ser un arreglo.');
    }

    const desprendibles = empleados.map((empleado) => this.liquidarEmpleado(empleado));
    const sumar = (propiedad) => desprendibles.reduce((total, item) => total + item[propiedad], 0);

    return {
      desprendibles,
      totalNeto: sumar('salarioNeto'),
      totalBruto: sumar('salarioBruto'),
      totalDevengado: sumar('totalDevengado'),
      totalBeneficios: sumar('totalBeneficios'),
      totalCompensacion: sumar('totalCompensacion'),
      totalDeducciones: sumar('totalDeducciones'),
      totalEmpleados: desprendibles.length
    };
  }
}
