// Troca de abas
function showTab(tab) {
  document.getElementById('form-cadastro').style.display = tab === 'cadastro' ? 'block' : 'none'
  document.getElementById('form-login').style.display    = tab === 'login'    ? 'block' : 'none'
  document.getElementById('tab-cadastro').classList.toggle('active', tab === 'cadastro')
  document.getElementById('tab-login').classList.toggle('active',    tab === 'login')
}

// Cadastro
function cadastrar() {
  const nome  = document.getElementById('cad-nome').value.trim()
  const email = document.getElementById('cad-email').value.trim()
  const senha = document.getElementById('cad-senha').value
  const data  = document.getElementById('cad-data').value
  const erro  = document.getElementById('erro-cadastro')

  if (!nome || !email || !senha || !data) { erro.textContent = 'Preencha todos os campos.'; return }
  if (senha.length < 6)                   { erro.textContent = 'Senha mínima de 6 caracteres.'; return }

  // Salva no localStorage (temporário — depois conecta ao Firebase)
  localStorage.setItem('usuario', JSON.stringify({ nome, email, data }))
  window.location.href = 'app.html'
}

// Login
function login() {
  const email = document.getElementById('login-email').value.trim()
  const senha = document.getElementById('login-senha').value
  const erro  = document.getElementById('erro-login')

  if (!email || !senha) { erro.textContent = 'Preencha e-mail e senha.'; return }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  if (usuario.email === email) {
    window.location.href = 'app.html'
  } else {
    erro.textContent = 'Usuário não encontrado.'
  }
}

// Google (placeholder — conectar Firebase depois)
function loginGoogle() {
  alert('Login com Google será integrado com Firebase na Fase 4.')
}

// Carrega nome do usuário
window.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const el = document.getElementById('nome-usuario')
  if (el && usuario.nome) el.textContent = usuario.nome
})

// Modal de review
let estrelasSelecionadas = 0

function abrirModal()  { document.getElementById('modal-review').style.display = 'flex' }
function fecharModal() { document.getElementById('modal-review').style.display = 'none' }

function setStar(n) {
  estrelasSelecionadas = n
  document.querySelectorAll('.star').forEach((s, i) => {
    s.classList.toggle('ativa', i < n)
  })
}

function salvarReview() {
  const musica  = document.getElementById('rev-musica').value.trim()
  const artista = document.getElementById('rev-artista').value.trim()
  const texto   = document.getElementById('rev-texto').value.trim()

  if (!musica || !artista) { alert('Preencha música e artista.'); return }

  const estrelas = '★'.repeat(estrelasSelecionadas) + '☆'.repeat(5 - estrelasSelecionadas)
  const usuario  = JSON.parse(localStorage.getItem('usuario') || '{}')

  const card = document.createElement('div')
  card.className = 'review-card'
  card.innerHTML = `
    <div class="review-header">
      <div class="review-avatar">🎧</div>
      <div>
        <p class="review-user">@${usuario.nome || 'você'}</p>
        <p class="review-music">${musica} — ${artista}</p>
      </div>
      <div class="review-stars ms-auto">${estrelas}</div>
    </div>
    <p class="review-text">"${texto || 'Sem comentário.'}"</p>
  `

  document.getElementById('reviews-container').prepend(card)
  fecharModal()

  // Limpa campos
  document.getElementById('rev-musica').value  = ''
  document.getElementById('rev-artista').value = ''
  document.getElementById('rev-texto').value   = ''
  estrelasSelecionadas = 0
  document.querySelectorAll('.star').forEach(s => s.classList.remove('ativa'))
}