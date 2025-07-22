const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');

async function runSequentialTest(testName, specFile) {
  return new Promise((resolve, reject) => {
    console.log(`🚀 Iniciando ${testName}...`);
    
    const isWindows = process.platform === 'win32';
    const cypressCmd = isWindows ? 'npx.cmd' : 'npx';
    
    const testProcess = spawn(cypressCmd, [
      'cypress', 'run',
      '--spec', specFile,
      '--config', 'video=false',
      '--reporter', 'mochawesome',
      '--reporter-options', `reportDir=cypress/reports,reportFilename=${testName}-report,overwrite=false,html=false,json=true`
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: isWindows
    });

    testProcess.stdout.on('data', (data) => {
      console.log(`📊 ${testName.toUpperCase()}: ${data.toString().trim()}`);
    });

    testProcess.stderr.on('data', (data) => {
      console.error(`❌ ERROR ${testName.toUpperCase()}: ${data.toString().trim()}`);
    });

    testProcess.on('close', (code) => {
      console.log(`✅ ${testName} terminó con código: ${code}`);
      resolve(code);
    });

    testProcess.on('error', (error) => {
      console.error(`❌ Error ejecutando ${testName}:`, error);
      reject(error);
    });
  });
}

async function runParallelChatTests() {
  console.log('� Iniciando pruebas paralelas de chat (Comprador y Agricultor)...');
  console.log('💡 Comprador iniciará conversación, agricultor responderá');
  
  const isWindows = process.platform === 'win32';
  const cypressCmd = isWindows ? 'npx.cmd' : 'npx';
  
  return new Promise((resolve, reject) => {
    // Configurar el comprador (inicia inmediatamente)
    const buyerTest = spawn(cypressCmd, [
      'cypress', 'run', 
      '--spec', 'cypress/e2e/buyer-chat.cy.js',
      '--config', 'video=false',
      '--reporter', 'mochawesome',
      '--reporter-options', 'reportDir=cypress/reports,reportFilename=buyer-chat-report,overwrite=false,html=false,json=true'
    ], {
      cwd: process.cwd(),
      stdio: 'pipe',
      shell: isWindows
    });

    // Configurar el agricultor (inicia después de 3 segundos para mejor sincronización)
    let farmerTest;
    setTimeout(() => {
      console.log('🚜 Iniciando prueba del agricultor...');
      farmerTest = spawn(cypressCmd, [
        'cypress', 'run', 
        '--spec', 'cypress/e2e/farmer-chat.cy.js',
        '--config', 'video=false',
        '--reporter', 'mochawesome',
        '--reporter-options', 'reportDir=cypress/reports,reportFilename=farmer-chat-report,overwrite=false,html=false,json=true'
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
    }, 3000);

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
          console.log('\n✅ Ambas pruebas de chat completadas');
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

async function runAllTests() {
  console.log('🚀 Iniciando suite completa de pruebas E2E...');
  console.log('📋 Orden: 1) Auth Test → 2) Product Search → 3) Chat Tests (Buyer + Farmer)');
  
  // Limpiar reportes anteriores
  const reportsDir = path.join(__dirname, '../cypress/reports');
  if (fs.existsSync(reportsDir)) {
    console.log('🧹 Limpiando reportes anteriores...');
    fs.rmSync(reportsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(reportsDir, { recursive: true });

  const results = {};
  
  try {
    // 1. Ejecutar Auth Test
    console.log('\n📝 === FASE 1: AUTHENTICATION TESTS ===');
    results.authCode = await runSequentialTest('auth-test', 'cypress/e2e/auth_test.cy.js');
    
    // 2. Ejecutar Product Search Test
    console.log('\n🔍 === FASE 2: PRODUCT SEARCH TESTS ===');
    results.productSearchCode = await runSequentialTest('product-search-test', 'cypress/e2e/product_search_test.cy.js');
    
    // 3. Ejecutar Chat Tests en paralelo
    console.log('\n💬 === FASE 3: CHAT TESTS (PARALLEL) ===');
    const chatResults = await runParallelChatTests();
    results.buyerCode = chatResults.buyerCode;
    results.farmerCode = chatResults.farmerCode;
    
    // Resumen final
    console.log('\n🎉 === RESUMEN FINAL DE TODAS LAS PRUEBAS ===');
    console.log(`📝 Auth Test: ${results.authCode === 0 ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log(`🔍 Product Search: ${results.productSearchCode === 0 ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log(`🛒 Buyer Chat: ${results.buyerCode === 0 ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    console.log(`🚜 Farmer Chat: ${results.farmerCode === 0 ? '✅ EXITOSO' : '❌ FALLIDO'}`);
    
    return results;
    
  } catch (error) {
    console.error('❌ Error durante la ejecución de las pruebas:', error);
    throw error;
  }
}

async function runParallelTests() {
  // Mantener compatibilidad con el script anterior (solo chat tests)
  console.log('⚠️  Ejecutando solo tests de chat para compatibilidad...');
  console.log('💡 Para ejecutar todos los tests, usa: npm run test:all');
  
  // Limpiar reportes anteriores
  const reportsDir = path.join(__dirname, '../cypress/reports');
  if (fs.existsSync(reportsDir)) {
    console.log('🧹 Limpiando reportes anteriores...');
    fs.rmSync(reportsDir, { recursive: true, force: true });
  }
  fs.mkdirSync(reportsDir, { recursive: true });
  
  return await runParallelChatTests();
}

if (require.main === module) {
  // Verificar si se pasó el argumento 'all' para ejecutar todos los tests
  const runAllMode = process.argv.includes('--all') || process.argv.includes('all');
  
  const testFunction = runAllMode ? runAllTests : runParallelTests;
  const modeText = runAllMode ? 'COMPLETA (todos los tests)' : 'CHAT ÚNICAMENTE';
  
  console.log(`🎯 Modo de ejecución: ${modeText}`);
  
  testFunction()
    .then(result => {
      console.log('\n🎉 Proceso de pruebas completado');
      process.exit(0);
    })
    .catch(error => {
      console.error('❌ Error en pruebas:', error);
      process.exit(1);
    });
}

module.exports = { runParallelTests, runAllTests, runParallelChatTests };
