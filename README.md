# Sistema de Nómina con POO y Principios SOLID
### Universidad de Cartagena — CTEV (Centro de Tecnologías para la Educación Virtual)
**Actividad Unidad Tres | Entrega CIPA**

---

## 📋 Descripción del Proyecto
Este proyecto implementa un sistema integral de liquidación de nómina empresarial bajo el paradigma de **Programación Orientada a Objetos (POO)** en JavaScript moderno (ES Modules) y **Node.js con Express**, aplicando estrictamente los **Principios SOLID**, estándares de **Código Limpio (Clean Code)**, **Pruebas Unitarias** automatizadas y buenas prácticas de ingeniería de software.

---

## 🏛️ Principios SOLID Aplicados

| Principio | Cómo se aplica en este proyecto | Archivo de Referencia |
| :--- | :--- | :--- |
| **S — Single Responsibility (Responsabilidad Única)** | Cada clase de empleado (`EmpleadoAsalariado`, `EmpleadoPorHoras`, etc.) gestiona exclusivamente sus atributos y el cálculo de su salario bruto. La liquidación de deducciones y consolidado está delegada al servicio [`CalculadoraNomina`](nomina-poo/src/services/CalculadoraNomina.js) y la inmutabilidad del resultado a [`Desprendible`](nomina-poo/src/models/Desprendible.js). | [`nomina-poo/src/models/Empleado.js`](nomina-poo/src/models/Empleado.js), [`nomina-poo/src/services/CalculadoraNomina.js`](nomina-poo/src/services/CalculadoraNomina.js) |
| **O — Open/Closed (Abierto / Cerrado)** | El sistema está abierto a la extensión y cerrado a la modificación. Si surge un nuevo contrato (ej: *Empleado Remoto* o *Por Destajo*), se crea una nueva subclase que extienda de `Empleado` sin alterar la calculadora ni el gestor. | [`nomina-poo/src/models/Empleado.js`](nomina-poo/src/models/Empleado.js) |
| **L — Liskov Substitution (Sustitución de Liskov)** | Cualquier subclase de `Empleado` puede sustituir a la clase base sin alterar la corrección del programa. La `CalculadoraNomina` interactúa con el contrato polimórfico de `Empleado` sin requerir validaciones condicionales `switch(tipo)` en tiempo de ejecución. | [`nomina-poo/src/services/CalculadoraNomina.js`](nomina-poo/src/services/CalculadoraNomina.js) |
| **I — Interface Segregation (Segregación de Interfaces)** | Las clases solo implementan y exponen los métodos y beneficios que realmente les corresponden (`obtenerBonos()`, `obtenerDeduccionesEspeciales()`, `esPermanente()`), evitando métodos sobrecargados innecesarios. | [`nomina-poo/src/models/EmpleadoPorHoras.js`](nomina-poo/src/models/EmpleadoPorHoras.js) |
| **D — Dependency Inversion (Inversión de Dependencias)** | Las capas de alto nivel (`CalculadoraNomina`, `GestorEmpleados`) dependen de la abstracción `Empleado`, no de detalles de bajo nivel. Se utilizó además el patrón **Factory Method** (`EmpleadoFactory`) para desacoplar la creación de objetos. | [`nomina-poo/src/models/EmpleadoFactory.js`](nomina-poo/src/models/EmpleadoFactory.js) |

---

## 💼 Reglas de Negocio Implementadas

### 1. Tipos de Empleados y Fórmulas
1. **Empleado Asalariado:**
   - Devenga salario fijo mensual.
   - **Bono antigüedad:** 10% sobre el salario base si lleva **más de 5 años** en la empresa.
   - **Bono alimentación:** $1.000.000 mensuales cubiertos por la empresa (por ser empleado permanente).
2. **Empleado por Horas:**
   - Pago por horas trabajadas a tarifa base (primeras 40 horas).
   - **Horas extras:** Horas trabajadas superiores a 40 se liquidan al **1.5 × tarifa normal**.
   - No recibe bonos de antigüedad ni de alimentación.
   - **Fondo de ahorro:** Si lleva **más de 1 año** y acepta afiliarse, se destina el **2%** de su salario mensual a su fondo de ahorro.
3. **Empleado por Comisión:**
   - Devenga salario base + porcentaje de comisión sobre ventas realizadas.
   - **Bono por metas:** Si las ventas superan los **$20.000.000**, recibe un bono adicional del **3% sobre las ventas**.
   - **Bono alimentación:** $1.000.000 mensuales cubiertos por la empresa (por ser empleado permanente).
4. **Empleado Temporal:**
   - Salario fijo mensual pactado por tiempo definido.
   - No aplican bonos ni beneficios adicionales.

### 2. Deducciones Obligatorias
- **Seguro Social y Pensión:** 4% sobre el salario bruto.
- **ARL:** Tasa de riesgo laboral (0.522% Riesgo Clase I).

### 3. Validaciones
- Salario neto jamás puede ser negativo.
- Las horas trabajadas no pueden ser negativas ($\ge 0$).
- Las ventas de un empleado por comisión no pueden ser menores a $\$0$.
- Los años de servicio y salarios base no pueden ser negativos.

---

## 🛠️ Metodología de Desarrollo de Software

Para el desarrollo del proyecto se adoptó un marco de trabajo **Ágil basado en Scrum / Kanban** complementado con **TDD (Test-Driven Development)**:
1. **Planificación y Backlog:** Se desglosaron los requerimientos del PDF en historias de usuario y criterios de aceptación por tipo de contrato.
2. **Diseño Guiado por el Dominio (DDD) & POO:** Se modeló el dominio con una jerarquía de clases limpias, encapsuladas y desacopladas mediante el patrón Factory.
3. **Desarrollo Guiado por Pruebas (TDD):** Se implementó primero la suite de pruebas unitarias (`node:test`) validando los límites de negocio (ej. horas extras, límites de $20M de ventas, umbrales de antigüedad).
4. **Refactorización y Clean Code:** Nomenclatura descriptiva en español/inglés, funciones de responsabilidad única, comentarios JSDoc y manejo de excepciones robusto.
5. **Control de Versiones:** Registro y trazabilidad de cambios en GitHub evidenciando la contribución del CIPA.

---

## 📂 Estructura del Proyecto

```text
Actividad-3/
├── README.md                      # Documentación principal del repositorio
└── nomina-poo/
    ├── package.json               # Configuración del proyecto y scripts
    ├── server.js                  # Servidor Express (API REST y archivos estáticos)
    ├── index.html                 # Vista interactiva del usuario
    ├── css/
    │   └── styles.css             # Estilos responsive modernos
    ├── js/
    │   └── ui.js                  # Controlador Frontend (vínculo con la API)
    ├── src/
    │   ├── models/                # Capa de Dominio (POO)
    │   │   ├── Empleado.js           # Clase base abstracta
    │   │   ├── EmpleadoAsalariado.js # Empleado con salario fijo y antigüedad
    │   │   ├── EmpleadoPorHoras.js   # Empleado por horas, extras y fondo
    │   │   ├── EmpleadoPorComision.js# Empleado con comisiones y metas
    │   │   ├── EmpleadoTemporal.js   # Empleado contrato definido
    │   │   ├── EmpleadoFactory.js    # Factory Method para instanciación
    │   │   └── Desprendible.js       # Objeto de resultado inmutable
    │   └── services/              # Capa de Servicios
    │       ├── CalculadoraNomina.js  # Liquidador polimórfico de nómina
    │       └── GestorEmpleados.js    # Repositorio en memoria y orquestador
    └── test/
        └── nomina.test.js         # Suite de pruebas unitarias (17 tests)
```

---

## 🚀 Instrucciones de Ejecución

### 1. Requisitos Previos
- Node.js versión 18 o superior instalada.

### 2. Instalación de dependencias
```bash
cd nomina-poo
npm install
```

### 3. Ejecutar las Pruebas Unitarias
El proyecto utiliza el runner nativo de pruebas de Node.js:
```bash
npm test
```
*Salida esperada:* **17 tests pasando con éxito (0 fallos).**

### 4. Iniciar la Aplicación Web
```bash
npm start
```
Abre tu navegador en: **`http://localhost:3000`**

---

## 📹 Guía para la Exposición en Video (YouTube - CIPA)

Recomendación de estructura de 5 a 8 minutos para el video de presentación del CIPA:
1. **Introducción (1 min):** Presentación de los integrantes del CIPA, asignatura y objetivo de la Actividad Unidad 3.
2. **Metodología y Arquitectura (1.5 min):** Explicar la metodología ágil empleada y cómo se estructuraron las carpetas (`models`, `services`, `controllers`).
3. **Explicación de Principios SOLID (2 min):**
   - Mostrar el código de `Empleado.js` y cómo las subclases aplican **LSP** y **OCP**.
   - Mostrar `CalculadoraNomina.js` explicando **SRP** y **DIP**.
4. **Demostración de Pruebas Unitarias (1.5 min):**
   - Ejecutar en la terminal `npm test` en vivo y explicar las pruebas de los 4 tipos de empleados y las validaciones de errores.
5. **Demostración de la Aplicación en Navegador (1.5 min):**
   - Abrir `http://localhost:3000`.
   - Presionar "Cargar ejemplos" y mostrar los 5 casos liquidados en pantalla con sus desprendibles y total neto.
   - Probar agregar un empleado por horas o por comisión para evidenciar los campos dinámicos.
6. **Conclusión (30 seg):** Cierre y resumen de aprendizajes en POO y buenas prácticas.
