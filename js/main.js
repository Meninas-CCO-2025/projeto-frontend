
// 1. CONFIGURAÇÃO
var URL_BANCO = 'https://aolewmjptkjcbhjczrjm.supabase.co';
var CHAVE_BANCO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGV3bWpwdGtqY2JoamN6cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkzNjAsImV4cCI6MjA5Mzg0NTM2MH0.K7pGC4EfuULjlVgZT2RMXa9oZ5cawY23OOj7nneXm4M';

// CORREÇÃO: O SDK do Supabase usa 'supabase' e não 'window.supabase'
if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(URL_BANCO, CHAVE_BANCO);
}
var conexaoSupabase = window.supabaseClient;

// --- FUNÇÃO PARA RENDERIZAR CARDS NA INDEX.HTML (PÚBLICO) ---
async function carregarDestaquesPublicos() {
    const vitrine = document.getElementById('vitrine-publica');
    if (!vitrine) return; // Só executa se estiver na index.html

    try {
        const { data: musicas, error } = await conexaoSupabase.from('musicas').select('*').limit(8);
        if (error) throw error;

        vitrine.innerHTML = musicas.map(m => `
            <div class="music-card" onclick="exigirLogin()">
                <div class="music-card-favorite">🤍</div>
                <div class="music-cover">
                    <img src="${m.capa_url}" style="width:100%; height:100%; object-fit:cover;" 
                         onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                </div>
                <h5 class="music-title">${m.titulo}</h5>
                <p class="music-artist">${m.artista}</p>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar destaques:", err);
        vitrine.innerHTML = "<p>Erro ao carregar músicas.</p>";
    }
}

// --- FUNÇÃO PARA RENDERIZAR CARDS NA APP.HTML (ÁREA LOGADA) ---
async function renderizarApp() {
    const vitrine = document.getElementById('vitrine-musicas');
    if (!vitrine) return; // Só executa se estiver na app.html

    try {
        const { data, error } = await conexaoSupabase.from('musicas').select('*');
        if (error) throw error;

        vitrine.innerHTML = ""; 
        vitrine.className = "row"; 

        data.forEach(item => {
            const linkDaFoto = item.capa_url; 

            vitrine.innerHTML += `
                <div class="col-6 col-md-3 mb-4">
                    <div class="music-card" style="background:#1e1b2e; padding:15px; border-radius:16px; height:100%; display:flex; flex-direction:column; border: 1px solid rgba(255,255,255,0.1);">
                        <div class="music-cover" style="width:100%; aspect-ratio:1/1; border-radius:12px; overflow:hidden; background:#2a2540; margin-bottom:15px; display:flex; align-items:center; justify-content:center;">
                            ${linkDaFoto ? 
                                `<img src="${linkDaFoto}" style="width:100%; height:100%; object-fit:cover;" onerror="this.parentElement.innerHTML='<span style=\'font-size:3rem\'>🎵</span>'">` : 
                                `<span style="font-size:3rem;">🎵</span>`
                            }
                        </div>
                        <div style="flex-grow:1;">
                            <h5 style="color:white; font-size:1rem; font-weight:700; margin-bottom:4px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                ${item.titulo}
                            </h5>
                            <p style="color:#a89ec9; font-size:0.85rem; margin-bottom:15px;">${item.artista}</p>
                        </div>
                        
                    </div>
                </div>`;
        });
    } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
    }
}

// --- FUNÇÕES DE LOGIN E CADASTRO (MANTIDAS CONFORME SOLICITADO) ---
async function login() {
    var email = document.getElementById('login-email').value;
    var senha = document.getElementById('login-senha').value;
    var erroMsg = document.getElementById('erro-login');

    const { data, error } = await conexaoSupabase.auth.signInWithPassword({ email, password: senha });

    if (error) {
        if (erroMsg) erroMsg.innerText = "E-mail ou senha incorretos.";
    } else {
        localStorage.setItem('usuario', JSON.stringify({
            nome: data.user.user_metadata.full_name || 'Usuário',
            email: data.user.email
        }));
        window.location.href = 'app.html';
    }
}

async function cadastrar() {
    var email = document.getElementById('cad-email').value;
    var senha = document.getElementById('cad-senha').value;
    var nome = document.getElementById('cad-nome').value;
    var erroMsg = document.getElementById('erro-cadastro');

    const { data, error } = await conexaoSupabase.auth.signUp({
        email, password: senha, options: { data: { full_name: nome } }
    });

    if (error) {
        if (erroMsg) erroMsg.innerText = error.message;
    } else {
        alert("Cadastro realizado!");
        showTab('login');
    }
}

// --- CONTROLE DE INTERFACE ---
function showTab(aba) {
    var formCad = document.getElementById('form-cadastro');
    var formLog = document.getElementById('form-login');
    if (formCad && formLog) {
        formCad.style.display = aba === 'cadastro' ? 'block' : 'none';
        formLog.style.display = aba === 'login' ? 'block' : 'none';
    }
}

function prepararModalReview(titulo, artista) {
    if(document.getElementById('rev-musica')) document.getElementById('rev-musica').value = titulo;
    if(document.getElementById('rev-artista')) document.getElementById('rev-artista').value = artista;
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'flex';
}

function exigirLogin() {
    const modal = document.getElementById('modal-login-req');
    if (modal) modal.style.display = 'flex';
}

function fecharModalLogin() {
    const modal = document.getElementById('modal-login-req');
    if (modal) modal.style.display = 'none';
}

// --- INICIALIZAÇÃO ---
document.addEventListener('DOMContentLoaded', () => {
    // Se existir a vitrine da app.html, carrega a versão logada
    if (document.getElementById('vitrine-musicas')) {
        renderizarApp();
    }
    // Se existir a vitrine da index.html, carrega a versão pública
    if (document.getElementById('vitrine-publica')) {
        carregarDestaquesPublicos();
    }
});

// EXPOSIÇÃO GLOBAL
window.login = login;
window.cadastrar = cadastrar;
window.showTab = showTab;
window.prepararModalReview = prepararModalReview;
window.exigirLogin = exigirLogin;
window.fecharModalLogin = fecharModalLogin;

// --- FUNÇÃO DE SCROLL PARA AS FLECHAS ---
function scrollVitrine(direcao) {
    const vitrine = document.getElementById('vitrine-publica');
    if (!vitrine) return;

    // Calcula quanto scrollar (300px por clique)
    const larguraScroll = 300; 
    vitrine.scrollBy({
        left: direcao * larguraScroll,
        behavior: 'smooth' // Faz o movimento ser deslizado
    });
}

// Expõe a função globalmente
window.scrollVitrine = scrollVitrine;