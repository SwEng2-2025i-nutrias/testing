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

### Opción 2: Ejecución Automática Paralela

#### Windows:
```cmd
run-parallel-tests.bat
```


### Opción 3: Ejecución en Modo Interactivo
```bash
# Abrir Cypress en modo interactivo
npx cypress open

# Luego seleccionar manualmente el archivo de prueba en la interfaz
# O ejecutar todos los tests E2E
npx cypress open --e2e
```

**Pasos para usar el modo interactivo:**
1. Ejecutar `npx cypress open`
2. Seleccionar "E2E Testing" 
3. Elegir el navegador (Chrome recomendado)
4. Seleccionar el archivo `buyer-chat.cy.js` de la lista
5. Ver la prueba ejecutarse en tiempo real

## Comandos Personalizados

Los siguientes comandos están disponibles en `cypress/support/commands.js`:

- `cy.loginAs(email, password)` - Realizar login con verificación
- `cy.sendChatMessage(message)` - Enviar mensaje en chat
- `cy.waitForMessage(text, timeout)` - Esperar a que aparezca un mensaje
- `cy.findProductByName(name)` - Buscar producto por nombre
- `cy.clickChatButtonForProduct(name)` - Hacer clic en botón de chat de un producto específico
- `cy.waitForProductsToLoad()` - Esperar a que los productos se carguen completamente
- `cy.waitForPageToLoad()` - Esperar a que la página esté completamente cargada
- `cy.verifyMessageSent(message)` - Verificar que un mensaje se envió correctamente
- `cy.debugPageState(label)` - Capturar screenshot y logs para debugging

## Configuración

La configuración principal está en `cypress.config.js`:
- **baseUrl**: `http://localhost:5173`
- **Timeouts**: 20 segundos por defecto (aumentado para mejor estabilidad)
- **Viewport**: 1280x720
- **Videos**: Deshabilitados
- **Screenshots**: Solo en fallos
- **Page Load Timeout**: 30 segundos

## Logs

Los logs de ejecución se guardan en:
- `logs/buyer-test.log` - Log de la prueba del comprador
- `logs/farmer-test.log` - Log de la prueba del agricultor

## Troubleshooting

### Problemas Comunes

1. **Elemento no encontrado**: Verifica que los selectores coincidan con los elementos de la UI
2. **Timeout en mensajes**: Asegúrate de que el WebSocket/polling esté funcionando
3. **Login fallido**: Verifica que los usuarios existan en la base de datos
4. **Producto no encontrado**: Confirma que el producto "Prueba 0" existe

### Debugging

Para depurar las pruebas:
```bash
# Ejecutar con modo debug
npx cypress run --spec "cypress/e2e/buyer-chat.cy.js" --headed --no-exit

# Ejecutar en modo interactivo
npx cypress open
```

## Notas Importantes

- Las pruebas están diseñadas para ejecutarse en paralelo
- El agricultor debe ejecutarse después del comprador (5-10 segundos de retraso)
- Los navegadores diferentes (Chrome/Firefox) ayudan a simular usuarios reales
- Las pruebas limpian cookies y localStorage antes de ejecutarse
