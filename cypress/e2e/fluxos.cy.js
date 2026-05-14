/* 
1. Teste de carregamento da página 
2. Teste de navegação 
3. Teste de formulário/login
4. Teste de elementos visíveis
5. Teste dos cards de música
6. Verificação de texto
*/

describe('Fluxo do site', () => {

  // 1. TESTE DE CARREGAMENTO DA PÁGINA
  it('Acessa a página inicial', () => {

    cy.visit('http://127.0.0.1:8080')

  })

  it('Verifica se a página carregou corretamente', () => {

    cy.visit('http://127.0.0.1:8080')

    cy.get('body').should('exist')

  })

  // 2. TESTE DE NAVEGAÇÃO
  it('Acessa aba de cadastro', () => {

    cy.visit('http://127.0.0.1:8080/login.html')

    cy.contains('Cadastrar').click()

  })

  // 3. TESTE DE FORMULÁRIO / LOGIN
  it('Preenche formulário de cadastro', () => {

    cy.visit('http://127.0.0.1:8080/login.html')

    cy.contains('Cadastrar').click()

    cy.get('#cad-nome')
      .type('lais')

    cy.get('#cad-email')
      .type('teste@email.com')

    cy.get('#cad-senha')
      .type('123456')

  })

  it('Preenche formulário de login', () => {

    cy.visit('http://127.0.0.1:8080/login.html')

    cy.contains('Entrar').click()

    cy.get('#login-email')
      .type('teste@email.com')

    cy.get('#login-senha')
      .type('123456')

  })

})