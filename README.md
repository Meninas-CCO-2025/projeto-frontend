# 🎵 Vinyl - Letterbox de Música

## 📌 Descrição do Projeto

O Vinyl é uma plataforma inspirada no conceito do Letterbox, voltada para o universo musical. O sistema permite que usuários descubram e organizem suas músicas favoritas, registrem avaliações e compartilhem opiniões sobre obras musicais.

O projeto foi desenvolvido como atividade da disciplina de **Programação Frontend e DevOps**, aplicando conceitos de desenvolvimento web, versionamento de código, integração contínua e entrega contínua (CI/CD).

---

## 🚀 Funcionalidades

* 👤 Cadastro e Login de usuário
* 🎧 Visualização e exploração de álbuns musicais
* ⭐ Avaliação de músicas e álbuns
* 📝 Registro de reviews/resenhas
* 🔍 Pesquisa (busca) de artistas e músicas
* ❤️ Lista de favoritos e gerenciamento de perfil
* 📱 Interface responsiva para diferentes dispositivos

---

## 🛠 Tecnologias Utilizadas

### Frontend
* HTML5
* CSS3
* JavaScript (ES6+)
* Bootstrap

### DevOps & CI/CD
* Git & GitHub -> Versionamento
* GitHub Actions -> CI e CD
* Azure Web Apps - Hospedagem

### Testes
* Cypress (Testes End-to-End)

---

## 🌐 Site em Produção

**Acesse o projeto:** 
Link :https://lemon-grass-0b892fb10.7.azurestaticapps.net/

---

## 📂 Estrutura do Projeto

```text
vinyl/
|   .gitignore
|   app.html
|   cypress.config.js
|   index.html
|   login.html
|   package-lock.json
|   package.json
|   README.md
|   
+---.github
|   \---workflows
|           azure-static-web-apps-lemon-grass-0b892fb10.yml
|           
+---.vscode
|       settings.json
|       
+---css
|       app.css
|       busca.css
|       explorar.css
|       index.css                                                                                                                                          
|       login.css                                                                                                                                          
|       perfil.css                                                                                                                                         
|       reviews.css                                                                                                                                        
|       style.css                                                                                                                                          
|                                                                                                                                                          
+---cypress                                                                                                                                                
|   +---e2e                                                                                                                                                
|   |       fluxos.cy.js                                                                                                                                   
|   |                                                                                                                                                      
|   +---fixtures                                                                                                                                           
|   |       example.json                                                                                                                                   
|   |                                                                                                                                                      
|   \---support                                                                                                                                            
|           commands.js                                                                                                                                    
|           e2e.js                                                                                                                                         
|                                                                                                                                                          
+---js                                                                                                                                                     
|       app.js                                                                                                                                             
|       busca.js                                                                                                                                           
|       explorar.js                                                                                                                                        
|       favoritos.js                                                                                                                                       
|       main.js                                                                                                                                            
|       perfil.js                                                                                                                                          
|       reviews.js                                                                                                                                         
|       utils.js                                                                                                                                           
|                                                                                                                                                          
\---pages                                                                                                                                                  
        busca.html                                                                                                                                         
        explorar.html                                                                                                                                      
        favoritos.html                                                                                                                                     
        perfil.html                                                                                                                                        
        reviews.html                                                                                                                                       
                               
```

## 📌 Integrantes

* Bárbara Falcão - 2506486 
* Giovana de Godoy Felisbino - 2507579
* Giovanna Falgetano - 2512938
* Glória Mariano - 2504112
* Lais da Rosa Câmara - 2505420
