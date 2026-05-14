var URL_BANCO = 'https://aolewmjptkjcbhjczrjm.supabase.co';
var CHAVE_BANCO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGV3bWpwdGtqY2JoamN6cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkzNjAsImV4cCI6MjA5Mzg0NTM2MH0.K7pGC4EfuULjlVgZT2RMXa9oZ5cawY23OOj7nneXm4M';

// IMPORTANTE: Criar a conexão de forma GLOBAL
window.conexaoSupabase = supabase.createClient(URL_BANCO, CHAVE_BANCO);
var conexaoSupabase = window.conexaoSupabase;

// Variáveis de controle global
let musicasSelecionadasParaPlaylist = [];
let notaSelecionada = 0;

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
    const formCad = document.getElementById('form-cadastro');
    const formLog = document.getElementById('form-login');
    const btnCad = document.getElementById('tab-cadastro');
    const btnLog = document.getElementById('tab-login');

    if (aba === 'cadastro') {
        // Exibição dos formulários
        if (formCad) formCad.style.display = 'block';
        if (formLog) formLog.style.display = 'none';
        
        // Troca do destaque visual (rosa)
        if (btnCad) btnCad.classList.add('active');
        if (btnLog) btnLog.classList.remove('active');
    } else {
        // Exibição dos formulários
        if (formCad) formCad.style.display = 'none';
        if (formLog) formLog.style.display = 'block';
        
        // Troca do destaque visual (rosa)
        if (btnLog) btnLog.classList.add('active');
        if (btnCad) btnCad.classList.remove('active');
    }
}

function logout() {
    localStorage.removeItem('usuario');
    window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
}

/* ============================================================
   LÓGICA DAS VITRINES
   ============================================================ */
async function renderizarApp() {
    const vitrine = document.getElementById('vitrine-musicas');
    if (!vitrine) return;

    try {
        // .limit(8) fará com que apenas as 8 primeiras músicas cadastradas apareçam
        const { data, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .limit(5); 

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

/* ============================================================
   SISTEMA DE PLAYLISTS (MANTIDO)
   ============================================================ */
function prepararModalPlaylist() {
    musicasSelecionadasParaPlaylist = [];
    document.getElementById('play-nome').value = '';
    document.getElementById('busca-musica-playlist').value = '';
    document.getElementById('lista-musicas-selecionadas').innerHTML = '<p style="color:gray; font-size:0.8rem; text-align:center;">Nenhuma música adicionada</p>';
    document.getElementById('modal-playlist').style.display = 'flex';
}

async function buscarMusicasParaPlaylist() {
    const termo = document.getElementById('busca-musica-playlist').value.trim();
    const lista = document.getElementById('sugestoes-playlist');

    if (termo.length < 2) { lista.style.display = 'none'; return; }

    try {
        const { data: musicas } = await conexaoSupabase.from('musicas').select('*')
            .or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`).limit(5);

        if (musicas && musicas.length > 0) {
            lista.style.display = 'block';
            lista.innerHTML = musicas.map(m => `
                <div class="sugestao-item" style="padding:10px; cursor:pointer; color:white;" onclick="adicionarMusicaLista('${m.titulo}', '${m.artista}', '${m.id}')">
                    + ${m.titulo} <small style="color:#a89ec9">(${m.artista})</small>
                </div>
            `).join('');
        } else { lista.style.display = 'none'; }
    } catch (err) { console.error(err); }
}

function adicionarMusicaLista(titulo, artista, id) {
    if (musicasSelecionadasParaPlaylist.find(m => m.id === id)) return;
    musicasSelecionadasParaPlaylist.push({ id, titulo, artista });
    document.getElementById('busca-musica-playlist').value = '';
    document.getElementById('sugestoes-playlist').style.display = 'none';
    renderizarMusicasSelecionadas();
}

function renderizarMusicasSelecionadas() {
    const container = document.getElementById('lista-musicas-selecionadas');
    if (musicasSelecionadasParaPlaylist.length === 0) {
        container.innerHTML = '<p style="color:gray; font-size:0.8rem; text-align:center;">Nenhuma música adicionada</p>';
        return;
    }
    container.innerHTML = musicasSelecionadasParaPlaylist.map((m, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2" style="background:rgba(232, 24, 86, 0.1); border-radius:5px; border: 1px solid #e81856;">
            <span style="font-size:0.9rem; color:white;">${m.titulo} - ${m.artista}</span>
            <button onclick="removerMusicaLista(${index})" style="background:none; border:none; color:#e81856; font-weight:bold;">✕</button>
        </div>
    `).join('');
}

function removerMusicaLista(index) {
    musicasSelecionadasParaPlaylist.splice(index, 1);
    renderizarMusicasSelecionadas();
}

async function salvarPlaylist() {
    const nome = document.getElementById('play-nome').value;
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!nome || musicasSelecionadasParaPlaylist.length === 0) { alert("Preencha tudo!"); return; }

    const { error } = await conexaoSupabase.from('playlists').insert([{ nome, usuario_id: user.nome, musicas: musicasSelecionadasParaPlaylist }]);
    if (error) { alert("Erro: " + error.message); } 
    else { alert("Playlist salva!"); fecharModalPlaylist(); }
}

function fecharModalPlaylist() {
    document.getElementById('modal-playlist').style.display = 'none';
}

/* ============================================================
   SISTEMA DE ARTISTAS (ESTILO SPOTIFY - VOLTOU AO ORIGINAL)
   ============================================================ */
async function carregarArtistasExplorar() {
    const container = document.getElementById('lista-artistas');
    if (!container) return;
    const cores = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF6', '#FFC300'];

    try {
        const { data: musicas } = await conexaoSupabase.from('musicas').select('artista');
        const artistasUnicos = [...new Set(musicas.map(m => m.artista))].filter(a => a);

        container.innerHTML = artistasUnicos.map((artista, index) => {
            const idLimpo = artista.replace(/\s+/g, '');
            return `
            <div class="artist-item d-flex flex-column align-items-center mb-4">
                <div class="artist-circle" style="background-color: ${cores[index % cores.length]};" onclick="toggleMusicasArtista('${artista}')">
                    <span style="font-size: 3rem;">👤</span>
                </div>
                <p class="artist-name text-white m-0">${artista}</p>
                <div id="musicas-${idLimpo}" class="musicas-dropdown-v2" style="display: none; width: 100%; max-width: 250px; margin-top: 10px;">
                    <p style="font-size:0.8rem; color:gray;">Carregando músicas...</p>
                </div>
            </div>
            `;
        }).join('');
    } catch (err) { console.error(err); }
}

async function toggleMusicasArtista(nomeArtista) {
    const idLimpo = nomeArtista.replace(/\s+/g, '');
    const dropdown = document.getElementById(`musicas-${idLimpo}`);
    
    if (dropdown.style.display === 'block') { 
        dropdown.style.display = 'none'; 
        return; 
    }

    document.querySelectorAll('.musicas-dropdown-v2').forEach(el => el.style.display = 'none');
    dropdown.style.display = 'block';

    try {
        const { data: musicas } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .eq('artista', nomeArtista);

        if (!musicas || musicas.length === 0) {
            dropdown.innerHTML = "<p style='color:gray; font-size:0.8rem; padding:10px;'>Sem faixas.</p>";
            return;
        }

        dropdown.innerHTML = musicas.map(m => `
            <div class="track-item">
                <img src="${m.capa_url}" class="track-img" onerror="this.src='https://via.placeholder.com/45?text=🎵'">
                <div class="track-info">
                    <p class="track-name">${m.titulo}</p>
                </div>
            </div>
        `).join('');
    } catch (err) { 
        dropdown.innerHTML = "<p style='color:red; font-size:0.7rem;'>Erro ao carregar.</p>"; 
    }
}

/* ============================================================
   SISTEMA DE REVIEWS
   ============================================================ */
async function buscarSugestoesReview() {
    const termo = document.getElementById('rev-musica').value.trim();
    const lista = document.getElementById('sugestoes-review');
    if (termo.length < 2) { lista.style.display = 'none'; return; }

    const { data: musicas } = await conexaoSupabase.from('musicas').select('*').or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`).limit(5);
    if (musicas && musicas.length > 0) {
        lista.style.display = 'block';
        lista.innerHTML = musicas.map(m => `
            <div class="sugestao-item" style="padding:10px; cursor:pointer;" onclick="selecionarMusicaReview('${m.titulo}', '${m.artista}')">
                <div style="font-weight:bold; color:white;">${m.titulo}</div>
                <div style="font-size:0.8rem; color:#a89ec9;">${m.artista}</div>
            </div>
        `).join('');
    }
}

function selecionarMusicaReview(titulo, artista) {
    document.getElementById('rev-musica').value = titulo;
    document.getElementById('rev-artista').value = artista;
    document.getElementById('sugestoes-review').style.display = 'none';
}

function selecionarEstrelas(n) {
    notaSelecionada = n;
    document.querySelectorAll('.star').forEach((s, i) => { s.style.color = i < n ? '#e81856' : '#444'; });
}

async function salvarReview() {
    const musica = document.getElementById('rev-musica').value;
    const artista = document.getElementById('rev-artista').value;
    const texto = document.getElementById('rev-texto').value;
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{"nome":"Anônimo"}');

    if (!musica || notaSelecionada === 0) { alert("Preencha música e nota!"); return; }

    const { error } = await conexaoSupabase.from('reviews').insert([{ usuario: usuario.nome, musica, artista, texto, estrelas: notaSelecionada }]);
    if (error) { alert("Erro: " + error.message); } 
    else { alert("Publicado!"); fecharModal(); }
}

function prepararModalReview(titulo = '', artista = '') {
    if(document.getElementById('rev-musica')) document.getElementById('rev-musica').value = titulo;
    if(document.getElementById('rev-artista')) document.getElementById('rev-artista').value = artista;
    document.getElementById('modal-overlay').style.display = 'flex';
}

function fecharModal() {
    document.getElementById('modal-overlay').style.display = 'none';
    notaSelecionada = 0;
    document.querySelectorAll('.star').forEach(s => s.style.color = '#444');
    document.getElementById('rev-texto').value = '';
}

/* ============================================================
   FUNÇÕES PARA O INDEX (PÚBLICO)
   ============================================================ */

// Carrega os cards de música na vitrine do index.html
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

// Carrega as reviews recentes no feed do index.html
async function carregarFeedGlobal() {
    const feed = document.getElementById('feed-reviews-global');
    if (!feed) return;

    try {
        const { data: reviews, error } = await conexaoSupabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(10);

        if (error) throw error;

        if (!reviews || reviews.length === 0) {
            feed.innerHTML = '<p style="color:gray; text-align:center;">Nenhuma atividade recente.</p>';
            return;
        }

        feed.innerHTML = reviews.map(r => `
            <div class="review-card mb-3 p-3" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
                <div class="d-flex justify-content-between">
                    <strong style="color: var(--accent);">${r.usuario}</strong>
                    <span style="color: #FFC300;">${'★'.repeat(r.estrelas)}</span>
                </div>
                <div class="mt-2">
                    <span style="color: white; font-weight: bold;">${r.musica}</span> 
                    <small style="color: gray;">de ${r.artista}</small>
                </div>
                <p class="mt-2 mb-0" style="color: #ccc; font-style: italic;">"${r.texto || 'Sem comentário.'}"</p>
            </div>
        `).join('');
    } catch (err) {
        console.error("Erro ao carregar feed:", err);
    }
}

// Função para fazer o scroll lateral das setas no index
function scrollVitrine(id, distancia) {
    const el = document.getElementById(id);
    if (el) {
        el.scrollBy({ left: distancia, behavior: 'smooth' });
    }
}


/* ============================================================
   UI E FAB
   ============================================================ */
function toggleFab() {
    const options = document.getElementById('fab-options');
    options.style.display = options.style.display === 'flex' ? 'none' : 'flex';
}

document.addEventListener('DOMContentLoaded', () => {
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    
    // Se estiver no app.html (logado)
    if (document.getElementById('nome-usuario') && user.nome) {
        document.getElementById('nome-usuario').textContent = `Olá, ${user.nome}!`;
    }

    // Inicializa funções dependendo de qual página o usuário está
    carregarArtistasExplorar();
    renderizarApp();            // Para app.html
    carregarDestaquesPublicos(); // Para index.html
    carregarFeedGlobal();        // Para index.html
});

function exigirLogin() {
    alert('Faça login para acessar esta funcionalidade.');
}



window.scrollVitrine = scrollVitrine;
window.exigirLogin = exigirLogin;
window.toggleMusicasArtista = toggleMusicasArtista;
window.prepararModalPlaylist = prepararModalPlaylist;
window.buscarMusicasParaPlaylist = buscarMusicasParaPlaylist;
window.adicionarMusicaLista = adicionarMusicaLista;
window.removerMusicaLista = removerMusicaLista;
window.salvarPlaylist = salvarPlaylist;
window.fecharModalPlaylist = fecharModalPlaylist;
window.prepararModalReview = prepararModalReview;
window.selecionarEstrelas = selecionarEstrelas;
window.salvarReview = salvarReview;
window.fecharModal = fecharModal;
window.buscarSugestoesReview = buscarSugestoesReview;
window.selecionarMusicaReview = selecionarMusicaReview;
window.toggleFab = toggleFab;
window.login = login;
window.cadastrar = cadastrar;
window.showTab = showTab;
window.logout = logout;