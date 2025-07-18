describe('Buyer Chat Flow', () => {
  const buyerEmail = 'comprador@gmail.com'
  const buyerPassword = '12345678'
  const productName = 'Prueba 0'
  const buyerMessage = 'Soy comprador probando chat desde test'

  beforeEach(() => {
    // Verificar estado de backend antes de cada prueba
    cy.checkBackendHealth()
    
    // Clear any existing sessions
    cy.clearCookies()
    cy.clearLocalStorage()
    cy.window().then((win) => {
      win.sessionStorage.clear()
    })
  })

  it('should login as buyer and start chat with farmer', () => {
    cy.log('🛒 Iniciando prueba del comprador')
    
    // Step 1: Login as buyer
    cy.loginAs(buyerEmail, buyerPassword)
    
    // Step 2: Verify we're on products page and wait for it to load
    cy.url().should('include', '/products')
    cy.log('✅ Redirigido a página de productos')
    
    // Step 3: Wait for page to be fully loaded
    cy.waitForPageToLoad()
    cy.log('✅ Página completamente cargada')
    
    // Step 4: Wait for products to load completely
    cy.waitForProductsToLoad()
    cy.log('✅ Productos cargados completamente')
    
    // Debug: Capturar estado de la página
    cy.debugPageState('productos-cargados')
    
    // Step 5: Find the specific product
    cy.findProductByName(productName)
    cy.log('✅ Producto encontrado')
    
    // Step 6: Click chat button for the product
    cy.clickChatButtonForProduct(productName)
    cy.log('✅ Botón de chat clickeado')
    
    // Step 7: Verify redirect to messages page
    cy.url().should('include', '/messages', { timeout: 15000 })
    cy.log('✅ Redirigido a página de mensajes')
    
    // Step 8: Wait for chat interface to load
    cy.get('body').should('contain', 'Chat', { timeout: 10000 })
    cy.log('✅ Interfaz de chat cargada')
    
    // Step 9: Send message
    cy.sendChatMessage(buyerMessage)
    cy.log('✅ Mensaje enviado')
    
    // Step 10: Verify message appears in chat
    cy.verifyMessageSent(buyerMessage)
    cy.log('✅ Mensaje verificado en chat')
    
    // Step 11: Keep session active for farmer response
    cy.log('⏳ Esperando respuesta del agricultor...')
    cy.waitForMessage('Respuesta test de agricultor', 30000)
    cy.log('✅ Respuesta del agricultor recibida')
  })

  it('should maintain chat session and display farmer response', () => {
    cy.log('🔄 Verificando sesión de chat y respuesta del agricultor')
    
    // Login again to verify persistence
    cy.loginAs(buyerEmail, buyerPassword)
    cy.visit('/messages')
    
    // Verify both messages are visible
    cy.verifyMessageSent(buyerMessage)
    cy.waitForMessage('Respuesta test de agricultor')
    
    cy.log('✅ Historial completo de conversación verificado')
  })
})
