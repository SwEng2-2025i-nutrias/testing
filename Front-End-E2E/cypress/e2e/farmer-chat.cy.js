describe('Farmer Chat Response Flow', () => {
  const farmerEmail = 'agricultor1@gmail.com';
  const farmerPassword = '12345678';
  const buyerMessage = 'Soy comprador probando chat';
  const farmerResponse = 'Respuesta test de agricultor';

  beforeEach(() => {
    cy.checkBackendHealth();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should login as farmer, find the conversation, and respond', () => {
    cy.log('🚜 Iniciando prueba del agricultor');
    
    cy.loginAs(farmerEmail, farmerPassword);
    cy.url().should('include', '/farmer/products');
    
    cy.get('button').contains('Mensajes').click();
    cy.url().should('include', '/messages');
    
    // Debug del estado inicial de conversaciones
    cy.debugConversationState('despues-click-mensajes');
    
    // Esperar a que se carguen las conversaciones
    cy.wait(5000); // Aumentado el tiempo de espera
    cy.log('⏳ Esperando a que se carguen las conversaciones completamente...');
    
    // Debug del estado después de la carga
    cy.debugConversationState('despues-espera-carga');
    
    // Usar el comando optimizado para seleccionar conversación
    cy.selectMostRecentConversation(1000); // Timeout reducido a 1 segundo
    
    // Esperar a que aparezca el área de chat
    cy.wait(3000);
    cy.log('⏳ Esperando a que se cargue el chat completo...');
    
    // Verificar que estamos en una conversación activa
    cy.get('body').should('satisfy', ($body) => {
      const bodyText = $body.text();
      return bodyText.includes('mensaje') || 
             bodyText.includes('chat') || 
             bodyText.includes('conversación') ||
             $body.find('[data-testid="chat-message"]').length > 0 ||
             $body.find('input, textarea').length > 0;
    }, { timeout: 15000 });
    
    // Esperar incremento de mensajes del comprador (modo paralelo)
    cy.log('⏳ Esperando mensaje del comprador (incremento dinámico)...');
    cy.waitForMessageCountIncrease(buyerMessage, 30000);
    cy.log('✅ Mensaje del comprador detectado después del incremento');
    
    // Enviar respuesta del agricultor
    cy.sendChatMessage(farmerResponse);
    cy.verifyMessageSent(farmerResponse);
    cy.log('✅ Respuesta del agricultor enviada y verificada');
  });
});
