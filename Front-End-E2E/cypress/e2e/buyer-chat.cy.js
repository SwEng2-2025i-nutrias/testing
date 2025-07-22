describe('Buyer Chat Flow', () => {
  const buyerEmail = 'comprador@gmail.com';
  const buyerPassword = '12345678';
  const productName = 'Prueba 0';
  const buyerMessage = 'Soy comprador probando chat';

  beforeEach(() => {
    cy.checkBackendHealth();
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should allow a buyer to log in, find a product, and start a chat', () => {
    cy.log('🛒 Iniciando prueba del comprador');
    
    cy.loginAs(buyerEmail, buyerPassword);
    cy.url().should('include', '/products');
    cy.log('✅ Redirigido a página de productos');
    
    cy.waitForProductsToLoad();
    cy.findProductByName(productName);
    cy.clickChatButtonForProduct(productName);
    
    cy.url().should('include', '/messages', { timeout: 15000 });
    cy.get('body').should('contain', 'Chat', { timeout: 10000 });
    
    cy.sendChatMessage(buyerMessage);
    cy.verifyMessageSent(buyerMessage);
    cy.log('✅ Mensaje enviado y verificado en el chat');
    
    cy.log('⏳ Esperando respuesta del agricultor...');
    cy.waitForMessageCountIncrease('Respuesta test de agricultor', 30000);
    cy.log('✅ Respuesta del agricultor recibida');
  });
});
