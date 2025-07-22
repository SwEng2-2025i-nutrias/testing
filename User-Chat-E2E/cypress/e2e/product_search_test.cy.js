describe('Product Search Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/products');
    cy.get('[data-testid="product-grid"]').should('exist');
    cy.shouldHaveProducts();
  });

  // Filtrado por nombre de producto, usando 'tomate' como ejemplo
  it('should filter products by name', () => {
    cy.get('input[placeholder*="Buscar"]').clear().type('tomate');
    cy.allProductCardsShould('.text-lg', el => el?.textContent?.toLowerCase().includes('tomate'));
  });

  // Filtrado por categoría, usando 'Frutas' como ejemplo
  it('should filter products by category', () => {
    cy.get('[data-testid="type-select-trigger"]').click();
    cy.get('[role="listbox"]').contains('Frutas').click();
    cy.allProductCardsShould('.badge', el => el?.textContent?.toLowerCase().includes('fruta'));
  });

  // Filtrado por precio, usando precio >= 5000
  it('should filter products by price', () => {
    // Ajusta el slider de precio manualmente
    cy.get('[data-testid="price-slider"] [role="slider"]').first().focus().type('{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}{rightarrow}');
    cy.allProductCardsShould('[data-testid="product-price"]', (el, min) => {
      if (!el) return false;
      const price = parseInt(el.textContent.replace(/[^\d]/g, ''));
      return price >= min;
    }, 5000);
  });

  // Filtrado por cantidad mínima, usando cantidad >= 70
  it('should filter products by minimum quantity', () => {
    cy.get('[data-testid="quantity-input"]').clear().type('70');
    cy.allProductCardsShould('[data-testid="product-quantity"]', (el, minQty) => {
      if (!el) return false;
      const match = el.textContent.match(/(\d+)/);
      const qty = match ? parseInt(match[1], 10) : NaN;
      return qty >= minQty;
    }, 70);
  });

  // // Filtrado por fecha de cosecha, usando una fecha de hace 30 días
  // it('should filter products by harvest date', () => {
  //   const testDateStr = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
  //   cy.get('[data-testid="date-input"]').clear().type(testDateStr);
  //   cy.allProductCardsShould('[data-testid="product-harvest-date"]', (el, minDateStr) => {
  //     if (!el) return false;
  //     const [day, month, year] = el.textContent.split('/').map(Number);
  //     const cardDate = new Date(year, month - 1, day);
  //     const minDate = new Date(minDateStr);
  //     return cardDate >= minDate;
  //   }, testDateStr);
  // });

  // Ordenamiento de productos
  function isSorted(arr, comparator) {
    for (let i = 1; i < arr.length; i++) {
      if (!comparator(arr[i - 1], arr[i])) return false;
    }
    return true;
  }

  it('should sort products by harvest date, availability, and price', () => {
    // Casos de prueba de ordenamiento
    const sortCases = [
      {
        listbox: 'Más Recientes',
        getValues: () => cy.get('[data-testid="product-card"] [data-testid="product-harvest-date"]').then($dates =>
          [...$dates].map(el => {
            const [day, month, year] = el.textContent.split('/').map(Number);
            return new Date(year, month - 1, day).getTime();
          })
        ),
        comparator: (a, b) => a >= b
      },
      {
        listbox: 'Mayor Disponibilidad',
        getValues: () => cy.get('[data-testid="product-card"] [data-testid="product-quantity"]').then($qtys =>
          [...$qtys].map(el => {
            const match = el.textContent.match(/(\d+)/);
            return match ? parseInt(match[1], 10) : 0;
          })
        ),
        comparator: (a, b) => a >= b
      },
      {
        listbox: 'Precio: Menor a Mayor',
        getValues: () => cy.get('[data-testid="product-card"] [data-testid="product-price"]').then($prices =>
          [...$prices].map(el => parseInt(el.textContent.replace(/[^\d]/g, '')))
        ),
        comparator: (a, b) => a <= b
      },
      {
        listbox: 'Precio: Mayor a Menor',
        getValues: () => cy.get('[data-testid="product-card"] [data-testid="product-price"]').then($prices =>
          [...$prices].map(el => parseInt(el.textContent.replace(/[^\d]/g, '')))
        ),
        comparator: (a, b) => a >= b
      },
    ];
    
    // Ordenamiento usando cada caso de prueba
    cy.get('[data-testid="product-card"]').should('have.length.greaterThan', 1);
    let first = true;
    for (const sortCase of sortCases) {
      if (!first) {
        cy.get('[data-testid="sort-select-trigger"]').click();
        cy.get('[role="listbox"]').contains(sortCase.listbox).click();
      }
      first = false;
      sortCase.getValues().then(values => {
        expect(isSorted(values, sortCase.comparator)).to.be.true;
      });
    }
  });
});