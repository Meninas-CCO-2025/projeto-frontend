const URL_BANCO = 'https://aolewmjptkjcbhjczrjm.supabase.co';
const CHAVE_BANCO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGV3bWpwdGtqY2JoamN6cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkzNjAsImV4cCI6MjA5Mzg0NTM2MH0.K7pGC4EfuULjlVgZT2RMXa9oZ5cawY23OOj7nneXm4M';

const conexaoSupabase = window.supabase.createClient(URL_BANCO, CHAVE_BANCO);

async function renderizarApp() {
   console.log("Script carregado. Aguardando execução...");

// 1. Tenta rodar imediatamente
renderizarApp();

// 2. Tenta rodar quando o HTML terminar de carregar
window.addEventListener('DOMContentLoaded', () => {
    console.log("DOMContentLoaded disparado");
    renderizarApp();
});

// 3. Tenta rodar quando TUDO (imagens e estilos) carregar
window.addEventListener('load', () => {
    console.log("Window Load disparado");
    renderizarApp();
});
    const vitrine = document.getElementById('vitrine-musicas');
    
    if (!vitrine) {
        console.error("Erro: Não encontrei a div vitrine-musicas!");
        return;
    }

    try {
        // 1. Limpa o "Tentando conectar" imediatamente
        vitrine.innerHTML = "<p style='color: yellow;'>Buscando músicas no banco...</p>";

        const { data, error } = await conexaoSupabase.from('musicas').select('*');

        if (error) throw error;

        // 2. Se o banco voltar vazio
        if (!data || data.length === 0) {
            vitrine.innerHTML = "<h3 class='text-white'>Banco conectado, mas não há músicas na tabela.</h3>";
            return;
        }

        // 3. Limpa tudo e desenha os cards
        vitrine.innerHTML = ""; 

        data.forEach(item => {
            vitrine.innerHTML += `
                <div class="col-6 col-md-3 mb-4">
                    <div style="background:#2a2540; padding:15px; border-radius:12px; text-align:center; height:100%;">
                        <img src="${item.capa_url}" style="width:100%; aspect-ratio:1/1; object-fit:cover; border-radius:8px;">
                        <h5 style="color:white !important; margin-top:10px; font-weight:bold;">${item.titulo}</h5>
                        <p style="color:#a89ec9 !important; font-size:0.85rem;">${item.artista}</p>
                    </div>
                </div>`;
        });
        console.log("Vitrine atualizada!");

    } catch (err) {
        console.error("Erro fatal:", err);
        vitrine.innerHTML = `<p style="color:red">Erro: ${err.message}</p>`;
    }
}

// Isso força a execução mesmo que o navegador esteja "preguiçoso"
if (document.readyState === 'complete') {
    renderizarApp();
} else {
    window.addEventListener('load', renderizarApp);
}




// ==================== 3. AUTENTICAÇÃO ====================
async function cadastrar() {
  const email = document.getElementById('cad-email').value;
  const senha = document.getElementById('cad-senha').value;
  const nome = document.getElementById('cad-nome').value;
  const erroMsg = document.getElementById('erro-cadastro');

  const { data, error } = await supabase.auth.signUp({
    email: email,
    password: senha,
    options: { data: { full_name: nome } }
  });

  if (error) {
    erroMsg.innerText = error.message;
    erroMsg.style.color = "red";
  } else {
    alert("Cadastro realizado!");
    showTab('login');
  }
}

async function login() {
  const email = document.getElementById('login-email').value;
  const senha = document.getElementById('login-senha').value;
  const erroMsg = document.getElementById('erro-login');

  const { data, error } = await supabase.auth.signInWithPassword({ email, password: senha });

  if (error) {
    erroMsg.innerText = "E-mail ou senha incorretos.";
    erroMsg.style.color = "red";
  } else {
    window.location.href = 'app.html';
  }
}

async function logout() {
  await supabase.auth.signOut();
  window.location.href = 'login.html';
}

// ==================== 4. FUNÇÕES DO BANCO (REVIEWS) ====================
async function carregarReviewsDoBanco() {
  const container = document.getElementById('feed-reviews');
  if (!container) return;

  const { data, error } = await supabase
    .from('reviews')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) return;

  container.innerHTML = data.map(r => `
    <div class="review-card">
        <div class="d-flex justify-content-between">
            <strong>${r.musica}</strong>
            <span class="text-warning">${'★'.repeat(r.nota)}</span>
        </div>
        <p class="text-muted small">${r.artista}</p>
        <p>"${r.comentario || ''}"</p>
    </div>
  `).join('');
}

// ==================== 5. INICIALIZAÇÃO ====================
document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('feed-reviews')) {
    carregarReviewsDoBanco();
  }
});

// Garante que o HTML enxergue as funções
window.showTab = showTab;
window.cadastrar = cadastrar;
window.login = login;
window.logout = logout;

// 1. Função que busca os dados na tabela 'musicas' do Supabase
async function carregarVitrine() {
  const container = document.getElementById('vitrine-musicas');
  if (!container) return;

  // Busca as colunas da sua tabela (ajuste os nomes se forem diferentes no seu banco)
  const { data: musicas, error } = await supabase
    .from('musicas') // Nome da sua tabela no Supabase
    .select('*');

  if (error) {
    console.error("Erro ao carregar músicas:", error.message);
    return;
  }

  // 2. Gera o HTML para cada música vinda do banco
  container.innerHTML = musicas.map(m => `
    <div class="music-card">
      <div class="music-cover" style="background:${m.cor || '#333'}">
        ${m.emoji || '🎵'}
      </div>
      <div class="music-info">
        <h5 class="music-title">${m.titulo}</h5>
        <p class="music-artist">${m.artista}</p>
        <button class="btn-review" onclick="prepararModalReview('${m.titulo}', '${m.artista}', '${m.capa_url || ''}')">
          ⭐ Avaliar
        </button>
      </div>
    </div>
  `).join('');
}

// 3. Função para abrir o modal de avaliação (Corrigindo o erro de 'not defined')
function prepararModalReview(titulo, artista, capa) {
  // Preenche os campos escondidos ou visíveis do modal
  document.getElementById('rev-musica').value = titulo;
  document.getElementById('rev-artista').value = artista;
  
  // Reseta as estrelas para o novo card
  estrelasSelecionadas = 0;
  document.querySelectorAll('.star').forEach(s => s.classList.remove('ativa'));

  // Mostra o modal
  const modal = document.getElementById('modal-overlay');
  if (modal) modal.style.display = 'flex';
}

// Garante que o navegador conheça a função do botão
window.prepararModalReview = prepararModalReview;