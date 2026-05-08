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

// Carrega dados ao abrir app.html
window.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  const el = document.getElementById('nome-usuario')
  if (el && usuario.nome) el.textContent = usuario.nome

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