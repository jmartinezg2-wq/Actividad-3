import { validarNumeroNoNegativo } from '../validation/validaciones.js';

export class Empleado {
  constructor(datos = {}) {
    if (new.target === Empleado) {
      throw new Error('No se puede instanciar directamente la clase abstracta Empleado.');
    }
    const { id, nombre, tipo = 'Genérico' } = datos;
    if (typeof nombre !== 'string' || nombre.trim() === '') {
      throw new Error('El nombre del empleado es obligatorio y no puede estar vacío.');
    }

    this.id = id || `EMP-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    this.nombre = nombre.trim();
    // La antigüedad se omite en integraciones antiguas; cualquier valor explícito sí se valida.
    this.aniosServicio = Object.hasOwn(datos, 'aniosServicio')
      ? validarNumeroNoNegativo(datos.aniosServicio, 'Los años de servicio')
      : 0;
    this.tipo = tipo;
  }

  calcularSalarioBruto() {
    throw new Error(`El método calcularSalarioBruto() debe ser implementado en ${this.constructor.name}.`);
  }

  obtenerBonos() {
    return [];
  }

  esPermanente() {
    return false;
  }

  obtenerBeneficiosAdicionales() {
    return this.esPermanente()
      ? [{ concepto: 'Bono de alimentación (cubierto por la empresa)', valor: 1000000 }]
      : [];
  }

  obtenerDeduccionesEspeciales() {
    return [];
  }

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
