/**
 * @file CalculadoraNomina.js
 * @description Servicio encargado de aplicar las deducciones de ley, calcular beneficios
 * y generar el desprendible de pago polimórficamente. Cumple con SRP, OCP y DIP.
 */

import { Empleado } from '../models/Empleado.js';
import { Desprendible } from '../models/Desprendible.js';

export class CalculadoraNomina {
  /**
   * @param {Object} [config]
   * @param {number} [config.porcentajeSeguroSocialPasion=0.04] 4% obligatorio según la guía
   * @param {number} [config.porcentajeARL=0.00522] 0.522% ARL Riesgo I
   */
  constructor({ porcentajeSeguroSocialPasion = 0.04, porcentajeARL = 0.00522 } = {}) {
    this.porcentajeSeguroSocialPasion = porcentajeSeguroSocialPasion;
    this.porcentajeARL = porcentajeARL;
  }

  /**
   * Liquida la nómina para cualquier empleado derivado de la clase base Empleado.
   * Aplica el principio de sustitución de Liskov (LSP).
   * 
   * @param {Empleado} empleado Instancia de cualquier subclase de Empleado
   * @returns {Desprendible} Desprendible liquidado
   */
  liquidarEmpleado(empleado) {
    if (!(empleado instanceof Empleado)) {
      throw new Error('El objeto a liquidar debe ser una instancia válida de Empleado.');
    }

    // 1. Cálculo polimórfico del salario bruto
    const salarioBruto = empleado.calcularSalarioBruto();

    // 2. Bonos específicos del tipo de contrato
    const bonos = empleado.obtenerBonos();

    // 3. Beneficios adicionales (ej. Bono Alimentación para permanentes)
    const beneficios = empleado.obtenerBeneficiosAdicionales();

    // 4. Deducciones obligatorias de ley sobre el salario bruto
    const deducciones = [];

    // Deducción Seguro Social y Pensión (4% del salario bruto)
    const valSeguroPension = Math.round(salarioBruto * this.porcentajeSeguroSocialPasion);
    deducciones.push({
      concepto: `Seguro Social y Pensión (${this.porcentajeSeguroSocialPasion * 100}%)`,
      valor: valSeguroPension
    });

    // Deducción / Aporte ARL
    const valARL = Math.round(salarioBruto * this.porcentajeARL);
    deducciones.push({
      concepto: `ARL Riesgo I (${(this.porcentajeARL * 100).toFixed(3)}%)`,
      valor: valARL
    });

    // 5. Deducciones especiales del tipo de empleado (ej. Fondo de Ahorro)
    const deduccionesEspeciales = empleado.obtenerDeduccionesEspeciales();
    deducciones.push(...deduccionesEspeciales);

    // 6. Generación del desprendible
    return new Desprendible({
      empleado: empleado.toJSON(),
      salarioBruto,
      bonos,
      beneficios,
      deducciones
    });
  }

  /**
   * Liquida una lista de empleados y totaliza la nómina de la empresa.
   * @param {Empleado[]} empleados
   * @returns {{ desprendibles: Desprendible[], totalNeto: number, totalBruto: number, totalDevengado: number, totalDeducciones: number }}
   */
  liquidarTodos(empleados = []) {
    const desprendibles = empleados.map(emp => this.liquidarEmpleado(emp));
    const totalNeto = desprendibles.reduce((acc, d) => acc + d.salarioNeto, 0);
    const totalBruto = desprendibles.reduce((acc, d) => acc + d.salarioBruto, 0);
    const totalDevengado = desprendibles.reduce((acc, d) => acc + d.totalDevengado, 0);
    const totalDeducciones = desprendibles.reduce((acc, d) => acc + d.totalDeducciones, 0);

    return {
      desprendibles,
      totalNeto,
      totalBruto,
      totalDevengado,
      totalDeducciones,
      totalEmpleados: desprendibles.length
    };
  }
}
