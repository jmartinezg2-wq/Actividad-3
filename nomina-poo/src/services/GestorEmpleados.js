export class GestorEmpleados {
  constructor({ calculadora, creadorEmpleado } = {}) {
    if (typeof calculadora?.liquidarTodos !== 'function') {
      throw new Error('La calculadora debe implementar liquidarTodos().');
    }
    if (typeof creadorEmpleado !== 'function') {
      throw new Error('El creador de empleados debe ser una función.');
    }
    this.calculadora = calculadora;
    this.creadorEmpleado = creadorEmpleado;
    this.empleados = new Map();
  }

  agregarEmpleado(datosEmpleado) {
    const empleado = this.creadorEmpleado(datosEmpleado);
    if (this.empleados.has(empleado.id)) {
      throw new Error(`Ya existe un empleado con el identificador "${empleado.id}".`);
    }
    this.empleados.set(empleado.id, empleado);
    return empleado;
  }

  obtenerTodos() {
    return Array.from(this.empleados.values());
  }

  liquidarNomina() {
    return this.calculadora.liquidarTodos(this.obtenerTodos());
  }

  vaciar() {
    this.empleados.clear();
  }

  cargarEjemplos() {
    this.vaciar();
    [
      { tipo: 'Asalariado', nombre: 'Carlos Gómez', aniosServicio: 6, salarioBase: 3500000 },
      { tipo: 'Asalariado', nombre: 'Laura Morales', aniosServicio: 2, salarioBase: 2000000 },
      {
        tipo: 'Por Horas', nombre: 'Andrés Castro', aniosServicio: 3,
        horasTrabajadas: 48, tarifaHora: 25000, aceptaFondoAhorro: true
      },
      {
        tipo: 'Por Comisión', nombre: 'Mariana Ríos', aniosServicio: 4,
        salarioBase: 1500000, ventasMes: 25000000, porcentajeComision: 5
      },
      {
        tipo: 'Temporal', nombre: 'Diego Ramírez', aniosServicio: 0.5,
        salarioBase: 1800000, fechaInicio: '2026-01-01', fechaFin: '2026-06-30'
      }
    ].forEach((datos) => this.agregarEmpleado(datos));

    return this.liquidarNomina();
  }
}
