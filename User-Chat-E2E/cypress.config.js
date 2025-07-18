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
    experimentalSessionAndOrigin: true,
    
    setupNodeEvents(on, config) {
      // implement node event listeners here
    },
  },
});
