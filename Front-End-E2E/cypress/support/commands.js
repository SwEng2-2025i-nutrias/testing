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

// Health check only for ProductSearchService (the working one)
Cypress.Commands.add('checkBackendHealth', () => {
  cy.log('🏥 Verificando ProductSearchService...')
  
  // Solo ProductSearchService en puerto 5002 - EL QUE FUNCIONA
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
  cy.log(`✅ Verificando mensaje enviado: ${message}`);
  cy.get('[data-testid="chat-message"]').should('contain', message);
});

// Wait for new message to appear after sending one
Cypress.Commands.add('waitForNewMessage', (expectedMessage, timeout = 30000) => {
  cy.log(`⏳ Esperando nuevo mensaje: ${expectedMessage}`);
  cy.get('[data-testid="chat-message"]', { timeout })
    .should('have.length.greaterThan', 1)
    .last()
    .should('contain', expectedMessage);
  cy.log(`✅ Nuevo mensaje recibido: ${expectedMessage}`);
});

// Wait for message count to increase and verify content
Cypress.Commands.add('waitForMessageCountIncrease', (expectedMessage, timeout = 30000) => {
  cy.log(`⏳ Monitoreando incremento de mensajes para: ${expectedMessage}`);
  
  // Primero obtener el conteo inicial de mensajes
  let initialCount = 0;
  cy.get('body').then(() => {
    cy.get('[data-testid="chat-message"]').then(($messages) => {
      initialCount = $messages.length;
      cy.log(`📊 Conteo inicial de mensajes: ${initialCount}`);
      
      // Función recursiva para verificar el incremento
      const checkForNewMessage = (remainingTime) => {
        if (remainingTime <= 0) {
          throw new Error(`Timeout: No se detectó incremento de mensajes después de ${timeout}ms`);
        }
        
        cy.get('[data-testid="chat-message"]').then(($currentMessages) => {
          const currentCount = $currentMessages.length;
          
          if (currentCount > initialCount) {
            // Verificar que el último mensaje contiene el texto esperado
            cy.get('[data-testid="chat-message"]').last().should('contain', expectedMessage);
            cy.log(`✅ Nuevo mensaje detectado: ${expectedMessage} (conteo: ${initialCount} → ${currentCount})`);
          } else {
            // Continuar monitoreando
            cy.wait(1000);
            checkForNewMessage(remainingTime - 1000);
          }
        });
      };
      
      // Iniciar el monitoreo
      checkForNewMessage(timeout);
    });
  });
});




// ------------------------------------------- COMMANDS -------------------------------------------
// CHAT AND MESSAGING COMMANDS

// Comando optimizado para seleccionar la conversación más reciente en AgroConecta
Cypress.Commands.add('selectMostRecentConversation', (timeout = 1000) => {
  cy.log('🔍 Buscando conversaciones en la sidebar...');
  
  // Esperar a que la página esté completamente cargada
  cy.get('body', { timeout }).should('not.be.empty');
  
  // Esperar a que desaparezcan los indicadores de carga
  cy.get('body').should('not.contain', 'Cargando conversaciones...', { timeout: 5000 });
  
  // Estrategia 1: Buscar por la estructura específica del ConversationItem
  cy.get('body').then(($body) => {
    // Verificar si hay alguna conversación disponible
    const hasNoConversations = $body.text().includes('No hay conversaciones aún') || 
                              $body.text().includes('No se encontraron conversaciones');
    
    if (hasNoConversations) {
      cy.log('⚠️ No hay conversaciones disponibles para seleccionar');
      cy.fail('No hay conversaciones disponibles en la sidebar');
      return;
    }
    
    // Buscar elementos de conversación por estructura específica
    const conversationSelectors = [
      // Por clase CSS específica del ConversationItem (con cursor pointer)
      '.cursor-pointer:has(.w-8.h-8.bg-gray-200)', // Elemento con imagen de producto
      '.hover\\:bg-gray-100.cursor-pointer', // Clase hover específica
      
      // Por contenido de avatar y estructura
      'div:has(> .relative > .avatar)', // Div que contiene avatar
      'div:has(.w-3.h-3.bg-green-500)', // Div con indicador online
      
      // Por estructura de producto (imagen + nombre + precio)
      'div:has(.w-8.h-8.bg-gray-200.rounded.overflow-hidden)', // Contenedor con imagen de producto
      
      // Por badge de mensajes no leídos
      'div:has(.badge)', // Contenedor con badge
      
      // Por estructura completa del item
      '.flex.items-center.gap-3.p-4.hover\\:bg-gray-100.cursor-pointer'
    ];
    
    let conversationFound = false;
    
    for (let selector of conversationSelectors) {
      const elements = $body.find(selector);
      if (elements.length > 0) {
        cy.log(`✅ Encontradas ${elements.length} conversaciones con selector: ${selector}`);
        
        // Seleccionar la primera conversación (más reciente)
        cy.get(selector, { timeout: 2000 })
          .first()
          .should('be.visible')
          .click({ force: true });
        
        conversationFound = true;
        cy.log('✅ Primera conversación seleccionada');
        break;
      }
    }
    
    // Estrategia 2: Si no funciona con selectores, buscar por contenido
    if (!conversationFound) {
      cy.log('🔍 Intentando selección por contenido específico...');
      
      // Buscar elementos que contengan estructura de conversación
      cy.get('div').then(($divs) => {
        const conversationDivs = $divs.filter((index, div) => {
          const $div = Cypress.$(div);
          const text = $div.text();
          
          // Verificar si tiene características de ConversationItem
          const hasAvatar = $div.find('.avatar, [class*="avatar"]').length > 0;
          const hasProductImage = $div.find('.w-8.h-8, [class*="w-8"][class*="h-8"]').length > 0;
          const hasUserName = /[A-Za-z]+\s[A-Za-z]+/.test(text); // Patrón de nombre
          const hasPrice = /\$[\d,]+/.test(text); // Patrón de precio
          const isCursorPointer = $div.css('cursor') === 'pointer' || $div.hasClass('cursor-pointer');
          
          return (hasAvatar || hasProductImage) && hasUserName && isCursorPointer;
        });
        
        if (conversationDivs.length > 0) {
          cy.log(`✅ Encontradas ${conversationDivs.length} conversaciones por contenido`);
          cy.wrap(conversationDivs.first()).click({ force: true });
          conversationFound = true;
        }
      });
    }
    
    // Estrategia 3: Último recurso - buscar cualquier elemento clickeable en la sidebar
    if (!conversationFound) {
      cy.log('🎯 Último recurso: buscar elementos clickeables en sidebar...');
      
      // Buscar en la sidebar específicamente
      cy.get('.w-full.md\\:w-80, .border-r, .bg-gray-50').then(($sidebar) => {
        if ($sidebar.length > 0) {
          // Buscar elementos clickeables dentro de la sidebar
          const clickableElements = $sidebar.find('div').filter((index, el) => {
            const $el = Cypress.$(el);
            const hasClickableClasses = $el.hasClass('cursor-pointer') || 
                                      $el.hasClass('hover:bg-gray-100') ||
                                      $el.css('cursor') === 'pointer';
            const hasContent = $el.text().trim().length > 10;
            const isNotSearch = !$el.find('input[placeholder*="Buscar"]').length;
            
            return hasClickableClasses && hasContent && isNotSearch;
          });
          
          if (clickableElements.length > 0) {
            cy.log(`✅ Encontrados ${clickableElements.length} elementos clickeables en sidebar`);
            cy.wrap(clickableElements.first()).click({ force: true });
            conversationFound = true;
          }
        }
      });
    }
    
    if (!conversationFound) {
      cy.log('❌ No se pudo encontrar ninguna conversación para seleccionar');
      cy.fail('No se encontraron conversaciones clickeables en la interface');
    }
  });
  
  // Verificar que la conversación se seleccionó correctamente
  cy.wait(2000);
  
  // Verificar cambios en la UI que indican selección exitosa
  cy.get('body').should('satisfy', ($body) => {
    const text = $body.text();
    return text.includes('Escribe un mensaje') || 
           text.includes('chat') || 
           text.includes('conversación') ||
           $body.find('input[placeholder*="Escribe un mensaje"]').length > 0 ||
           $body.find('.bg-blue-50.border-r-2.border-blue-500').length > 0; // Item seleccionado
  }, { timeout: 5000 });
  
  cy.log('✅ Conversación seleccionada exitosamente');
});

// Comando de debug específico para el sistema de mensajería
Cypress.Commands.add('debugConversationState', (context = 'unknown') => {
  cy.log(`🔍 DEBUG CONVERSACIONES (${context})`);
  
  // URL actual
  cy.url().then(url => {
    cy.log(`📍 URL: ${url}`);
  });
  
  // Verificar estado de carga
  cy.get('body').then($body => {
    if ($body.text().includes('Cargando conversaciones')) {
      cy.log('⏳ Estado: Cargando conversaciones...');
    } else if ($body.text().includes('No hay conversaciones aún')) {
      cy.log('📭 Estado: Sin conversaciones');
    } else if ($body.text().includes('No se encontraron conversaciones')) {
      cy.log('🔍 Estado: Filtro activo sin resultados');
    } else {
      cy.log('✅ Estado: Conversaciones disponibles');
    }
  });
  
  // Contar elementos de conversación
  cy.get('body').then($body => {
    // Buscar elementos con estructura de ConversationItem
    const avatars = $body.find('.avatar, [class*="avatar"]').length;
    const cursorPointers = $body.find('.cursor-pointer').length;
    const productImages = $body.find('.w-8.h-8.bg-gray-200').length;
    
    cy.log(`👤 Avatares encontrados: ${avatars}`);
    cy.log(`👆 Elementos clickeables: ${cursorPointers}`);
    cy.log(`📦 Imágenes de producto: ${productImages}`);
  });
  
  // Usuario y token
  cy.window().then(win => {
    const token = win.localStorage.getItem('token') || win.sessionStorage.getItem('token');
    const userStr = win.localStorage.getItem('user') || win.sessionStorage.getItem('user');
    const user = userStr ? JSON.parse(userStr) : null;
    
    cy.log(`🔑 Token: ${token ? 'PRESENTE' : 'AUSENTE'}`);
    cy.log(`👤 Usuario: ${user?.name || user?.nombre || 'N/A'} (${user?.email || 'N/A'})`);
    cy.log(`🏷️ Rol: ${user?.role || 'N/A'}`);
  });
  
  // Tomar screenshot para análisis visual
  cy.screenshot(`debug-conversations-${context.toLowerCase().replace(/\s+/g, '-')}`);
  
  cy.wait(1000);
});

// ------------------------------------------- COMMANDS -------------------------------------------
// PRODUCT SEARCH SERVICE

// Comando para verificar que existen productos
Cypress.Commands.add('shouldHaveProducts', () => {
  cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0);
});

// Comando para validar que todos los product-card cumplen una condición sobre un selector
Cypress.Commands.add('allProductCardsShould', (selector, predicate, ...args) => {
  cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 0)
    .should($cards => {
      expect(
        $cards.toArray().every(card => predicate(card.querySelector(selector), ...args))
      ).to.be.true;
    });
});
