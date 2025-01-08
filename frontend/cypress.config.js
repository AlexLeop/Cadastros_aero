const { defineConfig } = require('cypress');

module.exports = defineConfig({
  e2e: {
    baseUrl: 'http://localhost:3000',
    setupNodeEvents(on, config) {
      // implementar event listeners do node, se necessário
    },
  },
  env: {
    apiUrl: 'http://localhost:8000/api',
  },
  viewportWidth: 1280,
  viewportHeight: 720,
}); 