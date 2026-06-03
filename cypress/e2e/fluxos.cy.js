describe('Fluxo do site', () => {

  it('Acessa a página inicial', () => {
    cy.visit('http://localhost:3000/')
  })

  it('Verifica se a página carregou corretamente', () => {
    cy.visit('http://localhost:3000/')
    cy.get('body').should('exist')
  })

  it('Acessa aba de cadastro', () => {
    cy.visit('http://localhost:3000/')
    cy.contains('Cadastrar').click()
  })

  it('Preenche formulário de cadastro', () => {
    cy.visit('http://localhost:3000/')
    cy.contains('Cadastrar').click()
    cy.get('#form-cadastro').should('be.visible')
    cy.get('#cad-nome').type('lais')
    cy.get('#cad-email').type('teste@email.com')
    cy.get('#cad-senha').type('123456')
  })

  it('Verifica se o menu existe', () => {
    cy.visit('http://localhost:3000/')
    cy.get('nav').should('exist')
  })

  it('Verifica se o texto principal aparece', () => {
    cy.visit('http://localhost:3000/login.html')
    cy.contains('Descubra e avalie sua música')
  })

  it('Clica em um card de música', () => {
    cy.visit('http://localhost:3000/')
    cy.get('.music-card').first().click()
  })

})