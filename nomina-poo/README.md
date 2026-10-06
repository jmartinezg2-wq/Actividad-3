# Ejecutar la aplicación de nómina

La documentación completa sobre reglas, supuestos, arquitectura, metodología y SOLID está en [`../README.md`](../README.md).

## Verificación

```bash
npm test
node --check server.js
node --check js/ui.js
```

## Inicio

La actividad exige ARL, pero no define su tasa. Por eso el servidor no tiene un valor predeterminado: debe proporcionarse en escala decimal. Ejemplo de ejecución en PowerShell:

```powershell
$env:TASA_ARL='0.01'
npm start
```

El `0.01` del ejemplo es una configuración ilustrativa de 1%, no una regla de la actividad. No se requieren dependencias de terceros. Abre `http://localhost:3000` después de iniciar el servidor.

## Alcance probado

`node:test` cubre reglas de los cuatro tipos de empleado, validación numérica, deducciones sobre bonos salariales, fechas temporales opcionales, identificadores duplicados y la API HTTP. La alimentación empresarial se informa como compensación no salarial y no integra el neto ni la base de deducciones.
