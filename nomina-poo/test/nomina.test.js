/**
 * @file nomina.test.js
 * @description Suite de pruebas unitarias exhaustiva con el runner nativo de Node.js (node:test).
 * Valida todas las reglas de negocio, deducciones, beneficios y validaciones de la Actividad Unidad 3.
 */

import { describe, it } from 'node:test';
import assert from 'node:assert/strict';

import { EmpleadoAsalariado } from '../src/models/EmpleadoAsalariado.js';
import { EmpleadoPorHoras } from '../src/models/EmpleadoPorHoras.js';
import { EmpleadoPorComision } from '../src/models/EmpleadoPorComision.js';
import { EmpleadoTemporal } from '../src/models/EmpleadoTemporal.js';
import { EmpleadoFactory } from '../src/models/EmpleadoFactory.js';
import { CalculadoraNomina } from '../src/services/CalculadoraNomina.js';
import { GestorEmpleados } from '../src/services/GestorEmpleados.js';

describe('Sistema de Nómina con POO - Pruebas Unitarias', () => {
  const calculadora = new CalculadoraNomina({
    porcentajeSeguroSocialPasion: 0.04,
    porcentajeARL: 0.00522
  });

  // =========================================================================
  // 1. EMPLEADO ASALARIADO
  // =========================================================================
  describe('Reglas de Negocio: Empleado Asalariado', () => {
    it('debe liquidar salario fijo mensual y bono de alimentación por ser permanente', () => {
      const emp = new EmpleadoAsalariado({
        nombre: 'Pedro Pérez',
        aniosServicio: 3,
        salarioBase: 2000000
      });

      const desprendible = calculadora.liquidarEmpleado(emp);

      assert.equal(desprendible.salarioBruto, 2000000);
      // No debe tener bono de antigüedad (3 <= 5 años)
      assert.equal(desprendible.bonos.length, 0);
      // Debe recibir bono de alimentación ($1.000.000) por ser permanente
      const bonoAlim = desprendible.beneficios.find(b => b.concepto.includes('Alimentación'));
      assert.ok(bonoAlim, 'Debe incluir bono de alimentación');
      assert.equal(bonoAlim.valor, 1000000);

      // Deducciones: 4% SS/Pensión = 80.000, ARL (0.522%) = 10.440
      assert.equal(desprendible.deducciones[0].valor, 80000);
      assert.equal(desprendible.deducciones[1].valor, 10440);
    });

    it('debe aplicar bono del 10% si lleva MÁS de 5 años en la empresa', () => {
      const emp = new EmpleadoAsalariado({
        nombre: 'Marta Díaz',
        aniosServicio: 6,
        salarioBase: 3000000
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      const bonoAntiguedad = desprendible.bonos.find(b => b.concepto.includes('Antigüedad'));

      assert.ok(bonoAntiguedad, 'Debe tener bono de antigüedad');
      assert.equal(bonoAntiguedad.valor, 300000); // 10% de 3.000.000
    });

    it('no debe aplicar bono del 10% si lleva exactamente 5 años o menos', () => {
      const emp = new EmpleadoAsalariado({
        nombre: 'Juan Soler',
        aniosServicio: 5,
        salarioBase: 3000000
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.bonos.length, 0);
    });
  });

  // =========================================================================
  // 2. EMPLEADO POR HORAS
  // =========================================================================
  describe('Reglas de Negocio: Empleado por Horas', () => {
    it('debe calcular tarifa normal cuando las horas trabajadas son <= 40', () => {
      const emp = new EmpleadoPorHoras({
        nombre: 'Camilo Torres',
        aniosServicio: 0.5,
        horasTrabajadas: 35,
        tarifaHora: 20000
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.salarioBruto, 700000); // 35 * 20.000
      assert.equal(desprendible.bonos.length, 0, 'No debe recibir bonos');
      assert.equal(desprendible.beneficios.length, 0, 'No debe recibir bono de alimentación');
    });

    it('debe pagar horas extras a 1.5 x tarifa normal para más de 40 horas', () => {
      const emp = new EmpleadoPorHoras({
        nombre: 'Juliana Vélez',
        aniosServicio: 0.8,
        horasTrabajadas: 46,
        tarifaHora: 20000
      });

      // 40 horas normales * 20.000 = 800.000
      // 6 horas extras * (20.000 * 1.5) = 6 * 30.000 = 180.000
      // Total Bruto = 980.000
      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.salarioBruto, 980000);
    });

    it('debe acceder al fondo de ahorro (2%) si lleva más de 1 año y acepta afiliarse', () => {
      const emp = new EmpleadoPorHoras({
        nombre: 'Samuel Peña',
        aniosServicio: 2,
        horasTrabajadas: 40,
        tarifaHora: 25000,
        aceptaFondoAhorro: true
      });

      // Bruto = 1.000.000
      const desprendible = calculadora.liquidarEmpleado(emp);
      const fondoAhorro = desprendible.deducciones.find(d => d.concepto.includes('Fondo de Ahorro'));

      assert.ok(fondoAhorro, 'Debe incluir fondo de ahorro');
      assert.equal(fondoAhorro.valor, 20000); // 2% de 1.000.000
    });

    it('no debe aplicar fondo de ahorro si lleva más de 1 año pero no acepta', () => {
      const emp = new EmpleadoPorHoras({
        nombre: 'Samuel Peña',
        aniosServicio: 2,
        horasTrabajadas: 40,
        tarifaHora: 25000,
        aceptaFondoAhorro: false
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      const fondoAhorro = desprendible.deducciones.find(d => d.concepto.includes('Fondo de Ahorro'));
      assert.equal(fondoAhorro, undefined);
    });

    it('no debe aplicar fondo de ahorro si lleva 1 año o menos aunque acepte', () => {
      const emp = new EmpleadoPorHoras({
        nombre: 'Samuel Peña',
        aniosServicio: 1,
        horasTrabajadas: 40,
        tarifaHora: 25000,
        aceptaFondoAhorro: true
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      const fondoAhorro = desprendible.deducciones.find(d => d.concepto.includes('Fondo de Ahorro'));
      assert.equal(fondoAhorro, undefined);
    });
  });

  // =========================================================================
  // 3. EMPLEADO POR COMISIÓN
  // =========================================================================
  describe('Reglas de Negocio: Empleado por Comisión', () => {
    it('debe liquidar salario base + comisión y bono de alimentación por ser permanente', () => {
      const emp = new EmpleadoPorComision({
        nombre: 'Beatriz Londoño',
        aniosServicio: 2,
        salarioBase: 1200000,
        ventasMes: 15000000, // <= 20M
        porcentajeComision: 4
      });

      // Bruto = 1.200.000 + (15.000.000 * 0.04) = 1.200.000 + 600.000 = 1.800.000
      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.salarioBruto, 1800000);
      assert.equal(desprendible.bonos.length, 0, 'No debe recibir bono de metas si ventas <= $20M');

      const bonoAlim = desprendible.beneficios.find(b => b.concepto.includes('Alimentación'));
      assert.ok(bonoAlim, 'Debe incluir bono de alimentación por ser permanente');
      assert.equal(bonoAlim.valor, 1000000);
    });

    it('debe otorgar bono adicional del 3% sobre ventas si estas superan los $20.000.000', () => {
      const emp = new EmpleadoPorComision({
        nombre: 'Rodrigo Blanco',
        aniosServicio: 3,
        salarioBase: 1500000,
        ventasMes: 22000000, // > 20M
        porcentajeComision: 5
      });

      // Bruto: 1.500.000 + (22.000.000 * 0.05) = 1.500.000 + 1.100.000 = 2.600.000
      // Bono adicional 3%: 22.000.000 * 0.03 = 660.000
      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.salarioBruto, 2600000);

      const bonoVentas = desprendible.bonos.find(b => b.concepto.includes('Meta de Ventas'));
      assert.ok(bonoVentas, 'Debe incluir bono meta de ventas');
      assert.equal(bonoVentas.valor, 660000);
    });
  });

  // =========================================================================
  // 4. EMPLEADO TEMPORAL
  // =========================================================================
  describe('Reglas de Negocio: Empleado Temporal', () => {
    it('debe liquidar salario fijo sin bonos ni beneficios adicionales', () => {
      const emp = new EmpleadoTemporal({
        nombre: 'Sofía Quintero',
        aniosServicio: 0.4,
        salarioBase: 1600000,
        duracionMeses: 4
      });

      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.equal(desprendible.salarioBruto, 1600000);
      assert.equal(desprendible.bonos.length, 0);
      assert.equal(desprendible.beneficios.length, 0);
      assert.equal(emp.esPermanente(), false);
    });
  });

  // =========================================================================
  // 5. VALIDACIONES REGLAMENTARIAS
  // =========================================================================
  describe('Validaciones de Negocio y Excepciones', () => {
    it('debe rechazar horas trabajadas negativas', () => {
      assert.throws(() => {
        new EmpleadoPorHoras({
          nombre: 'Inválido',
          horasTrabajadas: -5,
          tarifaHora: 20000
        });
      }, /Las horas trabajadas no pueden ser negativas/);
    });

    it('debe rechazar ventas negativas en empleado por comisión', () => {
      assert.throws(() => {
        new EmpleadoPorComision({
          nombre: 'Inválido',
          salarioBase: 1000000,
          ventasMes: -100
        });
      }, /Las ventas de un empleado por comisión no pueden ser menores a \$0/);
    });

    it('debe rechazar años de servicio negativos', () => {
      assert.throws(() => {
        new EmpleadoAsalariado({
          nombre: 'Inválido',
          aniosServicio: -2,
          salarioBase: 1500000
        });
      }, /Los años de servicio no pueden ser negativos/);
    });

    it('debe garantizar que ningún salario neto sea negativo', () => {
      const emp = new EmpleadoAsalariado({
        nombre: 'Test Neto',
        aniosServicio: 1,
        salarioBase: 2000000
      });
      const desprendible = calculadora.liquidarEmpleado(emp);
      assert.ok(desprendible.salarioNeto >= 0);
    });
  });

  // =========================================================================
  // 6. PATRÓN FACTORY Y GESTOR DE EMPLEADOS
  // =========================================================================
  describe('EmpleadoFactory y GestorEmpleados (Arquitectura)', () => {
    it('debe crear instancias correctas mediante Factory Method', () => {
      const emp1 = EmpleadoFactory.crearEmpleado({ tipo: 'Asalariado', nombre: 'A', salarioBase: 1000 });
      const emp2 = EmpleadoFactory.crearEmpleado({ tipo: 'Por Horas', nombre: 'B', horasTrabajadas: 20, tarifaHora: 100 });
      const emp3 = EmpleadoFactory.crearEmpleado({ tipo: 'Por Comisión', nombre: 'C', salarioBase: 1000, ventasMes: 5000 });
      const emp4 = EmpleadoFactory.crearEmpleado({ tipo: 'Temporal', nombre: 'D', salarioBase: 1000, duracionMeses: 3 });

      assert.ok(emp1 instanceof EmpleadoAsalariado);
      assert.ok(emp2 instanceof EmpleadoPorHoras);
      assert.ok(emp3 instanceof EmpleadoPorComision);
      assert.ok(emp4 instanceof EmpleadoTemporal);
    });

    it('GestorEmpleados debe liquidar nómina consolidada y cargar ejemplos', () => {
      const gestor = new GestorEmpleados(calculadora);
      const resultado = gestor.cargarEjemplos();

      assert.equal(resultado.totalEmpleados, 5);
      assert.ok(resultado.totalNeto > 0);
      assert.ok(resultado.totalBruto > 0);
      assert.ok(resultado.totalDeducciones > 0);
      assert.equal(resultado.desprendibles.length, 5);
    });
  });
});
