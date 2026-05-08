// ==================== AUTENTICAÇÃO ====================

function showTab(tab) {
  const formCadastro = document.getElementById('form-cadastro')
  const formLogin = document.getElementById('form-login')
  const tabCadastro = document.getElementById('tab-cadastro')
  const tabLogin = document.getElementById('tab-login')

  if (tab === 'cadastro') {
    formCadastro.style.display = 'block'
    formLogin.style.display = 'none'
    tabCadastro.classList.add('active')
    tabLogin.classList.remove('active')
  } else {
    formCadastro.style.display = 'none'
    formLogin.style.display = 'block'
    tabCadastro.classList.remove('active')
    tabLogin.classList.add('active')
  }
}

function cadastrar() {
  const nome = document.getElementById('cad-nome').value.trim()
  const email = document.getElementById('cad-email').value.trim()
  const senha = document.getElementById('cad-senha').value.trim()
  const data = document.getElementById('cad-data').value
  const erroEl = document.getElementById('erro-cadastro')

  // Validações
  if (!nome) {
    erroEl.textContent = '❌ Nome de usuário é obrigatório'
    return
  }
  if (!email) {
    erroEl.textContent = '❌ E-mail é obrigatório'
    return
  }
  if (!email.includes('@')) {
    erroEl.textContent = '❌ E-mail inválido'
    return
  }
  if (!senha || senha.length < 6) {
    erroEl.textContent = '❌ Senha deve ter no mínimo 6 caracteres'
    return
  }
  if (!data) {
    erroEl.textContent = '❌ Data de nascimento é obrigatória'
    return
  }

  // Verifica se email já existe
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
  if (usuarios.some(u => u.email === email)) {
    erroEl.textContent = '❌ Este e-mail já está cadastrado'
    return
  }

  // Salva novo usuário
  const novoUsuario = {
    id: Date.now(),
    nome,
    email,
    senha, // Em produção, NUNCA guardar senha em texto simples!
    data,
    dataCriacao: new Date().toLocaleDateString('pt-BR')
  }

  usuarios.push(novoUsuario)
  localStorage.setItem('usuarios', JSON.stringify(usuarios))

  // Faz login automático
  localStorage.setItem('usuario', JSON.stringify({ nome, email, data }))
  localStorage.setItem('usuarioLogado', 'true')

  erroEl.style.color = '#28a745'
  erroEl.textContent = '✅ Cadastro realizado com sucesso! Redirecionando...'

  setTimeout(() => {
    window.location.href = 'app.html'
  }, 1500)
}

function login() {
  const email = document.getElementById('login-email').value.trim()
  const senha = document.getElementById('login-senha').value.trim()
  const erroEl = document.getElementById('erro-login')

  // Validações
  if (!email) {
    erroEl.textContent = '❌ E-mail é obrigatório'
    return
  }
  if (!senha) {
    erroEl.textContent = '❌ Senha é obrigatória'
    return
  }

  // Busca usuário
  const usuarios = JSON.parse(localStorage.getItem('usuarios') || '[]')
  const usuario = usuarios.find(u => u.email === email && u.senha === senha)

  if (!usuario) {
    erroEl.textContent = '❌ E-mail ou senha incorretos'
    return
  }

  // Faz login
  localStorage.setItem('usuario', JSON.stringify({ nome: usuario.nome, email: usuario.email, data: usuario.data }))
  localStorage.setItem('usuarioLogado', 'true')

  erroEl.style.color = '#28a745'
  erroEl.textContent = '✅ Bem-vindo! Redirecionando...'

  setTimeout(() => {
    window.location.href = 'app.html'
  }, 1500)
}

function loginGoogle() {
  alert('🔄 Login com Google ainda não está implementado. Use e-mail para agora!')
}

function exigirLogin() {
  alert('📝 Por favor, faça login ou cadastro para continuar!')
  window.location.href = 'login.html'
}

function logout() {
  localStorage.removeItem('usuarioLogado')
  localStorage.removeItem('usuario')
  window.location.href = 'index.html'
}

// Verifica se usuário está logado ao abrir app.html
window.addEventListener('DOMContentLoaded', () => {
  const paginaAtual = window.location.pathname
  const estaLogado = localStorage.getItem('usuarioLogado') === 'true'

  // Se está em app.html ou pages/ e não está logado
  if ((paginaAtual.includes('app.html') || paginaAtual.includes('/pages/')) && !estaLogado) {
    window.location.href = '../login.html'
    return
  }

  // Se está em login.html e já está logado
  if (paginaAtual.includes('login.html') && estaLogado) {
    window.location.href = 'app.html'
    return
  }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  
  // Atualiza saudação
  const el = document.getElementById('nome-usuario')
  if (el && usuario.nome) {
    if (paginaAtual.includes('app.html')) {
      el.textContent = `Bem-vindo, ${usuario.nome}!`
    } else {
      el.textContent = usuario.nome
    }
  }

  // Carrega reviews salvas
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  const container = document.getElementById('reviews-container')
  if (container) {
    reviews.forEach(r => {
      const card = document.createElement('div')
      card.className = 'review-card'
      card.innerHTML = `
        <div class="review-header">
          <div class="review-avatar">🎧</div>
          <div>
            <p class="review-user">@${r.usuario}</p>
            <p class="review-music">${r.musica} — ${r.artista}</p>
          </div>
          <div class="review-stars ms-auto">${r.estrelas}</div>
        </div>
        <p class="review-text">"${r.texto || 'Sem comentário.'}"</p>
      `
      container.appendChild(card)
    })
  }

  // Carrega playlists salvas
  const playlists = JSON.parse(localStorage.getItem('playlists') || '[]')
  const plContainer = document.getElementById('playlists-container')
  if (plContainer) {
    playlists.forEach(p => {
      const card = document.createElement('div')
      card.className = 'playlist-card'
      card.innerHTML = `
        <div class="playlist-cover">${p.emoji}</div>
        <p class="playlist-name">${p.nome}</p>
        <p class="playlist-count">${p.count} músicas</p>
      `
      plContainer.prepend(card)
    })
  }
})

// FAB
let fabAberto = false

function toggleFabMenu() {
  fabAberto = !fabAberto
  document.getElementById('fab-menu').style.display = fabAberto ? 'flex' : 'none'
  document.getElementById('fab-btn').classList.toggle('aberto', fabAberto)
}

function abrirModal(tipo) {
  fabAberto = false
  document.getElementById('fab-menu').style.display = 'none'
  document.getElementById('fab-btn').classList.remove('aberto')
  document.getElementById('modal-principal').style.display = 'flex'
  document.getElementById('conteudo-review').style.display   = tipo === 'review'   ? 'block' : 'none'
  document.getElementById('conteudo-playlist').style.display = tipo === 'playlist' ? 'block' : 'none'
}

function fecharModal() {
  document.getElementById('modal-principal').style.display = 'none'
}

// Estrelas
let estrelasSelecionadas = 0

function setStar(n) {
  estrelasSelecionadas = n
  document.querySelectorAll('.star').forEach((s, i) => s.classList.toggle('ativa', i < n))
}

// Emoji playlist
let emojiSelecionado = '🔥'

function selecionarEmoji(el) {
  document.querySelectorAll('.emoji-opt').forEach(e => e.classList.remove('active'))
  el.classList.add('active')
  emojiSelecionado = el.textContent
}

// Salvar review
function salvarReview() {
  const musica  = document.getElementById('rev-musica').value.trim()
  const artista = document.getElementById('rev-artista').value.trim()
  const texto   = document.getElementById('rev-texto').value.trim()
  if (!musica || !artista) { alert('Preencha música e artista.'); return }

  const estrelas = '★'.repeat(estrelasSelecionadas) + '☆'.repeat(5 - estrelasSelecionadas)
  const usuario  = JSON.parse(localStorage.getItem('usuario') || '{}')

  // Salva no localStorage
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  reviews.unshift({ musica, artista, texto, estrelas, usuario: usuario.nome || 'você' })
  localStorage.setItem('reviews', JSON.stringify(reviews))

  // Adiciona no DOM
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

  document.getElementById('rev-musica').value  = ''
  document.getElementById('rev-artista').value = ''
  document.getElementById('rev-texto').value   = ''
  estrelasSelecionadas = 0
  document.querySelectorAll('.star').forEach(s => s.classList.remove('ativa'))
}

// Salvar playlist
function salvarPlaylist() {
  const nome = document.getElementById('pl-nome').value.trim()
  if (!nome) { alert('Digite um nome para a playlist.'); return }

  const playlists = JSON.parse(localStorage.getItem('playlists') || '[]')
  playlists.unshift({ nome, emoji: emojiSelecionado, count: 0 })
  localStorage.setItem('playlists', JSON.stringify(playlists))

  const card = document.createElement('div')
  card.className = 'playlist-card'
  card.innerHTML = `
    <div class="playlist-cover">${emojiSelecionado}</div>
    <p class="playlist-name">${nome}</p>
    <p class="playlist-count">0 músicas</p>
  `
  document.getElementById('playlists-container').prepend(card)
  fecharModal()
  document.getElementById('pl-nome').value = ''
}