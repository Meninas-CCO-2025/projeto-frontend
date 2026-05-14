/* 
1. Teste de carregamento da página (acessa o site, verifica se a página abre, valida o body existente).
2. Teste de navegação 
3. Teste de formulário/login
4. Teste de elementos visíveis
5. Teste dos cards de música
6. Verificação de texto
*/


describe('Fluxo do site', () => {

  it('Acessa a página inicial', () => {

    cy.visit('http://127.0.0.1:8080')

  })

  it('Verifica se a página carregou', () => { // ETAPA 1

    cy.visit('http://127.0.0.1:8080')

    cy.get('body').should('exist')

  })

  it('Verifica se o menu existe', () => { // ETAPA 2

    cy.visit('http://127.0.0.1:8080')

    cy.get('nav').should('exist')

  })

  it('Clica em um card de música', () => {

    cy.visit('http://127.0.0.1:8080')

    cy.get('.music-card')
      .first()
      .click()

  })

})