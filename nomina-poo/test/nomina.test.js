import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { Desprendible } from '../src/models/Desprendible.js';
import { EmpleadoAsalariado } from '../src/models/EmpleadoAsalariado.js';
import { EmpleadoPorHoras } from '../src/models/EmpleadoPorHoras.js';
import { EmpleadoPorComision } from '../src/models/EmpleadoPorComision.js';
import { EmpleadoTemporal } from '../src/models/EmpleadoTemporal.js';
import { EmpleadoFactory } from '../src/models/EmpleadoFactory.js';
import { CalculadoraNomina } from '../src/services/CalculadoraNomina.js';
import { GestorEmpleados } from '../src/services/GestorEmpleados.js';
import { validarNumeroNoNegativo } from '../src/validation/validaciones.js';

const TASA_ARL_PRUEBA = 0.01;
const calculadora = new CalculadoraNomina({ tasaARL: TASA_ARL_PRUEBA });
const liquidar = (empleado) => calculadora.liquidarEmpleado(empleado);
const crearGestor = () => new GestorEmpleados({
  calculadora,
  creadorEmpleado: (datos) => EmpleadoFactory.crearEmpleado(datos)
});

describe('Empleado asalariado', () => {
  it('liquida salario fijo sin bono con exactamente 5 años', () => {
    const resultado = liquidar(new EmpleadoAsalariado({
      nombre: 'Ana', aniosServicio: 5, salarioBase: 3000000
    }));
    assert.equal(resultado.salarioBruto, 3000000);
    assert.equal(resultado.totalBonos, 0);
  });

  it('otorga 10% de bono con más de 5 años', () => {
    const resultado = liquidar(new EmpleadoAsalariado({
      nombre: 'Ana', aniosServicio: 5.01, salarioBase: 3000000
    }));
    assert.equal(resultado.totalBonos, 300000);
  });

  it('reporta alimentación como beneficio empresarial no salarial', () => {
    const resultado = liquidar(new EmpleadoAsalariado({
      nombre: 'Ana', aniosServicio: 2, salarioBase: 2000000
    }));
    assert.equal(resultado.totalBeneficios, 1000000);
    assert.equal(resultado.totalSalarial, 2000000);
    assert.equal(resultado.salarioNeto, 1900000);
    assert.equal(resultado.totalCompensacion, 3000000);
  });
});

describe('Empleado por horas', () => {
  it('paga hasta 40 horas con tarifa normal', () => {
    const empleado = new EmpleadoPorHoras({ nombre: 'Luis', horasTrabajadas: 40, tarifaHora: 20000 });
    assert.equal(empleado.calcularSalarioBruto(), 800000);
  });

  it('paga únicamente las horas superiores a 40 al 150%', () => {
    const empleado = new EmpleadoPorHoras({ nombre: 'Luis', horasTrabajadas: 46, tarifaHora: 20000 });
    assert.equal(empleado.calcularSalarioBruto(), 980000);
    assert.deepEqual(empleado.obtenerBonos(), []);
  });

  it('aporta 2% al fondo con más de 1 año y aceptación explícita', () => {
    const resultado = liquidar(new EmpleadoPorHoras({
      nombre: 'Luis', aniosServicio: 2, horasTrabajadas: 40,
      tarifaHora: 25000, aceptaFondoAhorro: true
    }));
    assert.equal(resultado.deducciones.at(-1).valor, 20000);
  });

  it('no aporta al fondo con exactamente 1 año', () => {
    const resultado = liquidar(new EmpleadoPorHoras({
      nombre: 'Luis', aniosServicio: 1, horasTrabajadas: 40,
      tarifaHora: 25000, aceptaFondoAhorro: true
    }));
    assert.equal(resultado.deducciones.length, 2);
  });

  it('no aporta al fondo si no lo acepta', () => {
    const resultado = liquidar(new EmpleadoPorHoras({
      nombre: 'Luis', aniosServicio: 2, horasTrabajadas: 40,
      tarifaHora: 25000, aceptaFondoAhorro: false
    }));
    assert.equal(resultado.deducciones.length, 2);
  });
});

describe('Empleado por comisión', () => {
  it('calcula salario base más porcentaje de ventas', () => {
    const empleado = new EmpleadoPorComision({
      nombre: 'Marta', salarioBase: 1200000, ventasMes: 15000000, porcentajeComision: 4
    });
    assert.equal(empleado.calcularSalarioBruto(), 1800000);
  });

  it('no otorga bono con ventas exactamente iguales a $20.000.000', () => {
    const resultado = liquidar(new EmpleadoPorComision({
      nombre: 'Marta', salarioBase: 1000000, ventasMes: 20000000, porcentajeComision: 5
    }));
    assert.equal(resultado.totalBonos, 0);
  });

  it('otorga 3% de bono cuando las ventas superan $20.000.000', () => {
    const resultado = liquidar(new EmpleadoPorComision({
      nombre: 'Marta', salarioBase: 1000000, ventasMes: 20000001, porcentajeComision: 5
    }));
    assert.equal(resultado.totalBonos, 600000);
    assert.equal(resultado.totalBeneficios, 1000000);
  });
});

describe('Empleado temporal', () => {
  it('liquida el salario sin fechas contractuales', () => {
    const resultado = liquidar(new EmpleadoTemporal({ nombre: 'Sara', salarioBase: 1800000 }));
    assert.equal(resultado.salarioBruto, 1800000);
    assert.equal(resultado.empleado.fechaInicio, undefined);
    assert.equal(resultado.empleado.fechaFin, undefined);
  });

  it('liquida salario fijo sin bonos ni beneficios y conserva las fechas', () => {
    const empleado = new EmpleadoTemporal({
      nombre: 'Sara', salarioBase: 1800000,
      fechaInicio: '2026-01-01', fechaFin: '2026-06-30'
    });
    const resultado = liquidar(empleado);
    assert.equal(resultado.salarioBruto, 1800000);
    assert.equal(resultado.totalBonos, 0);
    assert.equal(resultado.totalBeneficios, 0);
    assert.equal(empleado.toJSON().fechaFin, '2026-06-30');
  });

  it('rechaza una fecha final igual o anterior a la inicial', () => {
    assert.throws(() => new EmpleadoTemporal({
      nombre: 'Sara', salarioBase: 1800000,
      fechaInicio: '2026-06-30', fechaFin: '2026-06-30'
    }), /posterior/);
  });

  it('rechaza fechas inexistentes o con formato incorrecto', () => {
    assert.throws(() => new EmpleadoTemporal({
      nombre: 'Sara', salarioBase: 1800000,
      fechaInicio: '2026-02-30', fechaFin: '2026-06-30'
    }), /fecha válida/);
  });

  it('valida de forma independiente una fecha opcional cuando se proporciona', () => {
    const empleado = new EmpleadoTemporal({
      nombre: 'Sara', salarioBase: 1800000, fechaInicio: '2026-01-01'
    });
    assert.equal(empleado.fechaInicio, '2026-01-01');
    assert.equal(empleado.fechaFin, undefined);
    assert.throws(() => new EmpleadoTemporal({
      nombre: 'Sara', salarioBase: 1800000, fechaFin: ''
    }), /formato/);
  });
});

describe('Deducciones y configuración', () => {
  it('aplica 4% combinado de seguridad social y pensión sobre los ingresos salariales', () => {
    const resultado = liquidar(new EmpleadoAsalariado({ nombre: 'Eva', salarioBase: 1000000 }));
    assert.equal(resultado.deducciones[0].valor, 40000);
  });

  it('exige una tasa ARL explícita', () => {
    assert.throws(() => new CalculadoraNomina(), /tasa ARL.*obligatorio/i);
  });

  it('permite configurar la tasa ARL', () => {
    const personalizada = new CalculadoraNomina({ tasaARL: 0.01 });
    const resultado = personalizada.liquidarEmpleado(
      new EmpleadoAsalariado({ nombre: 'Eva', salarioBase: 1000000 })
    );
    assert.equal(resultado.deducciones[1].valor, 10000);
  });

  it('rechaza tasas ARL negativas, no finitas o superiores a 1', () => {
    assert.throws(() => new CalculadoraNomina({ tasaARL: -0.01 }), /mayor o igual a 0/);
    assert.throws(() => new CalculadoraNomina({ tasaARL: Infinity }), /finito/);
    assert.throws(() => new CalculadoraNomina({ tasaARL: 1.01 }), /entre 0 y 1/);
  });

  it('incluye el bono de antigüedad en las deducciones obligatorias', () => {
    const resultado = liquidar(new EmpleadoAsalariado({
      nombre: 'Eva', aniosServicio: 6, salarioBase: 3000000
    }));
    assert.equal(resultado.totalBonos, 300000);
    assert.equal(resultado.deducciones[0].valor, 132000);
    assert.equal(resultado.deducciones[1].valor, 33000);
  });

  it('incluye el bono de ventas y excluye alimentación de la base obligatoria', () => {
    const resultado = liquidar(new EmpleadoPorComision({
      nombre: 'Marta', salarioBase: 1000000, ventasMes: 20000001, porcentajeComision: 5
    }));
    assert.equal(resultado.salarioBruto, 2000000);
    assert.equal(resultado.totalBonos, 600000);
    assert.equal(resultado.totalBeneficios, 1000000);
    assert.equal(resultado.deducciones[0].valor, 104000);
    assert.equal(resultado.deducciones[1].valor, 26000);
  });
});

describe('Validaciones', () => {
  it('acepta cero y cadenas numéricas en el límite de entrada', () => {
    assert.equal(validarNumeroNoNegativo(0, 'El valor'), 0);
    assert.equal(validarNumeroNoNegativo('0', 'El valor'), 0);
    assert.equal(validarNumeroNoNegativo('12.5', 'El valor'), 12.5);
  });

  it('rechaza ausencias, texto no numérico y coerciones de tipos no numéricos', () => {
    for (const valor of [null, undefined, '', '   ', 'abc', true, false, [], {}, [1]]) {
      assert.throws(() => validarNumeroNoNegativo(valor, 'El valor'));
    }
  });

  it('rechaza negativos y números no finitos', () => {
    for (const valor of [-1, '-1', Infinity, -Infinity, NaN, 'Infinity']) {
      assert.throws(() => validarNumeroNoNegativo(valor, 'El valor'));
    }
  });

  it('usa cero años solo cuando la antigüedad se omite', () => {
    assert.equal(new EmpleadoAsalariado({ nombre: 'X', salarioBase: 1 }).aniosServicio, 0);
    for (const aniosServicio of [null, undefined, '', ' ', true, false, [], {}, -1, Infinity, NaN]) {
      assert.throws(() => new EmpleadoAsalariado({
        nombre: 'X', salarioBase: 1, aniosServicio
      }));
    }
    assert.equal(new EmpleadoAsalariado({
      nombre: 'X', salarioBase: 1, aniosServicio: '2.5'
    }).aniosServicio, 2.5);
  });

  it('rechaza horas negativas y no finitas', () => {
    assert.throws(() => new EmpleadoPorHoras({ nombre: 'X', horasTrabajadas: -1, tarifaHora: 1 }), /horas/);
    assert.throws(() => new EmpleadoPorHoras({ nombre: 'X', horasTrabajadas: Infinity, tarifaHora: 1 }), /finito/);
    assert.throws(() => new EmpleadoPorHoras({ nombre: 'X', horasTrabajadas: '', tarifaHora: 1 }), /obligatorio/);
    assert.equal(new EmpleadoPorHoras({
      nombre: 'X', horasTrabajadas: '40', tarifaHora: '2'
    }).calcularSalarioBruto(), 80);
  });

  it('rechaza ventas negativas y no finitas', () => {
    assert.throws(() => new EmpleadoPorComision({
      nombre: 'X', salarioBase: 1, ventasMes: -1, porcentajeComision: 0
    }), /ventas/);
    assert.throws(() => new EmpleadoPorComision({
      nombre: 'X', salarioBase: 1, ventasMes: NaN, porcentajeComision: 0
    }), /finito/);
    assert.throws(() => new EmpleadoPorComision({
      nombre: 'X', salarioBase: 1, ventasMes: null, porcentajeComision: 0
    }), /obligatorio/);
    assert.equal(new EmpleadoPorComision({
      nombre: 'X', salarioBase: '1', ventasMes: '100', porcentajeComision: '2'
    }).calcularSalarioBruto(), 3);
  });

  it('rechaza salarios y años de servicio no válidos', () => {
    assert.throws(() => new EmpleadoAsalariado({ nombre: 'X', salarioBase: -1 }), /salario/);
    assert.throws(() => new EmpleadoAsalariado({ nombre: 'X', salarioBase: 1, aniosServicio: Infinity }), /finito/);
  });

  it('rechaza porcentajes de comisión fuera de 0 a 100', () => {
    assert.throws(() => new EmpleadoPorComision({
      nombre: 'X', salarioBase: 1, ventasMes: 1, porcentajeComision: 101
    }), /100%/);
  });

  it('impide construir un desprendible con salario neto negativo', () => {
    assert.throws(() => new Desprendible({
      empleado: { nombre: 'X' }, salarioBruto: 100,
      deducciones: [{ concepto: 'Prueba', valor: 101 }]
    }), /no puede ser negativo/);
  });
});

describe('Factory y gestor', () => {
  it('crea los cuatro tipos mediante la fábrica', () => {
    const datos = [
      { tipo: 'Asalariado', nombre: 'A', salarioBase: 1 },
      { tipo: 'Por Horas', nombre: 'B', horasTrabajadas: 1, tarifaHora: 1 },
      { tipo: 'Por Comisión', nombre: 'C', salarioBase: 1, ventasMes: 0, porcentajeComision: 0 },
      { tipo: 'Temporal', nombre: 'D', salarioBase: 1 }
    ];
    assert.deepEqual(datos.map((item) => EmpleadoFactory.crearEmpleado(item).tipo), [
      'Asalariado', 'Por Horas', 'Por Comisión', 'Temporal'
    ]);
  });

  it('carga ejemplos de todos los tipos y consolida la nómina', () => {
    const resultado = crearGestor().cargarEjemplos();
    assert.equal(resultado.totalEmpleados, 5);
    assert.equal(new Set(resultado.desprendibles.map((item) => item.empleado.tipo)).size, 4);
    assert.ok(resultado.totalNeto > 0);
  });

  it('rechaza identificadores duplicados sin reemplazar el registro original', () => {
    const gestor = crearGestor();
    gestor.agregarEmpleado({ id: 'EMP-1', tipo: 'Asalariado', nombre: 'Original', salarioBase: 1 });
    assert.throws(() => gestor.agregarEmpleado({
      id: 'EMP-1', tipo: 'Asalariado', nombre: 'Reemplazo', salarioBase: 2
    }), /Ya existe/);
    assert.equal(gestor.obtenerTodos().length, 1);
    assert.equal(gestor.obtenerTodos()[0].nombre, 'Original');
  });

  it('acepta colaboradores por comportamiento en lugar de clases concretas', () => {
    const empleado = { id: 'EMP-1' };
    const gestor = new GestorEmpleados({
      calculadora: { liquidarTodos: (empleados) => ({ cantidad: empleados.length }) },
      creadorEmpleado: () => empleado
    });
    gestor.agregarEmpleado({});
    assert.deepEqual(gestor.liquidarNomina(), { cantidad: 1 });
  });
});
