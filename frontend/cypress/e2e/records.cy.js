describe('Records Flow', () => {
  beforeEach(() => {
    cy.resetDatabase();
    cy.login();
  });

  it('should list records', () => {
    cy.visit('/records');
    
    // Verificar loading state
    cy.get('[role="progressbar"]').should('exist');
    cy.get('[role="progressbar"]').should('not.exist');

    // Verificar lista de registros
    cy.get('[role="grid"]').should('exist');
    cy.get('[role="row"]').should('have.length.gt', 1);
  });

  it('should filter records', () => {
    cy.createRecord({
      file: 1,
      row_number: 1,
      data: { field: 'test1' },
      status: 'pending'
    });

    cy.createRecord({
      file: 1,
      row_number: 2,
      data: { field: 'test2' },
      status: 'validated'
    });

    cy.visit('/records');

    // Filtrar por status
    cy.get('input[name="status"]').click();
    cy.contains('Validado').click();

    // Verificar resultados filtrados
    cy.contains('test1').should('not.exist');
    cy.contains('test2').should('exist');
  });

  it('should validate record', () => {
    cy.createRecord({
      file: 1,
      row_number: 1,
      data: { field: 'test' },
      status: 'pending'
    }).then((response) => {
      cy.visit(`/records/${response.body.id}`);
      
      // Clicar no botão de validar
      cy.contains('button', 'Validar').click();

      // Verificar status atualizado
      cy.contains('Validado').should('exist');
    });
  });

  it('should delete record', () => {
    cy.createRecord({
      file: 1,
      row_number: 1,
      data: { field: 'test' }
    });

    cy.visit('/records');

    // Clicar no botão de excluir
    cy.get('[aria-label="delete"]').first().click();
    
    // Confirmar exclusão
    cy.on('window:confirm', () => true);

    // Verificar que registro foi removido
    cy.contains('test').should('not.exist');
  });
}); 