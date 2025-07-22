// Datos de prueba
const testUser = {
  name: 'Usuario de Prueba',
  phone: '3001234567',
  email: `test_user_${Date.now()}@email.com`,
  password: '12345678',
};

describe('Register Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/register');
  });

  // Validación de campos obligatorios: Nombre, Correo, Contraseña, Confirmar Contraseña
  it('shows required field messages', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Selecciona un rol').should('exist');
    cy.get('input[id="nombre"]').parents().contains('Este campo es obligatorio').should('exist');
    cy.get('input[id="email"]').parents().contains('Este campo es obligatorio').should('exist');
    cy.get('input[id="password"]').parents().contains('Este campo es obligatorio').should('exist');
    cy.get('input[id="password_confirm"]').parents().contains('Este campo es obligatorio').should('exist');
  });

  // Validación de formato de correo y contraseñas
  it('validates email and password formats', () => {
    cy.get('input[id="email"]').type('correo-invalido');
    cy.get('input[id="password"]').type('123');
    cy.get('input[id="password_confirm"]').type('321');
    cy.get('button[type="submit"]').click();
    cy.contains('El correo electrónico no es válido').should('exist');
    cy.contains('La contraseña debe tener al menos 8 caracteres').should('exist');
    cy.contains('Las contraseñas no coinciden').should('exist');
  });

  // Verifica que se muestran campos específicos según el rol seleccionado
  it('shows extra fields based on selected role', () => {
    cy.contains('label', 'Soy Agricultor').click();
    cy.contains('Información de Agricultor').should('exist');
    cy.contains('label', 'Soy Comprador').click();
    cy.contains('Información de Comprador').should('exist');
  });

  it('registers a new user as buyer', () => {
    cy.contains('Soy Comprador').click();
    cy.get('input[id="nombre"]').type(testUser.name);
    cy.get('input[id="telefono"]').type(testUser.phone);
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="password_confirm"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/login');
  });

  // Mensaje de error si el usuario ya existe
  it('validates already existing user', () => {
    cy.contains('Soy Comprador').click();
    cy.get('input[id="nombre"]').type(testUser.name);
    cy.get('input[id="telefono"]').type(testUser.phone);
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('input[id="password_confirm"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.contains('Este correo electrónico ya está en uso').should('exist');
  });
});

describe('Login Page', () => {
  beforeEach(() => {
    cy.viewport(1280, 800);
    cy.visit('/login');
  });

  // Mensaje de error si las credenciales son incorrectas
  it('validates wrong credentials', () => {
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type('123');
    cy.get('button[type="submit"]').click();
    cy.contains('Error').should('exist');
  });

  // Inicio y cierre de sesión exitosos usando menú de usuario
  it('logs in and out with valid credentials as buyer', () => {
    cy.get('input[id="email"]').type(testUser.email);
    cy.get('input[id="password"]').type(testUser.password);
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/products');

    cy.get('[data-testid="user-avatar"]').click();
    cy.contains('Cerrar Sesión', { timeout: 1000 }).should('be.visible').click();
    cy.url().should('include', '/');
  });
});