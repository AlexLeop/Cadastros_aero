Cypress.Commands.add('login', (email = 'admin@example.com', password = 'password123') => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/auth/token/`,
    body: { email, password },
  }).then((response) => {
    localStorage.setItem('token', response.body.access);
    localStorage.setItem('refreshToken', response.body.refresh);
  });
});

Cypress.Commands.add('createRecord', (data) => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/records/`,
    headers: {
      Authorization: `Bearer ${localStorage.getItem('token')}`,
    },
    body: data,
  });
});

Cypress.Commands.add('resetDatabase', () => {
  cy.request({
    method: 'POST',
    url: `${Cypress.env('apiUrl')}/test/reset/`,
  });
}); 