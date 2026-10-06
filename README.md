# Sistema de nómina orientado a objetos

Aplicación web para liquidar nómina de empleados asalariados, por horas, por comisión y temporales. El dominio usa JavaScript ES modules, orientación a objetos, prácticas SOLID verificables y pruebas automatizadas con `node:test`.

## Inicio rápido

```bash
cd nomina-poo
npm test
```

La tasa ARL debe definirse de manera explícita antes de iniciar. En PowerShell:

```powershell
$env:TASA_ARL='0.01'
npm start
```

`0.01` es un ejemplo técnico de configuración (1%), no una tasa definida por el enunciado. Sustitúyela por la tasa acordada para el ejercicio. No se requieren dependencias de terceros. Luego abre `http://localhost:3000`.

## Reglas implementadas

| Tipo | Salario y reglas |
| --- | --- |
| Asalariado | Salario mensual. Recibe un bono salarial del 10% cuando su antigüedad es mayor a 5 años. |
| Por horas | Hasta 40 horas a tarifa normal; cada hora adicional se paga a 1,5 veces la tarifa. No recibe bonos. |
| Por comisión | Salario base más el porcentaje configurado de las ventas. Ventas superiores a $20.000.000 generan un bono del 3% de las ventas. |
| Temporal | Salario mensual fijo. Las fechas del contrato son metadatos opcionales; si ambas existen, la fecha final debe ser posterior a la inicial. No recibe bonos ni beneficios adicionales. |

Todas las liquidaciones descuentan el 4% combinado por seguridad social y pensión y la tasa ARL configurada. Ambas deducciones se calculan sobre el salario y los bonos salariales aplicables, sin incluir el beneficio de alimentación. Las entradas monetarias, horas, ventas y antigüedad deben ser números finitos no negativos. La antigüedad omitida conserva compatibilidad al asumir `0`; un valor explícito vacío, nulo o inválido se rechaza.

## Decisiones explícitas ante ambigüedades

La actividad no especifica todos los detalles necesarios para calcular la nómina. El sistema adopta estas decisiones visibles y configurables:

- **Seguridad social y pensión:** el 4% se interpreta como una única tasa combinada sobre todos los ingresos salariales, incluidos los bonos por antigüedad y ventas.
- **ARL:** el enunciado no define una tasa y el sistema no inventa una predeterminada. La composición en `server.js` exige `TASA_ARL` en escala decimal y `CalculadoraNomina` valida un valor finito entre `0` y `1`. Se conserva la interfaz existente que resta ARL del salario neto; esta es una suposición del proyecto y debe confirmarse si cambia el criterio académico o contractual.
- **Alimentación:** los $1.000.000 para asalariados y empleados por comisión se registran como beneficio no salarial cubierto por la empresa. Se muestran en la compensación total, pero no aumentan el salario neto ni la base de deducciones.
- **Fondo de ahorro:** para empleados por horas con más de un año se registra como aporte voluntario del empleado, equivalente al 2% del salario bruto, únicamente cuando existe aceptación explícita.
- **Umbrales:** «más de» es estricto. Exactamente 5 años, 1 año o $20.000.000 no activa el beneficio asociado.

## Cómo leer un desprendible

- **Salario bruto:** salario fijo o resultado de horas/comisión.
- **Total salarial:** salario bruto más bonos salariales.
- **Deducciones:** seguridad social y pensión, ARL y, si aplica, fondo de ahorro.
- **Salario neto:** total salarial menos deducciones. Nunca puede ser negativo.
- **Compensación total:** total salarial más beneficios pagados por la empresa. No equivale al dinero neto entregado al empleado.

## Arquitectura

```text
nomina-poo/
├── index.html                 # Estructura de la interfaz
├── css/styles.css             # Presentación adaptable
├── js/ui.js                   # Controlador de interfaz y acceso a la API
├── server.js                  # API HTTP y archivos estáticos
├── src/
│   ├── models/                # Entidades y objeto de valor Desprendible
│   ├── services/              # Casos de uso de liquidación y gestión
│   └── validation/            # Validaciones reutilizables del dominio
└── test/
    ├── nomina.test.js         # Reglas de dominio, validación y servicios
    └── server.test.js         # Contrato HTTP y entrega de archivos estáticos
```

La interfaz depende de la API, la API delega en servicios y los servicios operan sobre objetos del dominio. Esto evita mezclar HTML, transporte HTTP y reglas salariales.

## Principios SOLID

| Principio | Aplicación |
| --- | --- |
| Responsabilidad única | Los subtipos contienen sus reglas salariales; `CalculadoraNomina` compone la liquidación; `GestorEmpleados` administra el conjunto; `server.js` adapta HTTP. |
| Abierto/cerrado | Un nuevo subtipo requiere registrarse en `EmpleadoFactory`, pero no obliga a modificar la calculadora ni el gestor mientras respete el contrato de comportamiento. |
| Sustitución de Liskov | Los subtipos conservan el contrato de cálculo, bonos, beneficios, deducciones y serialización esperado por la calculadora. |
| Segregación de interfaces | JavaScript no declara interfaces formales aquí; los colaboradores se validan mediante contratos pequeños de métodos usados realmente. |
| Inversión de dependencias | `GestorEmpleados` recibe la calculadora y el creador de empleados. `server.js` ensambla esas dependencias en el límite de composición. |

Estas decisiones mejoran el desacoplamiento, pero no pretenden demostrar una arquitectura SOLID perfecta. `EmpleadoFactory` todavía conoce los subtipos concretos y centraliza la traducción de entradas. Las validaciones comunes viven en `src/validation/validaciones.js`.

## Metodología de desarrollo

Se utiliza una metodología **iterativa e incremental**, adecuada para un trabajo académico colaborativo:

1. Convertir cada regla del enunciado en un criterio verificable y aclarar las ambigüedades.
2. Implementar una unidad vertical pequeña: dominio, límite HTTP o interfaz y prueba correspondiente.
3. Ejecutar pruebas y análisis sintáctico antes de integrar.
4. Refactorizar nombres, duplicaciones y responsabilidades sin cambiar el comportamiento probado.
5. Revisar el cambio en equipo y registrarlo en Git mediante commits convencionales y enfocados.

Las pruebas automatizadas cubren casos normales, umbrales estrictos, entradas inválidas y el contrato HTTP. Esta metodología describe el proceso recomendado y el aplicado en esta refactorización; no se afirma que cada contribución histórica haya seguido TDD. El historial de Git es la evidencia real del proceso del equipo.

## Pruebas y verificación

```bash
cd nomina-poo
npm test
node --check server.js
node --check js/ui.js
```

La suite valida los cuatro tipos de empleado, horas extras, bonos, beneficios no salariales, fondo voluntario, tasas configurables, fechas opcionales, duplicados, la prohibición de un neto negativo y los recorridos principales de la API. Los tests usan una tasa ARL explícita de fixture; no la presentan como regla del enunciado.

## Control de versiones del CIPA

Para conservar evidencia clara de colaboración:

- cada integrante debe trabajar en una rama propia;
- los commits deben representar una unidad funcional y usar mensajes convencionales, por ejemplo `feat(nomina): valida contratos temporales`;
- las pruebas del comportamiento deben viajar con el código que verifican;
- no se debe reescribir el historial compartido ni hacer `force push`;
- la integración debe hacerse mediante revisión del diff o pull request;
- los nombres de los integrantes y sus aportes deben tomarse del historial real, no agregarse de forma manual sin evidencia.

Comandos útiles:

```bash
git log --oneline --graph --decorate --all
git shortlog -sne --all
git diff main...mi-rama
git status
```

## Validación manual de la interfaz

1. Pulsa **Cargar ejemplos** y confirma que aparecen los cuatro tipos.
2. Agrega un empleado de cada tipo y revisa los campos dinámicos.
3. Intenta horas o ventas negativas y comprueba el mensaje accesible de error.
4. Verifica que alimentación figure como beneficio de empresa, separado del salario neto.
5. Pulsa **Vaciar lista** y confirma que el total vuelve a cero.
