describe('Fluxo do site', () => {

  it('Acessa a página inicial', () => {

    cy.visit('http://127.0.0.1:8080')

  })

  it('Verifica se a página carregou', () => {

    cy.visit('http://127.0.0.1:8080')

    cy.get('body').should('exist')

  })

})