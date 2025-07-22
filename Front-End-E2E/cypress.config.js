const { defineConfig } = require("cypress");

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:5173',
    viewportWidth: 1280,
    viewportHeight: 720,
    video: false,
    screenshotOnRunFailure: true,
    defaultCommandTimeout: 20000,  // Aumentado de 10000 a 20000
    requestTimeout: 20000,         // Aumentado de 10000 a 20000
    responseTimeout: 20000,        // Aumentado de 10000 a 20000
    pageLoadTimeout: 30000,        // Nuevo timeout para carga de páginas
    chromeWebSecurity: false,      // Desactiva restricciones CORS
    // ⚠️ REMOVIDO: experimentalSessionAndOrigin (obsoleto en Cypress 12+)
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
  
  // Configuración de Mochawesome para generación de reportes
  reporter: 'mochawesome',
  reporterOptions: {
    reportDir: 'cypress/reports',
    overwrite: false,
    html: true,
    json: true,
    timestamp: 'mmddyyyy_HHMMss',
    reportFilename: '[status]_[datetime]_[name]',
    reportTitle: 'Reporte de Integración E2E - Sistema de Chat',
    reportPageTitle: 'Universidad Nacional de Colombia - Semestre 2025-1',
    embeddedScreenshots: true,
    inlineAssets: true,
    saveAllAttempts: false,
    charts: true,
    quiet: true  // Reduce verbose output
  },
  
  // Configuración para evitar ejecuciones múltiples
  retries: {
    runMode: 0,    // Sin reintentos en modo run
    openMode: 0    // Sin reintentos en modo open
  },
});
