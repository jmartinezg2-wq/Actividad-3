import { EmpleadoAsalariado } from './EmpleadoAsalariado.js';
import { EmpleadoPorHoras } from './EmpleadoPorHoras.js';
import { EmpleadoPorComision } from './EmpleadoPorComision.js';
import { EmpleadoTemporal } from './EmpleadoTemporal.js';

const constructores = new Map([
  ['asalariado', EmpleadoAsalariado],
  ['por horas', EmpleadoPorHoras],
  ['horas', EmpleadoPorHoras],
  ['por comisión', EmpleadoPorComision],
  ['por comision', EmpleadoPorComision],
  ['comisión', EmpleadoPorComision],
  ['comision', EmpleadoPorComision],
  ['temporal', EmpleadoTemporal]
]);

export class EmpleadoFactory {
  static crearEmpleado(datos) {
    if (!datos || typeof datos.tipo !== 'string') {
      throw new Error('El tipo de empleado es obligatorio para crear el registro.');
    }

    const ConstructorEmpleado = constructores.get(datos.tipo.trim().toLowerCase());
    if (!ConstructorEmpleado) {
      throw new Error(`Tipo de empleado desconocido: "${datos.tipo}".`);
    }

    return new ConstructorEmpleado(datos);
  }
}
