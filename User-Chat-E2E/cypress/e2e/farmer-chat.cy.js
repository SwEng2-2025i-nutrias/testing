describe('Farmer Chat Response Flow', () => {
  const farmerEmail = 'agricultor1@gmail.com'
  const farmerPassword = '12345678'
  const buyerMessage = 'Soy comprador probando chat desde test'
  const farmerResponse = 'Respuesta test de agricultor'

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

  it('should login as farmer and respond to buyer message', () => {
    cy.log('🚜 Iniciando prueba del agricultor')
    
    // Step 1: Login as farmer
    cy.loginAs(farmerEmail, farmerPassword)
    
    // Step 2: Verify redirect to farmer products page
    cy.url().should('include', '/farmer/products')
    cy.log('✅ Redirigido a página de productos del agricultor')
    
    // Step 3: Click on Messages tab in DashboardTabs
    cy.get('button').contains('Mensajes').click()
    cy.log('✅ Navegado a mensajes')
    
    // Step 4: Verify redirect to messages page
    cy.url().should('include', '/messages')
    cy.log('✅ En página de mensajes')
    
    // Step 5: Wait for messages to load
    cy.get('body').should('contain', 'Chat', { timeout: 15000 })
    cy.log('✅ Mensajes cargados')
    
    // Step 6: Look for the buyer message
    cy.waitForMessage(buyerMessage, 20000)
    cy.log('✅ Mensaje del comprador encontrado')
    
    // Step 7: Click on the chat/conversation with the buyer message
    cy.get('body').then(($body) => {
      if ($body.find('[data-testid="chat-list"]').length > 0) {
        // Si hay una lista de chats, buscar el mensaje específico
        cy.get('[data-testid="chat-list"]')
          .contains(buyerMessage)
          .click()
      } else {
        // Si no hay lista, buscar el mensaje directamente
        cy.contains(buyerMessage).click()
      }
    })
    cy.log('✅ Conversación seleccionada')
    
    // Step 8: Verify buyer message is visible in chat
    cy.verifyMessageSent(buyerMessage)
    cy.log('✅ Mensaje del comprador visible en chat')
    
    // Step 9: Send response message
    cy.sendChatMessage(farmerResponse)
    cy.log('✅ Respuesta enviada')
    
    // Step 10: Verify response message appears in chat
    cy.verifyMessageSent(farmerResponse)
    cy.log('✅ Respuesta verificada en chat')
  })

  it('should verify message history contains both messages', () => {
    cy.log('🔍 Verificando historial completo de mensajes')
    
    // Login and go to messages
    cy.loginAs(farmerEmail, farmerPassword)
    cy.visit('/messages')
    
    // Find and click on the conversation if needed
    cy.get('body').then(($body) => {
      if ($body.text().includes(buyerMessage)) {
        cy.contains(buyerMessage).click()
      }
    })
    
    // Verify both messages are visible in the conversation
    cy.waitForMessage(buyerMessage)
    cy.waitForMessage(farmerResponse)
    
    cy.log('✅ Historial completo verificado')
  })
})
