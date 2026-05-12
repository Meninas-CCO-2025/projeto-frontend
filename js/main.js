// 1. CONFIGURAÇÃO
var URL_BANCO = 'https://aolewmjptkjcbhjczrjm.supabase.co';
var CHAVE_BANCO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGV3bWpwdGtqY2JoamN6cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkzNjAsImV4cCI6MjA5Mzg0NTM2MH0.K7pGC4EfuULjlVgZT2RMXa9oZ5cawY23OOj7nneXm4M';

// CORREÇÃO: O SDK do Supabase usa 'supabase' e não 'window.supabase'
if (!window.supabaseClient) {
    window.supabaseClient = supabase.createClient(URL_BANCO, CHAVE_BANCO);
}
var conexaoSupabase = window.supabaseClient;

/* ============================================================
   SISTEMA DE LOGIN E CADASTRO 
   ============================================================ */
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

function showTab(aba) {
    var formCad = document.getElementById('form-cadastro');
    var formLog = document.getElementById('form-login');
    if (formCad && formLog) {
        formCad.style.display = aba === 'cadastro' ? 'block' : 'none';
        formLog.style.display = aba === 'login' ? 'block' : 'none';
    }
}

function logout() {
    localStorage.removeItem('usuario');
    if (window.location.pathname.includes('/pages/')) {
        window.location.href = '../index.html';
    } else {
        window.location.href = 'index.html';
    }
}

/* ============================================================
   LÓGICA DAS VITRINES (INDEX E APP)
   ============================================================ */

// INDEX.HTML 
async function carregarDestaquesPublicos() {
    const vitrine = document.getElementById('vitrine-publica');
    if (!vitrine) return;

    try {
        const { data: musicas, error } = await conexaoSupabase.from('musicas').select('*').limit(12);
        if (error) throw error;

        vitrine.innerHTML = musicas.map(m => `
            <div class="music-card-container">
                <div class="music-card" onclick="exigirLogin()">
                    <div class="music-cover">
                        <img src="${m.capa_url}" alt="${m.titulo}" onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                    </div>
                    <h5 class="music-title-card">${m.titulo}</h5>
                    <p class="music-artist-card">${m.artista}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar destaques:", err);
    }
}

// APP.HTML (Logado)
async function renderizarApp() {
    const vitrine = document.getElementById('vitrine-musicas');
    if (!vitrine) return;

    try {
        const { data, error } = await conexaoSupabase.from('musicas').select('*');
        if (error) throw error;

        vitrine.innerHTML = data.map(item => `
            <div class="music-card-container">
                <div class="music-card">
                    <div class="music-cover">
                        <img src="${item.capa_url}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                    </div>
                    <h5 class="music-title-card">${item.titulo}</h5>
                    <p class="music-artist-card">${item.artista}</p>
                </div>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
    }
}

// Função de Scroll das Setas
function scrollVitrine(direcao) {
    const vitrine = document.getElementById('vitrine-publica');
    if (!vitrine) return;
    const larguraScroll = 300; 
    vitrine.scrollBy({ left: direcao * larguraScroll, behavior: 'smooth' });
}

/* ============================================================
   SISTEMA DE REVIEWS GLOBAIS
   ============================================================ */
function carregarReviewsGlobais() {
    const container = document.getElementById('feed-reviews-global');
    if (!container) return;

    const reviews = JSON.parse(localStorage.getItem('reviews_globais') || '[]');
    if (reviews.length === 0) {
        container.innerHTML = "<p style='color:gray; text-align:center;'>Ainda não há reviews.</p>";
        return;
    }

    container.innerHTML = reviews.map(r => `
        <div class="review-card mb-3">
            <div class="review-header d-flex align-items-center">
                <div class="review-avatar">🎧</div>
                <div class="ms-2">
                    <p class="review-user m-0">@${r.usuario}</p>
                    <p class="review-music m-0"><strong>${r.musica}</strong> — ${r.artista}</p>
                </div>
                <div class="ms-auto" style="color:#e81856">${r.estrelas}</div>
            </div>
            <p class="review-text mt-2">"${r.texto}"</p>
        </div>
    `).join('');
}

/* ============================================================
   MODAIS E INTERFACE
   ============================================================ */
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

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('vitrine-musicas')) renderizarApp();
    if (document.getElementById('vitrine-publica')) carregarDestaquesPublicos();
    carregarReviewsGlobais();

    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    const displayNome = document.getElementById('nome-usuario');
    if(displayNome && user.nome) displayNome.textContent = `Olá, ${user.nome}!`;
});

// EXPOSIÇÃO GLOBAL 
window.login = login;
window.cadastrar = cadastrar;
window.showTab = showTab;
window.logout = logout;
window.scrollVitrine = scrollVitrine;
window.prepararModalReview = prepararModalReview;
window.exigirLogin = exigirLogin;
window.fecharModalLogin = fecharModalLogin;

// --- FUNÇÃO PARA BUSCAR MÚSICAS DENTRO DO MODAL DE REVIEW ---
async function buscarSugestoesReview() {
    const termo = document.getElementById('rev-musica').value.trim();
    const lista = document.getElementById('sugestoes-review');

    if (termo.length < 2) {
        lista.style.display = 'none';
        return;
    }

    try {
        const { data: musicas, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`)
            .limit(5);

        if (error) throw error;

        if (musicas.length > 0) {
            lista.style.display = 'block';
            lista.innerHTML = musicas.map(m => `
                <div class="sugestao-item" 
                     style="padding:10px; cursor:pointer; border-bottom:1px solid rgba(255,255,255,0.1); display:flex; align-items:center; gap:10px;"
                     onclick="selecionarMusicaReview('${m.titulo}', '${m.artista}')">
                    <img src="${m.capa_url}" style="width:30px; height:30px; border-radius:4px; object-fit:cover;">
                    <div>
                        <div style="font-weight:bold; font-size:0.9rem; color:white;">${m.titulo}</div>
                        <div style="font-size:0.8rem; color:#a89ec9;">${m.artista}</div>
                    </div>
                </div>
            `).join('');
        } else {
            lista.style.display = 'none';
        }
    } catch (err) {
        console.error("Erro ao buscar sugestões:", err);
    }
}

// --- LOGICA DAS ESTRELINHAS ---
let notaSelecionada = 0;

function selecionarEstrelas(n) {
    notaSelecionada = n;
    const estrelas = document.querySelectorAll('.star');
    
    estrelas.forEach((estrela, index) => {
        if (index < n) {
            estrela.classList.add('active');
            estrela.style.color = "#ffc107"; // Amarelo/Dourado
        } else {
            estrela.classList.remove('active');
            estrela.style.color = "#444"; // Cor apagada
        }
    });
    console.log("Nota selecionada:", notaSelecionada);
}

// Expõe para o HTML conseguir clicar
window.selecionarEstrelas = selecionarEstrelas;

// Função para quando clicar na música da lista
function selecionarMusicaReview(titulo, artista) {
    document.getElementById('rev-musica').value = titulo;
    document.getElementById('rev-artista').value = artista;
    document.getElementById('sugestoes-review').style.display = 'none';
}

// Função para fechar o modal e limpar tudo
function fecharModal() {
    const modal = document.getElementById('modal-overlay');
    if (modal) modal.style.display = 'none';
    document.getElementById('rev-musica').value = '';
    document.getElementById('rev-artista').value = '';
    document.getElementById('rev-texto').value = '';
    document.getElementById('sugestoes-review').style.display = 'none';
}

// Expõe as funções globalmente
window.buscarSugestoesReview = buscarSugestoesReview;
window.selecionarMusicaReview = selecionarMusicaReview;
window.fecharModal = fecharModal;

function salvarReview() {
    const musica = document.getElementById('rev-musica').value;
    const artista = document.getElementById('rev-artista').value;
    const texto = document.getElementById('rev-texto').value;
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{"nome":"Anônimo"}');

    if (!musica || notaSelecionada === 0) {
        alert("Por favor, selecione uma música e dê uma nota!");
        return;
    }

    const novaReview = {
        usuario: usuario.nome,
        musica: musica,
        artista: artista,
        texto: texto,
        estrelas: "★".repeat(notaSelecionada) + "☆".repeat(5 - notaSelecionada),
        data: new Date().toLocaleDateString()
    };

    // Salva no LocalStorage (ou envia para o Supabase se preferir)
    let reviews = JSON.parse(localStorage.getItem('reviews_globais') || '[]');
    reviews.unshift(novaReview);
    localStorage.setItem('reviews_globais', JSON.stringify(reviews));

    alert("Review publicada!");
    fecharModal(); // Fecha e limpa
    carregarReviewsGlobais(); // Atualiza o feed
}
window.salvarReview = salvarReview;