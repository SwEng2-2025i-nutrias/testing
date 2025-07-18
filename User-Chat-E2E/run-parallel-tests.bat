@echo off
echo 🚀 Iniciando pruebas E2E de chat...
echo 📋 Asegúrate de que el frontend esté ejecutándose en http://localhost:5173
echo.

REM Crear directorio de logs si no existe
if not exist "logs" mkdir logs

echo 🛒 Iniciando prueba del comprador en Chrome...
start /b cmd /c "npx cypress run --spec cypress/e2e/buyer-chat.cy.js --browser chrome > logs/buyer-test.log 2>&1"

echo 🚜 Esperando 5 segundos antes de iniciar prueba del agricultor...
timeout /t 5 /nobreak > nul

echo 🚜 Iniciando prueba del agricultor en Firefox...
start /b cmd /c "npx cypress run --spec cypress/e2e/farmer-chat.cy.js --browser firefox > logs/farmer-test.log 2>&1"

echo.
echo ⏳ Esperando a que terminen ambas pruebas...
echo 📝 Puedes revisar los logs en tiempo real en:
echo    - logs/buyer-test.log
echo    - logs/farmer-test.log
echo.
echo 💡 Presiona Ctrl+C para cancelar las pruebas
echo.

REM Esperar a que el usuario presione una tecla
pause
