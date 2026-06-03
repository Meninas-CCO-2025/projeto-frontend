describe('Fluxo do site', () => {

  // 1. TESTE DE CARREGAMENTO DA PÁGINA
  it('Acessa a página inicial', () => {
    cy.visit('/')
  })

  it('Verifica se a página carregou corretamente', () => {
    cy.visit('/')
    cy.get('body').should('exist')
  })

  // 2. TESTE DE NAVEGAÇÃO
  it('Acessa aba de cadastro', () => {
    cy.visit('/login.html')
    cy.contains('Cadastrar').click()
  })

  // 3. TESTE DE FORMULÁRIO / LOGIN
  it('Preenche formulário de cadastro', () => {
    cy.visit('/login.html')
    cy.contains('Cadastrar').click()
    cy.get('#cad-nome').type('lais')
    cy.get('#cad-email').type('teste@email.com')
    cy.get('#cad-senha').type('123456')
  })

  it('Preenche formulário de login', () => {
    cy.visit('/login.html')
    cy.contains('Entrar').click()
    cy.get('#login-email').type('teste@email.com')
    cy.get('#login-senha').type('123456')
  })

  // 4. TESTE DE ELEMENTOS VISÍVEIS
  it('Verifica se o menu existe', () => {
    cy.visit('/')
    cy.get('nav').should('exist')
  })

  // 5. VERIFICAÇÃO DE TEXTO
  it('Verifica se o texto principal aparece', () => {
    cy.visit('/login.html')
    cy.contains('Descubra e avalie sua música')
  })

  // 6. TESTE DOS CARDS DE MÚSICA
  it('Clica em um card de música', () => {
    cy.visit('/')
    cy.get('.music-card').first().click()
  })

})