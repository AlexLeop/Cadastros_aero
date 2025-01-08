describe('Authentication Flow', () => {
  beforeEach(() => {
    cy.resetDatabase();
  });

  it('should login successfully', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('admin@example.com');
    cy.get('input[name="password"]').type('password123');
    cy.get('button[type="submit"]').click();

    // Verificar redirecionamento para dashboard
    cy.url().should('eq', `${Cypress.config().baseUrl}/`);
    
    // Verificar elementos do dashboard
    cy.get('h5').should('contain', 'Dashboard');
  });

  it('should show error message for invalid credentials', () => {
    cy.visit('/login');
    
    cy.get('input[name="email"]').type('wrong@email.com');
    cy.get('input[name="password"]').type('wrongpass');
    cy.get('button[type="submit"]').click();

    cy.contains('Email ou senha inválidos').should('be.visible');
  });

  it('should logout successfully', () => {
    cy.login();
    cy.visit('/');
    
    // Abrir menu de usuário
    cy.get('button[aria-label="account settings"]').click();
    cy.contains('Sair').click();

    // Verificar redirecionamento para login
    cy.url().should('include', '/login');
  });
}); 