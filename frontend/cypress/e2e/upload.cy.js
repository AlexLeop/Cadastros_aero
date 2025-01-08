describe('Upload Flow', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.login();
  });

  it('should upload file successfully', () => {
    cy.visit('/upload');

    // Upload do arquivo
    cy.get('input[type="file"]').attachFile('test.csv');

    // Verificar progresso
    cy.get('[role="progressbar"]').should('exist');
    
    // Verificar sucesso
    cy.contains('Upload concluído').should('exist');
    cy.get('[data-testid="CheckIcon"]').should('exist');
  });

  it('should show error for invalid file type', () => {
    cy.visit('/upload');

    // Upload de arquivo inválido
    cy.get('input[type="file"]').attachFile('test.txt');

    // Verificar mensagem de erro
    cy.contains('Tipo de arquivo não suportado').should('exist');
  });

  it('should process uploaded file', () => {
    cy.visit('/upload');

    // Upload do arquivo
    cy.get('input[type="file"]').attachFile('test.csv');

    // Esperar processamento
    cy.contains('Upload concluído').should('exist');

    // Verificar registros criados
    cy.visit('/records');
    cy.get('[role="row"]').should('have.length.gt', 1);
  });
}); 