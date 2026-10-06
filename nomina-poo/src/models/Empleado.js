/**
 * @file Empleado.js
 * @description Clase base abstracta que representa a un empleado dentro del sistema de nómina.
 * Aplica el principio de Responsabilidad Única (SRP) y Abierto/Cerrado (OCP).
 */

export class Empleado {
  /**
   * @param {Object} datos
   * @param {string} datos.id Identificador único del empleado
   * @param {string} datos.nombre Nombre completo
   * @param {number} datos.aniosServicio Años de servicio en la empresa
   * @param {string} datos.tipo Tipo de empleado (Asalariado, Horas, Comisión, Temporal)
   */
  constructor({ id, nombre, aniosServicio = 0, tipo = 'Genérico' }) {
    if (new.target === Empleado) {
      throw new Error('No se puede instanciar directamente la clase abstracta Empleado.');
    }

    if (!nombre || typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del empleado es obligatorio y no puede estar vacío.');
    }

    const anios = Number(aniosServicio);
    if (isNaN(anios) || anios < 0) {
      throw new Error('Los años de servicio no pueden ser negativos.');
    }

    this.id = id || `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.nombre = nombre.trim();
    this.aniosServicio = anios;
    this.tipo = tipo;
  }

  /**
   * Método polimórfico abstracto para calcular el salario bruto base.
   * Debe ser implementado obligatoriamente por cada subclase (Principio de Sustitución de Liskov).
   * @returns {number}
   */
  calcularSalarioBruto() {
    throw new Error(`El método calcularSalarioBruto() debe ser implementado en la subclase ${this.constructor.name}`);
  }

  /**
   * Retorna los bonos específicos según el tipo de empleado y sus reglas de negocio.
   * Por defecto, no tiene bonos específicos a menos que la subclase los defina.
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerBonos() {
    return [];
  }

  /**
   * Indica si el empleado tiene contrato permanente.
   * Aplica para empleados Asalariados y por Comisión.
   * @returns {boolean}
   */
  esPermanente() {
    return false;
  }

  /**
   * Retorna los beneficios adicionales a los que tiene derecho.
   * - Empleados permanentes: Bono Alimentación ($1.000.000/mes cubierto por la empresa).
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerBeneficiosAdicionales() {
    const beneficios = [];
    if (this.esPermanente()) {
      beneficios.push({
        concepto: 'Bono Alimentación (Permanente)',
        valor: 1000000
      });
    }
    return beneficios;
  }

  /**
   * Retorna deducciones o aportes especiales aplicables según el tipo de contrato.
   * @returns {Array<{ concepto: string, valor: number }>}
   */
  obtenerDeduccionesEspeciales() {
    return [];
  }

  /**
   * Serializa la información del empleado para respuestas JSON o almacenamiento.
   * @returns {Object}
   */
  toJSON() {
    return {
      id: this.id,
      nombre: this.nombre,
      aniosServicio: this.aniosServicio,
      tipo: this.tipo,
      esPermanente: this.esPermanente()
    };
  }
}
