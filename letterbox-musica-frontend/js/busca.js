const catalogoMusicas = [
  { titulo: 'Bohemian Rhapsody', artista: 'Queen',         emoji: '🎸', cor: '#DB023D' },
  { titulo: 'Blinding Lights',   artista: 'The Weeknd',    emoji: '🎹', cor: '#FF6347' },
  { titulo: 'As It Was',         artista: 'Harry Styles',  emoji: '🎤', cor: '#6a0dad' },
  { titulo: 'Flowers',           artista: 'Miley Cyrus',   emoji: '🥁', cor: '#1a6b3c' },
  { titulo: 'Anti-Hero',         artista: 'Taylor Swift',  emoji: '🎺', cor: '#8B0000' },
  { titulo: 'Midnights',         artista: 'Taylor Swift',  emoji: '🌙', cor: '#1e1840' },
  { titulo: 'Renaissance',       artista: 'Beyoncé',       emoji: '👑', cor: '#c47a00' },
  { titulo: 'SOS',               artista: 'SZA',           emoji: '💜', cor: '#4a2060' },
  { titulo: 'Levitating',        artista: 'Dua Lipa',      emoji: '✨', cor: '#1e6f9c' },
  { titulo: 'Peaches',           artista: 'Justin Bieber', emoji: '🍑', cor: '#c47a00' },
]

function buscar() {
  const termo = document.getElementById('campo-busca').value.toLowerCase().trim()
  const res   = document.getElementById('resultados')
  const vazio = document.getElementById('estado-vazio')

  if (!termo) { res.innerHTML = ''; vazio.style.display = 'block'; return }

  vazio.style.display = 'none'

  const filtrados = catalogoMusicas.filter(m =>
    m.titulo.toLowerCase().includes(termo) ||
    m.artista.toLowerCase().includes(termo)
  )

  if (filtrados.length === 0) {
    res.innerHTML = `<p style="color:var(--text-muted);text-align:center;margin-top:40px">Nenhum resultado para "<strong>${termo}</strong>"</p>`
    return
  }

  res.innerHTML = filtrados.map(m => `
    <div class="result-card">
      <div class="music-cover" style="background:${m.cor};width:52px;height:52px;font-size:1.4rem;flex-shrink:0">${m.emoji}</div>
      <div style="flex:1">
        <p class="music-title" style="font-size:0.95rem">${m.titulo}</p>
        <p class="music-artist">${m.artista}</p>
      </div>
      <button class="btn-fav" onclick="this.textContent = this.textContent === '❤️' ? '🤍' : '❤️'">🤍</button>
    </div>
  `).join('')
}