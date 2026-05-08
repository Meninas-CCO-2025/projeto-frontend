window.addEventListener('DOMContentLoaded', () => {
  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')

  document.getElementById('perfil-nome').textContent  = '@' + (usuario.nome  || 'usuario')
  document.getElementById('perfil-email').textContent = usuario.email || '—'
  document.getElementById('perfil-data').textContent  = '📅 ' + (usuario.data  || '—')
})

function salvarConfig() {
  const nome  = document.getElementById('novo-nome').value.trim()
  const email = document.getElementById('novo-email').value.trim()
  const msg   = document.getElementById('msg-config')

  if (!nome && !email) { msg.textContent = 'Preencha ao menos um campo.'; return }

  const usuario = JSON.parse(localStorage.getItem('usuario') || '{}')
  if (nome)  { usuario.nome  = nome;  document.getElementById('perfil-nome').textContent  = '@' + nome }
  if (email) { usuario.email = email; document.getElementById('perfil-email').textContent = email }

  localStorage.setItem('usuario', JSON.stringify(usuario))
  msg.style.color = '#4CAF50'
  msg.textContent = '✅ Alterações salvas!'
}

function confirmarDelecao() {
  document.getElementById('modal-deletar').style.display = 'flex'
}

function fecharModalDeletar() {
  document.getElementById('modal-deletar').style.display = 'none'
}

function deletarConta() {
  localStorage.removeItem('usuario')
  window.location.href = '../index.html'
}