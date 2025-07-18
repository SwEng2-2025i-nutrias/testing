describe('Buyer Chat Flow', () => {
  const buyerEmail = 'comprador@gmail.com';
  const buyerPassword = '12345678';
  const productName = 'Prueba 0';
  const buyerMessage = 'Soy comprador probando chat desde test';

  beforeEach(() => {
    // Verificar estado de backend antes de cada prueba
    cy.checkBackendHealth();
    
    // Limpiar sesión antes de cada prueba
    cy.clearCookies();
    cy.clearLocalStorage();
    cy.window().then((win) => {
      win.sessionStorage.clear();
    });
  });

  it('should allow a buyer to log in, find a product, and start a chat', () => {
    cy.log('🛒 Iniciando prueba del comprador');
    
    // Step 1: Login as buyer
    cy.loginAs(buyerEmail, buyerPassword);
    
    // Step 2: Verify redirection to products page and wait for it to load
    cy.url().should('include', '/products');
    cy.log('✅ Redirigido a página de productos');
    
    // Step 3: Wait for products to load completely
    cy.waitForProductsToLoad();
    cy.log('✅ Productos cargados completamente');
    
    // Step 4: Find the specific product
    cy.findProductByName(productName);
    cy.log('✅ Producto encontrado');
    
    // Step 5: Click chat button for the product
    cy.clickChatButtonForProduct(productName);
    cy.log('✅ Botón de chat clickeado');
    
    // Step 6: Verify redirect to messages page and wait for chat to load
    cy.url().should('include', '/messages', { timeout: 15000 });
    cy.get('body').should('contain', 'Chat', { timeout: 10000 });
    cy.log('✅ Interfaz de chat cargada');
    
    // Step 7: Send message and verify it appears
    cy.sendChatMessage(buyerMessage);
    cy.verifyMessageSent(buyerMessage);
    cy.log('✅ Mensaje enviado y verificado en el chat');
    
    // Step 8: Wait for the farmer's response
    cy.log('⏳ Esperando respuesta del agricultor...');
    cy.waitForMessage('Respuesta test de agricultor', 30000);
    cy.log('✅ Respuesta del agricultor recibida');
  });
});
