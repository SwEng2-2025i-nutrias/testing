# Pruebas E2E de Chat - Comprador y Agricultor

Este proyecto contiene pruebas E2E para verificar el flujo completo de comunicación entre un comprador y un agricultor a través del sistema de chat.

## Prerrequisitos

1. **Frontend ejecutándose**: Asegúrate de que el frontend esté ejecutándose en `http://localhost:5173`
2. **Backend ejecutándose**: Los servicios de backend deben estar activos
3. **Datos de prueba**: Los siguientes usuarios deben existir en la base de datos:
   - Comprador: `comprador@gmail.com` / `12345678`
   - Agricultor: `agricultor1@gmail.com` / `12345678`
4. **Producto de prueba**: Debe existir un producto llamado "**Prueba 0**"

## Estructura de las Pruebas

### 🛒 Prueba del Comprador (`buyer-chat.cy.js`)
1. Login como comprador
2. Navegar a productos
3. Buscar el producto "Prueba 0"
4. Iniciar chat con el agricultor
5. Enviar mensaje: "Soy comprador probando chat desde test"
6. Esperar respuesta del agricultor

### 🚜 Prueba del Agricultor (`farmer-chat.cy.js`)
1. Login como agricultor
2. Navegar a mensajes
3. Revisar mensaje del comprador
4. Responder con: "Respuesta test de agricultor"

## Ejecución de las Pruebas

### Opción 1: Ejecución Manual (Recomendada para desarrollo)
```bash
# Terminal 1 - Comprador
npx cypress run --spec "cypress/e2e/buyer-chat.cy.js" --browser chrome

# Terminal 2 - Agricultor (ejecutar después de 5-10 segundos)
npx cypress run --spec "cypress/e2e/farmer-chat.cy.js" --browser edge
```


### Opción 3: Ejecución en Modo Interactivo
```bash
# Abrir Cypress en modo interactivo
npx cypress open

# Luego seleccionar manualmente el archivo de prueba en la interfaz
# O ejecutar todos los tests E2E
npx cypress open --e2e
```

## Logs

Los logs de ejecución se guardan en:
- `logs/buyer-test.log` - Log de la prueba del comprador
- `logs/farmer-test.log` - Log de la prueba del agricultor


### Debugging

Para depurar las pruebas:
```bash
# Ejecutar con modo debug
npx cypress run --spec "cypress/e2e/buyer-chat.cy.js" --headed --no-exit
npx cypress run --spec "cypress/e2e/farmer-chat.cy.js" --headed --no-exit

# Ejecutar en modo interactivo
npx cypress open
```

## 📊 Generación de Reportes PDF


### Generar reporte completo
```bash
# Ejecutar pruebas y generar PDF automáticamente
npm run test:complete
```

### Comandos individuales
```bash
# Solo ejecutar pruebas
npm run test:e2e

# Generar reporte HTML
npm run test:e2e:report  

# Convertir HTML a PDF
npm run generate:pdf
```

### 📋 Características del reporte PDF
- ✅ Logo de la Universidad Nacional de Colombia
- ✅ Header con información del semestre 2025-1
- ✅ Fecha de generación automática
- ✅ Resumen ejecutivo con estadísticas
- ✅ Detalles de cada prueba con tiempos
- ✅ Capturas de pantalla en errores
- ✅ Gráficos de éxito/fallo
- ✅ Numeración de páginas

**Archivo generado**: `cypress/reports/reporte-integracion-e2e-[fecha].pdf`



## Notas Importantes

- Las pruebas están diseñadas para ejecutarse en paralelo
- El agricultor debe ejecutarse después del comprador (1-2 segundos de retraso)
- Los navegadores diferentes (Chrome/Firefox) ayudan a simular usuarios reales
- Las pruebas limpian cookies y localStorage antes de ejecutarse
