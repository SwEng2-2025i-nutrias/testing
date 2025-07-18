// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// Login command
Cypress.Commands.add('loginAs', (email, password) => {
  cy.visit('/login');
  cy.get('input[type="email"]').type(email, { log: false });
  cy.get('input[type="password"]').type(password, { log: false });
  cy.get('button[type="submit"]').click();

  // Esperar a que la URL cambie, lo que indica que el login fue exitoso
  cy.url().should('not.include', '/login', { timeout: 15000 });
  cy.log(`✅ Login completado para ${email}`);
});

// Health check for all backend services
Cypress.Commands.add('checkBackendHealth', () => {
  cy.log('🏥 Verificando salud de todos los servicios backend...')
  
  // AuthenticationService en puerto 5001
  cy.request({
    method: 'GET',
    url: 'http://127.0.0.1:5001/health',
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ AuthenticationService (5001) está activo')
    } else {
      cy.log(`⚠️ AuthenticationService (5001) respondió con status: ${response.status}`)
    }
  })

  // ProductService en puerto 5000
  cy.request({
    method: 'GET',
    url: 'http://127.0.0.1:5000/health',
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ ProductService (5000) está activo')
    } else {
      cy.log(`⚠️ ProductService (5000) respondió con status: ${response.status}`)
    }
  })

  // ProductSearchService en puerto 5002 - EL PROBLEMÁTICO
  cy.request({
    method: 'GET',
    url: 'http://127.0.0.1:5002/health',
    failOnStatusCode: false,
    timeout: 10000
  }).then((response) => {
    if (response.status === 200) {
      cy.log('✅ ProductSearchService (5002) está activo')
    } else {
      cy.log(`❌ ProductSearchService (5002) FALLÓ con status: ${response.status}`)
    }
  })
})

// Wait for message to appear in chat
Cypress.Commands.add('waitForMessage', (messageText, timeout = 10000) => {
  cy.contains(messageText, { timeout })
})

// Wait for page to be fully loaded
Cypress.Commands.add('waitForPageToLoad', () => {
  cy.log('⏳ Esperando a que la página se cargue completamente...')
  
  // Esperar a que la página no tenga indicadores de carga
  cy.get('body').should('not.contain', 'Cargando...', { timeout: 30000 })
  cy.get('body').should('not.contain', 'Loading...', { timeout: 30000 })
  
  // Esperar a que no haya spinners de carga
  cy.get('.loading, .spinner, [data-testid="loading"]').should('not.exist', { timeout: 30000 })
  
  // Esperar a que el documento esté listo
  cy.document().should('have.property', 'readyState', 'complete')
  
  cy.log('✅ Página completamente cargada')
})

// Wait for products to load
Cypress.Commands.add('waitForProductsToLoad', () => {
  cy.log('⏳ Esperando a que los productos se carguen...')
  
  // Esperar más tiempo para que la página se estabilice después del login
  cy.wait(3000)
  
  // Esperar a que desaparezca cualquier indicador de carga
  cy.get('body').should('not.contain', 'Cargando', { timeout: 30000 })
  cy.get('body').should('not.contain', 'Loading', { timeout: 30000 })
  
  // Esperar a que aparezca el texto de productos encontrados O que aparezcan productos
  cy.get('body').then(($body) => {
    if ($body.text().includes('productos encontrados')) {
      cy.log('✅ Productos cargados - se muestra contador')
    } else {
      cy.log('⏳ Esperando productos...')
      // Esperar hasta 45 segundos para que aparezcan productos
      cy.get('[data-testid="product-card"]', { timeout: 45000 }).should('have.length.greaterThan', 0)
    }
  })
  
  // Verificación final: asegurar que hay productos visibles
  cy.get('[data-testid="product-card"]', { timeout: 30000 }).should('have.length.greaterThan', 0)
  
  cy.log('✅ Productos completamente cargados')
})

// Find product by name using data-testid
Cypress.Commands.add('findProductByName', (productName) => {
  cy.log(`🔍 Buscando producto: ${productName}`)
  
  // Asegurar que hay productos antes de buscar
  cy.get('[data-testid="product-card"]', { timeout: 30000 }).should('have.length.greaterThan', 0)
  
  // Buscar el producto específico con timeout más largo
  cy.get('[data-testid="product-card"]', { timeout: 30000 })
    .contains(productName)
    .should('be.visible')
    
  cy.log(`✅ Producto "${productName}" encontrado`)
})

// Click chat button for a specific product
Cypress.Commands.add('clickChatButtonForProduct', (productName) => {
  cy.log(`💬 Iniciando chat para producto: ${productName}`)
  
  // Buscar la tarjeta del producto específico y hacer clic en el botón de chat
  cy.get('[data-testid="product-card"]')
    .contains(productName)
    .parents('[data-testid="product-card"]')
    .within(() => {
      cy.get('[data-testid="chat-button"]').click()
    })
})

// Send message in chat
Cypress.Commands.add('sendChatMessage', (message) => {
  cy.log(`💬 Enviando mensaje: ${message}`);
  
  // Esperar a que el chat esté listo
  cy.get('body').should('contain', 'Chat', { timeout: 10000 });
  
  // Usar data-testid para encontrar el input y el botón de enviar
  cy.get('input[placeholder*="Escribe un mensaje..."]').type(message);
  cy.get('[data-testid="send-button"]').click();
});

// Debug command to capture page state
Cypress.Commands.add('debugPageState', (label) => {
  cy.log(`🐛 DEBUG: ${label}`)
  
  // Capturar screenshot
  cy.screenshot(`debug-${label.toLowerCase().replace(/\s+/g, '-')}`)
  
  // Log URL actual
  cy.url().then((url) => {
    cy.log(`📍 URL actual: ${url}`)
  })
  
  // Log contenido del localStorage
  cy.window().then((win) => {
    const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token')
    cy.log(`🔑 Token presente: ${token ? 'SÍ' : 'NO'}`)
  })
  
  // Log si hay productos visibles
  cy.get('body').then(($body) => {
    if ($body.find('[data-testid="product-card"]').length > 0) {
      cy.log(`📦 Productos encontrados: ${$body.find('[data-testid="product-card"]').length}`)
    } else {
      cy.log('❌ No se encontraron productos')
      cy.log(`📄 Contenido de la página: ${$body.text().substring(0, 200)}...`)
    }
  })
})

// Verify message was sent
Cypress.Commands.add('verifyMessageSent', (message) => {
  cy.log(`✅ Verificando mensaje enviado: ${message}`)
  
  // Esperar a que el mensaje aparezca en el chat
  cy.get('body').should('contain', message, { timeout: 15000 })
  
  // Verificar que el mensaje está visible
  cy.get('.message, .chat-message, [data-testid="chat-message"]')
    .contains(message)
    .should('be.visible')
})