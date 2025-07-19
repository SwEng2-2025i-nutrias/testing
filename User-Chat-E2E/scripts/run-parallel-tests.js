const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runParallelTests() {
  console.log('🚀 Iniciando pruebas paralelas de chat E2E...');
  console.log('💡 Comprador iniciará conversación, agricultor responderá');
  
  // Limpiar reportes anteriores
  const reportsDir = path.join(__dirname, '../cypress/reports');
  if (fs.existsSync(reportsDir)) {
    console.log('🧹 Limpiando reportes anteriores...');
    fs.rmSync(reportsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(reportsDir, { recursive: true });
  
  // Determinar el comando correcto para Windows
  const isWindows = process.platform === 'win32';
  const cypressCmd = isWindows ? 'npx.cmd' : 'npx';
  
  return new Promise((resolve, reject) => {
    // Configurar el comprador (inicia inmediatamente)
    const buyerTest = spawn(cypressCmd, [
      'cypress', 'run', 
      '--spec', 'cypress/e2e/buyer-chat.cy.js',
      '--config', 'video=false'
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: isWindows
    });

    // Configurar el agricultor (inicia después de 2 segundos)
    let farmerTest;
    setTimeout(() => {
      console.log('🚜 Iniciando prueba del agricultor...');
      farmerTest = spawn(cypressCmd, [
        'cypress', 'run', 
        '--spec', 'cypress/e2e/farmer-chat.cy.js',
        '--config', 'video=false'
      ], {
        cwd: process.cwd(),
        stdio: 'pipe',
        shell: isWindows
      });

      farmerTest.stdout.on('data', (data) => {
        console.log(`🚜 AGRICULTOR: ${data.toString().trim()}`);
      });

      farmerTest.stderr.on('data', (data) => {
        console.error(`🚜 ERROR AGRICULTOR: ${data.toString().trim()}`);
      });

      farmerTest.on('close', (code) => {
        console.log(`🚜 Agricultor terminó con código: ${code}`);
      });
    }, 2000);

    buyerTest.stdout.on('data', (data) => {
      console.log(`🛒 COMPRADOR: ${data.toString().trim()}`);
    });

    buyerTest.stderr.on('data', (data) => {
      console.error(`🛒 ERROR COMPRADOR: ${data.toString().trim()}`);
    });

    buyerTest.on('close', (buyerCode) => {
      console.log(`🛒 Comprador terminó con código: ${buyerCode}`);
      
      // Esperar a que termine el agricultor también
      if (farmerTest) {
        farmerTest.on('close', (farmerCode) => {
          console.log('\n✅ Ambas pruebas completadas');
          console.log(`📊 Resultado Comprador: ${buyerCode === 0 ? 'EXITOSO' : 'FALLIDO'}`);
          console.log(`📊 Resultado Agricultor: ${farmerCode === 0 ? 'EXITOSO' : 'FALLIDO'}`);
          resolve({ buyerCode, farmerCode });
        });
      } else {
        // Si el comprador termina muy rápido, darle más tiempo al agricultor
        setTimeout(() => {
          resolve({ buyerCode, farmerCode: null });
        }, 15000);
      }
    });

    buyerTest.on('error', (error) => {
      console.error('❌ Error ejecutando prueba del comprador:', error);
      reject(error);
    });
  });
}

if (require.main === module) {
  runParallelTests()
    .then(result => {
      console.log('\n🎉 Proceso de pruebas paralelas completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en pruebas paralelas:', error);
      process.exit(1);
    });
}

module.exports = { runParallelTests };
