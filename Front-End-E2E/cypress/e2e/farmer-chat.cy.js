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
    
    // Seleccionar la conversación más reciente (primera en la lista)
    cy.get('body').should('contain', 'comprador', { timeout: 20000 });
    cy.contains('comprador').click();
    cy.log('✅ Conversación seleccionada');
    
    // Monitorear el incremento de mensajes y verificar que sea el mensaje del comprador
    cy.waitForMessageCountIncrease(buyerMessage, 30000);
    cy.log('✅ Mensaje del comprador detectado después del incremento');
    
    cy.sendChatMessage(farmerResponse);
    cy.verifyMessageSent(farmerResponse);
    cy.log('✅ Respuesta enviada y verificada');
  });
});
