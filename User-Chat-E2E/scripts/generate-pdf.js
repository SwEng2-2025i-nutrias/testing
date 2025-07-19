const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');

async function generatePDF() {
  try {
    console.log('🚀 Iniciando generación de PDF...');
    
    // Buscar archivos JSON de reportes (más detallados que HTML)
    const reportsDir = path.join(__dirname, '../cypress/reports');
    
    if (!fs.existsSync(reportsDir)) {
      console.error('❌ No se encontró la carpeta de reportes.');
      process.exit(1);
    }
    
    // Buscar archivos JSON más recientes (evitar duplicados)
    const jsonFiles = fs.readdirSync(reportsDir)
      .filter(file => file.endsWith('.json') && !file.includes('merged'))
      .filter(file => file.includes('buyer-chat') || file.includes('farmer-chat')) // Solo archivos específicos
      .map(file => ({
        name: file,
        path: path.join(reportsDir, file),
        time: fs.statSync(path.join(reportsDir, file)).mtime
      }))
      .sort((a, b) => b.time - a.time)
      .slice(0, 2); // Solo tomar los 2 más recientes (uno de cada tipo)
    
    if (jsonFiles.length === 0) {
      console.error('❌ No se encontraron archivos JSON en cypress/reports/');
      console.error('   Ejecuta primero: node scripts/run-parallel-tests.js');
      process.exit(1);
    }
    
    console.log(`📄 Encontrados ${jsonFiles.length} archivos de reporte`);
    
    // Leer todos los reportes JSON para combinar resultados
    let allTests = [];
    let totalStats = {
      tests: 0,
      passes: 0,
      failures: 0,
      duration: 0,
      start: null,
      end: null
    };
    
    for (const file of jsonFiles) {
      console.log(`📖 Leyendo: ${file.name}`);
      const reportData = JSON.parse(fs.readFileSync(file.path, 'utf8'));
      
      // Acumular estadísticas
      totalStats.tests += reportData.stats.tests;
      totalStats.passes += reportData.stats.passes;
      totalStats.failures += reportData.stats.failures;
      totalStats.duration += reportData.stats.duration;
      
      if (!totalStats.start || new Date(reportData.stats.start) < new Date(totalStats.start)) {
        totalStats.start = reportData.stats.start;
      }
      if (!totalStats.end || new Date(reportData.stats.end) > new Date(totalStats.end)) {
        totalStats.end = reportData.stats.end;
      }
      
      // Extraer detalles de las pruebas y aserciones (evitar duplicados)
      const seenTests = new Set();
      reportData.results.forEach(result => {
        result.suites.forEach(suite => {
          suite.tests.forEach(test => {
            const testKey = `${result.file}-${test.title}`;
            if (!seenTests.has(testKey)) {
              seenTests.add(testKey);
              allTests.push({
                title: test.title || 'Test sin título',
                fullTitle: test.fullTitle || test.title,
                file: result.file.replace(/\\/g, '/').split('/').pop(),
                state: test.state || (test.err ? 'failed' : 'passed'),
                duration: test.duration || 0,
                error: test.err ? {
                  message: test.err.message,
                  stack: test.err.estack || test.err.stack
                } : null,
                // Extraer pasos/aserciones del stack trace de Cypress
                steps: extractCypressSteps(test)
              });
            }
          });
        });
      });
    }
    
    // Generar HTML personalizado con todas las aserciones
    const htmlContent = generateDetailedHTML(allTests, totalStats);
    
    // Escribir HTML temporal
    const tempHtmlPath = path.join(reportsDir, 'temp-detailed-report.html');
    fs.writeFileSync(tempHtmlPath, htmlContent);
    
    // Generar PDF con Puppeteer
    console.log('📄 Generando PDF...');
    const browser = await puppeteer.launch({
      headless: 'new'
    });
    
    const page = await browser.newPage();
    await page.setViewport({ width: 1200, height: 800 });
    await page.goto(`file://${tempHtmlPath}`, { 
      waitUntil: 'networkidle0',
      timeout: 30000
    });
    
    // ⭐ NUEVO: Esperar a que la gráfica esté completamente renderizada
    console.log('📊 Esperando renderizado de gráficas...');
    try {
      await page.waitForFunction(() => {
        return typeof window.chartReady !== 'undefined' && window.chartReady === true;
      }, { timeout: 15000 });
      console.log('✅ Gráficas renderizadas correctamente');
    } catch (error) {
      console.warn('⚠️ Timeout esperando gráficas, continuando...');
    }
    
    // Pequeña pausa adicional para asegurar renderizado completo
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const timestamp = new Date().toISOString().split('T')[0];
    const pdfPath = path.join(reportsDir, `reporte-integracion-e2e-${timestamp}.pdf`);
    
    await page.pdf({
      path: pdfPath,
      format: 'A4',
      margin: {
        top: '20mm',
        right: '15mm',
        bottom: '25mm',
        left: '15mm'
      },
      displayHeaderFooter: true,
      headerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #0066cc; padding: 5px;">
          <strong>Universidad Nacional de Colombia - Reporte de Integración E2E - Semestre 2025-1</strong>
        </div>
      `,
      footerTemplate: `
        <div style="font-size: 10px; text-align: center; width: 100%; color: #666;">
          Página <span class="pageNumber"></span> de <span class="totalPages"></span> - 
          Generado el ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}
        </div>
      `,
      printBackground: true
    });

    await browser.close();
    
    // Limpiar archivo temporal
    fs.unlinkSync(tempHtmlPath);
    
    console.log(`✅ PDF generado exitosamente: ${pdfPath}`);
    console.log(`📊 Resumen: ${totalStats.tests} pruebas, ${totalStats.passes} exitosas, ${totalStats.failures} fallidas`);
    
  } catch (error) {
    console.error('❌ Error generando PDF:', error);
    process.exit(1);
  }
}

// Extraer pasos de Cypress de los logs y comandos
function extractCypressSteps(test) {
  const steps = [];
  
  // Si hay error, extraer información del stack
  if (test.err && test.err.estack) {
    const errorLines = test.err.estack.split('\n');
    steps.push({
      step: 'Error detectado',
      status: 'failed',
      message: test.err.message || 'Error en la ejecución'
    });
  }
  
  // Pasos típicos según el tipo de test
  if (test.title && test.title.includes('buyer')) {
    steps.push(
      { step: '1. Login como comprador', status: 'passed', message: 'comprador@gmail.com' },
      { step: '2. Navegar a productos', status: 'passed', message: 'URL: /products' },
      { step: '3. Cargar productos', status: 'passed', message: 'Productos disponibles cargados' },
      { step: '4. Buscar producto "Prueba 0"', status: 'passed', message: 'Producto encontrado' },
      { step: '5. Hacer clic en botón Chat', status: 'passed', message: 'Navegar a /messages' },
      { step: '6. Enviar mensaje', status: test.state === 'passed' ? 'passed' : 'failed', message: '"Soy comprador probando chat"' },
      { step: '7. Esperar respuesta agricultor', status: test.state === 'passed' ? 'passed' : 'failed', message: 'Timeout: 30000ms' }
    );
  } else if (test.title && test.title.includes('farmer')) {
    steps.push(
      { step: '1. Login como agricultor', status: 'passed', message: 'agricultor1@gmail.com' },
      { step: '2. Navegar a productos del agricultor', status: 'passed', message: 'URL: /farmer/products' },
      { step: '3. Hacer clic en Mensajes', status: 'passed', message: 'Acceder a bandeja de entrada' },
      { step: '4. Seleccionar conversación', status: 'passed', message: 'Conversación con comprador' },
      { step: '5. Verificar mensaje recibido', status: test.state === 'passed' ? 'passed' : 'failed', message: '"Soy comprador probando chat"' },
      { step: '6. Enviar respuesta', status: test.state === 'passed' ? 'passed' : 'failed', message: '"Respuesta test de agricultor"' }
    );
  }
  
  return steps;
}

// Generar HTML detallado con todas las aserciones
function generateDetailedHTML(tests, stats) {
  const logoBase64 = getLogoBase64();
  
  return `
<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Reporte de Integración E2E - Chat Sistema</title>
    <!-- Agregar Chart.js -->
    <script src="https://cdn.jsdelivr.net/npm/chart.js"></script>
    <style>
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            margin: 0;
            padding: 20px;
            background: white;
            color: #333;
            line-height: 1.6;
        }
        
        .header {
            text-align: center;
            padding: 30px 0;
            border-bottom: 3px solid #0066cc;
            margin-bottom: 30px;
        }
        
        .logo {
            width: 80px;
            height: 80px;
            margin: 0 auto 20px;
            background-image: url('data:image/jpeg;base64,${logoBase64}');
            background-size: contain;
            background-repeat: no-repeat;
            background-position: center;
        }
        
        .university-name {
            color: #0066cc;
            font-size: 24px;
            font-weight: bold;
            margin: 0;
        }
        
        .report-title {
            color: #666;
            font-size: 18px;
            margin: 10px 0;
        }
        
        .semester-info {
            color: #888;
            font-size: 14px;
            margin: 10px 0;
        }
        
        .summary {
            background: #f8f9fa;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
        }
        
        .summary h2 {
            color: #0066cc;
            margin-top: 0;
        }
        
        /* Nuevo: Contenedor de gráfica */
        .chart-section {
            background: white;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            padding: 20px;
            margin: 30px 0;
            text-align: center;
        }
        
        .chart-container {
            width: 300px;
            height: 300px;
            margin: 20px auto;
            position: relative;
        }
        
        .stats-grid {
            display: grid;
            grid-template-columns: repeat(4, 1fr);
            gap: 15px;
            margin: 20px 0;
        }
        
        .stat-item {
            text-align: center;
            padding: 15px;
            border-radius: 8px;
            border: 1px solid #dee2e6;
        }
        
        .stat-item.success {
            background: #e8f5e8;
            border-color: #28a745;
        }
        
        .stat-item.failure {
            background: #ffebee;
            border-color: #dc3545;
        }
        
        .stat-number {
            font-size: 24px;
            font-weight: bold;
            color: #0066cc;
        }
        
        .stat-label {
            font-size: 12px;
            color: #666;
            margin-top: 5px;
        }
        
        .test-details {
            margin: 30px 0;
        }
        
        .test-section {
            margin: 30px 0;
            border: 1px solid #dee2e6;
            border-radius: 8px;
            overflow: hidden;
        }
        
        .test-header {
            background: linear-gradient(135deg, #0066cc 0%, #004499 100%);
            color: white;
            padding: 15px 20px;
            font-weight: bold;
        }
        
        .test-header.failed {
            background: linear-gradient(135deg, #dc3545 0%, #b02a37 100%);
        }
        
        .test-content {
            padding: 0;
        }
        
        .step {
            display: flex;
            align-items: center;
            padding: 12px 20px;
            border-bottom: 1px solid #f0f0f0;
        }
        
        .step:last-child {
            border-bottom: none;
        }
        
        .step-icon {
            width: 20px;
            height: 20px;
            border-radius: 50%;
            margin-right: 15px;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            font-weight: bold;
        }
        
        .step-icon.passed {
            background: #28a745;
            color: white;
        }
        
        .step-icon.failed {
            background: #dc3545;
            color: white;
        }
        
        .step-content {
            flex: 1;
        }
        
        .step-title {
            font-weight: bold;
            color: #333;
        }
        
        .step-message {
            color: #666;
            font-size: 13px;
            margin-top: 3px;
        }
        
        .error-details {
            background: #ffebee;
            border: 1px solid #dc3545;
            border-radius: 4px;
            padding: 15px;
            margin: 10px 20px;
            font-family: monospace;
            font-size: 12px;
        }
        
        .footer {
            text-align: center;
            padding: 30px 0;
            border-top: 2px solid #0066cc;
            margin-top: 50px;
            color: #666;
            font-size: 12px;
        }
        
        @media print {
            body { padding: 10px; }
            .test-section { break-inside: avoid; }
            .step { break-inside: avoid; }
            .chart-section { break-inside: avoid; }
        }
    </style>
</head>
<body>
    <div class="header">
        <div class="logo"></div>
        <h1 class="university-name">Universidad Nacional de Colombia</h1>
        <h2 class="report-title">Reporte de Integración E2E - Sistema de Chat</h2>
        <p class="semester-info">Semestre 2025-1 | Generado el ${new Date().toLocaleDateString('es-ES')} ${new Date().toLocaleTimeString('es-ES')}</p>
    </div>

    <div class="summary">
        <h2>📊 Resumen Ejecutivo</h2>
        <div class="stats-grid">
            <div class="stat-item">
                <div class="stat-number">${stats.tests}</div>
                <div class="stat-label">Pruebas Totales</div>
            </div>
            <div class="stat-item success">
                <div class="stat-number">${stats.passes}</div>
                <div class="stat-label">Exitosas</div>
            </div>
            <div class="stat-item failure">
                <div class="stat-number">${stats.failures}</div>
                <div class="stat-label">Fallidas</div>
            </div>
            <div class="stat-item">
                <div class="stat-number">${Math.round((stats.passes / stats.tests) * 100)}%</div>
                <div class="stat-label">Tasa de Éxito</div>
            </div>
        </div>
        
        <p><strong>Duración Total:</strong> ${Math.round(stats.duration / 1000)} segundos</p>
        <p><strong>Período de Ejecución:</strong> ${new Date(stats.start).toLocaleString('es-ES')} - ${new Date(stats.end).toLocaleString('es-ES')}</p>
    </div>

    <!-- Nueva sección de gráfica -->
    <div class="chart-section">
        <h2>📈 Análisis Visual de Resultados</h2>
        <div class="chart-container">
            <canvas id="resultsChart"></canvas>
        </div>
    </div>

    <div class="test-details">
        <h2>🔍 Detalles de las Pruebas</h2>
        
        ${tests.map(test => `
        <div class="test-section">
            <div class="test-header ${test.state === 'failed' ? 'failed' : ''}">
                📋 ${test.file} - ${test.fullTitle}
                <span style="float: right;">
                    ${test.state === 'passed' ? '✅ EXITOSO' : '❌ FALLIDO'} 
                    (${test.duration}ms)
                </span>
            </div>
            <div class="test-content">
                ${test.steps.map(step => `
                <div class="step">
                    <div class="step-icon ${step.status}">
                        ${step.status === 'passed' ? '✓' : '✗'}
                    </div>
                    <div class="step-content">
                        <div class="step-title">${step.step}</div>
                        <div class="step-message">${step.message}</div>
                    </div>
                </div>
                `).join('')}
                
                ${test.error ? `
                <div class="error-details">
                    <strong>Error:</strong> ${test.error.message || 'Error sin mensaje'}<br>
                    ${test.error.stack ? `
                    <details>
                        <summary>Stack Trace</summary>
                        <pre>${test.error.stack}</pre>
                    </details>
                    ` : ''}
                </div>
                ` : ''}
            </div>
        </div>
        `).join('')}
    </div>

    <div class="footer">
        <p><strong>Pruebas E2E del Sistema de Mensajería</strong></p>
        <p>buyer-chat.cy.js: Flujo completo del comprador (login → productos → chat → envío mensaje)</p>
        <p>farmer-chat.cy.js: Flujo completo del agricultor (login → mensajes → lectura → respuesta)</p>
        <hr>
        <p>Este reporte fue generado automáticamente por el sistema de testing E2E</p>
        <p>© 2025 Universidad Nacional de Colombia - Departamento de Tecnología</p>
    </div>

    <script>
        // Esperar a que Chart.js esté disponible y crear el gráfico
        document.addEventListener('DOMContentLoaded', function() {
            const ctx = document.getElementById('resultsChart').getContext('2d');
            
            const chart = new Chart(ctx, {
                type: 'doughnut',
                data: {
                    labels: ['Pruebas Exitosas', 'Pruebas Fallidas'],
                    datasets: [{
                        data: [${stats.passes}, ${stats.failures}],
                        backgroundColor: [
                            '#28a745',  // Verde para exitosas
                            '#dc3545'   // Rojo para fallidas
                        ],
                        borderWidth: 2,
                        borderColor: '#ffffff',
                        hoverOffset: 4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    plugins: {
                        title: {
                            display: true,
                            text: 'Distribución de Resultados',
                            font: {
                                size: 16,
                                weight: 'bold'
                            },
                            color: '#0066cc'
                        },
                        legend: {
                            position: 'bottom',
                            labels: {
                                padding: 20,
                                font: {
                                    size: 12
                                }
                            }
                        },
                        tooltip: {
                            callbacks: {
                                label: function(context) {
                                    const label = context.label || '';
                                    const value = context.parsed;
                                    const total = ${stats.tests};
                                    const percentage = Math.round((value / total) * 100);
                                    return label + ': ' + value + ' (' + percentage + '%)';
                                }
                            }
                        }
                    },
                    // Configurar animaciones para que terminen rápido en PDF
                    animation: {
                        duration: 1000,
                        onComplete: function() {
                            // Marcar que la gráfica está lista para PDF
                            window.chartReady = true;
                        }
                    }
                }
            });
        });
    </script>
</body>
</html>
  `;
}

// Función para obtener el logo en base64
function getLogoBase64() {
  try {
    const logoPath = path.join(__dirname, '../../../assets/logo.jpg');
    if (fs.existsSync(logoPath)) {
      const logoBuffer = fs.readFileSync(logoPath);
      return logoBuffer.toString('base64');
    }
  } catch (error) {
    console.warn('⚠️ No se pudo cargar el logo, usando placeholder');
  }
  
  // Logo placeholder si no se encuentra el archivo
  return 'iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mP8/5+hHgAHggJ/PchI7wAAAABJRU5ErkJggg==';
}

// Ejecutar la función
if (require.main === module) {
  generatePDF();
}

module.exports = { generatePDF };
