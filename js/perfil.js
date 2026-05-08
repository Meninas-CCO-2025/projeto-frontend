let playlistParaDeletar = null

window.addEventListener('DOMContentLoaded', () => {
  const usuario  = JSON.parse(localStorage.getItem('usuario')  || '{}')
  const reviews  = JSON.parse(localStorage.getItem('reviews')  || '[]')
  const playlists= JSON.parse(localStorage.getItem('playlists')|| '[]')

  // Info do perfil
  document.getElementById('perfil-nome').textContent  = '@' + (usuario.nome  || 'usuario')
  document.getElementById('perfil-email').textContent = usuario.email || '—'
  document.getElementById('perfil-data').textContent  = '📅 ' + (usuario.data || '—')

  // Stats
  document.getElementById('stat-reviews').textContent   = reviews.length
  document.getElementById('stat-playlists').textContent = playlists.length

  // Carrega reviews
  carregarReviews(reviews)

  // Carrega playlists
  carregarPlaylists(playlists)
})

function carregarReviews(reviews) {
  const container = document.getElementById('perfil-reviews-container')
  const vazio     = document.getElementById('reviews-vazio')

  if (reviews.length === 0) { vazio.style.display = 'block'; return }
  vazio.style.display = 'none'

  reviews.forEach((r, i) => {
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
      <button class="btn-del-review" onclick="deletarReview(${i})">🗑️ Apagar</button>
    `
    container.appendChild(card)
  })
}

function deletarReview(index) {
  const reviews = JSON.parse(localStorage.getItem('reviews') || '[]')
  reviews.splice(index, 1)
  localStorage.setItem('reviews', JSON.stringify(reviews))

  const container = document.getElementById('perfil-reviews-container')
  container.innerHTML = ''
  document.getElementById('reviews-vazio').style.display = 'none'
  container.appendChild(document.getElementById('reviews-vazio'))
  document.getElementById('stat-reviews').textContent = reviews.length
  carregarReviews(reviews)
}

function carregarPlaylists(playlists) {
  const container = document.getElementById('perfil-playlists-container')
  const vazio     = document.getElementById('playlists-vazio')

  if (playlists.length === 0) { vazio.style.display = 'block'; return }
  vazio.style.display = 'none'

  playlists.forEach((p, i) => {
    const card = document.createElement('div')
    card.className = 'playlist-card-perfil'
    card.innerHTML = `
      <div class="playlist-card-inner">
        <div class="playlist-cover-sm">${p.emoji}</div>
        <div style="flex:1">
          <p class="playlist-name">${p.nome}</p>
          <p class="playlist-count">${p.count} músicas</p>
        </div>
        <button class="btn-del-playlist" onclick="pedirDelPlaylist(${i})">🗑️</button>
      </div>
    `
    container.appendChild(card)
  })
}

function pedirDelPlaylist(index) {
  playlistParaDeletar = index
  document.getElementById('modal-del-playlist').style.display = 'flex'
}

function fecharModalPlaylist() {
  playlistParaDeletar = null
  document.getElementById('modal-del-playlist').style.display = 'none'
}

function confirmarDelPlaylist() {
  if (playlistParaDeletar === null) return
  const playlists = JSON.parse(localStorage.getItem('playlists') || '[]')
  playlists.splice(playlistParaDeletar, 1)
  localStorage.setItem('playlists', JSON.stringify(playlists))

  const container = document.getElementById('perfil-playlists-container')
  container.innerHTML = ''
  container.appendChild(document.getElementById('playlists-vazio'))
  document.getElementById('stat-playlists').textContent = playlists.length
  fecharModalPlaylist()
  carregarPlaylists(playlists)
}

// Abas
function mostrarAba(aba) {
  ['reviews','playlists'].forEach(a => {
    document.getElementById('aba-' + a).style.display = a === aba ? 'block' : 'none'
  })
  document.querySelectorAll('.perfil-tab').forEach((t, i) => {
    t.classList.toggle('active', ['reviews','playlists'][i] === aba)
  })
}

// Config
function salvarNome() {
  const nome = document.getElementById('novo-nome').value.trim()
  const msg  = document.getElementById('msg-nome')
  if (!nome) { msg.style.color = 'var(--accent)'; msg.textContent = 'Digite um nome.'; return }
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  usuario.nome = nome
  localStorage.setItem('usuario', JSON.stringify(usuario))
  document.getElementById('perfil-nome').textContent = '@' + nome
  msg.style.color = '#4CAF50'
  msg.textContent = '✅ Nome atualizado!'
}

function salvarEmail() {
  const email = document.getElementById('novo-email').value.trim()
  const msg   = document.getElementById('msg-email')
  if (!email || !email.includes('@')) { msg.style.color = 'var(--accent)'; msg.textContent = 'E-mail inválido.'; return }
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  usuario.email = email
  localStorage.setItem('usuario', JSON.stringify(usuario))
  document.getElementById('perfil-email').textContent = email
  msg.style.color = '#4CAF50'
  msg.textContent = '✅ E-mail atualizado!'
}

function confirmarDelecao() {
  document.getElementById('modal-deletar').style.display = 'flex'
}

function fecharModalDeletar() {
  document.getElementById('modal-deletar').style.display = 'none'
}

function deletarConta() {
  localStorage.clear()
  window.location.href = '../index.html'
}

function abrirModalConfig() {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  document.getElementById('novo-nome').value  = usuario.nome  || ''
  document.getElementById('novo-email').value = usuario.email || ''
  document.getElementById('msg-nome').textContent  = ''
  document.getElementById('msg-email').textContent = ''
  document.getElementById('modal-config').style.display = 'flex'
}

function fecharModalConfig() {
  document.getElementById('modal-config').style.display = 'none'
}