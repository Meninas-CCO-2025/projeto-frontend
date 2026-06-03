/* ============================================================
   LÓGICA DAS VITRINES (APP.HTML)
   ============================================================ */

async function renderizarApp() {
    const vitrine = document.getElementById('vitrine-musicas');
    if (!vitrine) return;

    try {
        const { data, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .limit(5);

        if (error) throw error;

        const favsLocais = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

        vitrine.innerHTML = data.map(item => {
            const isFav = favsLocais.includes(String(item.id));
            return `
                <div class="music-card-container" style="position:relative;">
                    <div class="music-card">
                        <div class="music-cover">
                            <img src="${item.capa_url}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                        </div>
                        <div style="display:flex; justify-content:space-between; align-items:flex-end; margin-top:10px;">
                            <div style="flex:1; min-width:0;">
                                <h5 class="music-title-card" style="margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">
                                    ${item.titulo}
                                </h5>
                                <p class="music-artist-card" style="margin:0;">
                                    ${item.artista}
                                </p>
                            </div>
                            <button 
                                onclick="alternarFavoritoGlobal('${item.id}')"
                                id="btn-fav-main-${item.id}"
                                style="background:none; border:none; font-size:1.4rem; cursor:pointer; margin-left:10px;"
                            >
                                ${isFav ? '❤️' : '🤍'}
                            </button>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
    }
}



/* ============================================================
   LÓGICA DAS VITRINES
   ============================================================ */
async function renderizarApp() {
    // Verifica se o elemento da vitrine existe na página antes de tentar carregar os dados
    const vitrine = document.getElementById('vitrine-musicas');
    if (!vitrine) return;

    // Carrega as músicas para a vitrine do app.html, limitando a 5 para não sobrecarregar a página inicial
    try {
        const { data, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .limit(5); 

        if (error) throw error;

        // Pega os favoritos salvos para marcar o coração preenchido
        const favsLocais = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

        // Renderiza os cards de música, incluindo o estado do coração de favorito
        vitrine.innerHTML = data.map(item => {
            const isFav = favsLocais.includes(String(item.id));
            return `
                <div class="music-card-container" style="position:relative;">
                    <div class="music-card">
                        <div class="music-cover">
                            <img src="${item.capa_url}" alt="${item.titulo}" onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                        </div>
                     <div style="
    display:flex;
    justify-content:space-between;
    align-items:flex-end;
    margin-top:10px;
">

    <div style="flex:1; min-width:0;">

        <h5 class="music-title-card" style="
            margin:0;
            white-space:nowrap;
            overflow:hidden;
            text-overflow:ellipsis;
        ">
            ${item.titulo}
        </h5>

        <p class="music-artist-card" style="margin:0;">
            ${item.artista}
        </p>

    </div>

    <button 
        onclick="alternarFavoritoDoMain('${item.id}')"
        id="btn-fav-main-${item.id}"
        style="
            background:none;
            border:none;
            font-size:1.4rem;
            cursor:pointer;
            margin-left:10px;
        "
    >
        ${isFav ? '❤️' : '🤍'}
    </button>

</div>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) {
        console.error("Erro ao carregar vitrine:", err);
    }
}


/* ============================================================
   SISTEMA DE ARTISTAS (ESTILO SPOTIFY - VOLTOU AO ORIGINAL)
   ============================================================ */

   // Função para carregar os artistas únicos da tabela de músicas e renderizar os cards de artista na seção de explorar
async function carregarArtistasExplorar() {
    const container = document.getElementById('lista-artistas');
    if (!container) return;
    const cores = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF6', '#FFC300'];

    try {
        const { data: musicas } = await conexaoSupabase.from('musicas').select('artista');
        const artistasUnicos = [...new Set(musicas.map(m => m.artista))].filter(a => a);

        // Renderiza os cards de artista, usando o índice para escolher a cor do círculo e criando um ID limpo para o dropdown de músicas
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

// Função para mostrar/esconder o dropdown de músicas de um artista, e carregar as músicas do artista quando o dropdown for aberto
async function toggleMusicasArtista(nomeArtista) {
    const idLimpo = nomeArtista.replace(/\s+/g, '');
    const dropdown = document.getElementById(`musicas-${idLimpo}`);
    
    if (dropdown.style.display === 'block') { 
        dropdown.style.display = 'none'; 
        return; 
    }

    // Esconde todos os outros dropdowns de músicas e mostra o do artista clicado
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

        const favsLocais = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

        // Renderiza a lista de músicas do artista, incluindo o estado do coração de favorito e um layout simples para cada faixa
        dropdown.innerHTML = musicas.map(m => {
            const isFav = favsLocais.includes(String(m.id));
            return `
                <div class="track-item" style="display:flex; align-items:center; justify-content:between; padding:5px 10px;">
                    <img src="${m.capa_url}" class="track-img" onerror="this.src='https://via.placeholder.com/45?text=🎵'">
                    <div class="track-info">
                        <p class="track-name">${m.titulo}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        
                        <button onclick="alternarFavoritoDoMain('${m.id}')" id="btn-fav-main-${m.id}" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { 
        dropdown.innerHTML = "<p style='color:red; font-size:0.7rem;'>Erro ao carregar.</p>"; 
    }
}

/* ============================================================
   APENAS LÓGICA DE FAVORITOS (INDEPENDENTE)
   ============================================================ */

   // Função para alternar o estado de favorito de uma música, salvando no banco de dados 
async function toggleFavorito(musicaId, botao) {
    if (window.event) window.event.stopPropagation(); 
    
    try {
        const db = window.conexaoSupabase;
        const { data: { user } } = await db.auth.getUser();
        
        if (!user) {
            alert("Precisas de estar logado para favoritar músicas!");
            return;
        }

        if (botao.classList.contains('ativo')) {
            const { error } = await db
                .from('favoritos')
                .delete()
                .eq('user_id', user.id)
                .eq('musica_id', musicaId);

            if (error) throw error;
            botao.classList.remove('ativo');
            botao.innerHTML = '♡';
        } else {
            const { error } = await db
                .from('favoritos')
                .insert([{ user_id: user.id, musica_id: musicaId }]);

            if (error) throw error;
            botao.classList.add('ativo');
            botao.innerHTML = '♥';
        }
    } catch (err) {
        console.error("Erro ao favoritar:", err);
    }
}

// Função totalmente isolada para manipular o coração e sincronizar com o localStorage das outras páginas

function alternarFavoritoDoMain(id) {
    if (window.event) window.event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    const botoes = document.querySelectorAll(`[id="btn-fav-main-${id}"]`);
    
    if (favs.includes(String(id)) || favs.includes(parseInt(id))) {
        favs = favs.filter(f => String(f) !== String(id) && parseInt(f) !== parseInt(id));
        botoes.forEach(btn => { if(btn) btn.innerText = '🤍'; });
    } else {
        favs.push(String(id));
        botoes.forEach(btn => { if(btn) btn.innerText = '❤️'; });
    }
    localStorage.setItem('meus_favoritos', JSON.stringify(favs));
    
    // Se a função de atualizar o contador do perfil existir na página atual, executa ela
    if (typeof actualizarContadorFavoritos === 'function') actualizarContadorFavoritos();
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
    renderizarApp();            
    carregarDestaquesPublicos(); 
    carregarFeedGlobal();        

    // ==========================================
    // NOVO: Lógica para abrir a aba correta no Login
    // ==========================================
    if (window.location.pathname.includes('login.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        
        // Se a URL tiver ?tab=login, abre o login. Senão, padrão é cadastro.
        if (tab === 'login') {
            showTab('login');
        } else {
            showTab('cadastro');
        }
    }
});

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
   SISTEMA DE PLAYLISTS 
   ============================================================ */

   // Variável global para armazenar as músicas selecionadas para a playlist
function prepararModalPlaylist() {
    musicasSelecionadasParaPlaylist = [];
    document.getElementById('play-nome').value = '';
    document.getElementById('busca-musica-playlist').value = '';
    document.getElementById('lista-musicas-selecionadas').innerHTML = '<p style="color:gray; font-size:0.8rem; text-align:center;">Nenhuma música adicionada</p>';
    document.getElementById('modal-playlist').style.display = 'flex';
}

// Função para buscar músicas enquanto o usuário digita no campo de busca da playlist
async function buscarMusicasParaPlaylist() {
    const termo = document.getElementById('busca-musica-playlist').value.trim();
    const lista = document.getElementById('sugestoes-playlist');

    if (termo.length < 2) { lista.style.display = 'none'; return; }

    try {
        const { data: musicas } = await conexaoSupabase.from('musicas').select('*')
            .or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`).limit(5);

            // Renderiza as sugestões de músicas para adicionar na playlist
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

// Função para adicionar uma música na lista de seleção da playlist, evitando duplicatas
function adicionarMusicaLista(titulo, artista, id) {
    if (musicasSelecionadasParaPlaylist.find(m => m.id === id)) return;
    musicasSelecionadasParaPlaylist.push({ id, titulo, artista });
    document.getElementById('busca-musica-playlist').value = '';
    document.getElementById('sugestoes-playlist').style.display = 'none';
    renderizarMusicasSelecionadas();
}

// Função para renderizar as músicas selecionadas na playlist, mostrando o título, artista e um botão para remover da lista 
function renderizarMusicasSelecionadas() {
    const container = document.getElementById('lista-musicas-selecionadas');
    if (musicasSelecionadasParaPlaylist.length === 0) {
        container.innerHTML = '<p style="color:gray; font-size:0.8rem; text-align:center;">Nenhuma música adicionada</p>';
        return;
    }
    // Renderiza cada música selecionada com um botão de remoção, usando o índice do array para identificar qual música remover
    container.innerHTML = musicasSelecionadasParaPlaylist.map((m, index) => `
        <div class="d-flex justify-content-between align-items-center mb-2 p-2" style="background:rgba(232, 24, 86, 0.1); border-radius:5px; border: 1px solid #e81856;">
            <span style="font-size:0.9rem; color:white;">${m.titulo} - ${m.artista}</span>
            <button onclick="removerMusicaLista(${index})" style="background:none; border:none; color:#e81856; font-weight:bold;">✕</button>
        </div>
    `).join('');
}

// Função para remover uma música da lista de seleção usando o índice do array, e depois re-renderizar a lista atualizada
function removerMusicaLista(index) {
    musicasSelecionadasParaPlaylist.splice(index, 1);
    renderizarMusicasSelecionadas();
}

// Função para salvar a playlist no banco de dados
async function salvarPlaylist() {
    const nome = document.getElementById('play-nome').value;
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (!nome || musicasSelecionadasParaPlaylist.length === 0) { alert("Preencha tudo!"); return; }

    const { error } = await conexaoSupabase.from('playlists').insert([{ nome, usuario_id: user.nome, musicas: musicasSelecionadasParaPlaylist }]);
    if (error) { alert("Erro: " + error.message); } 
    else { alert("Playlist salva!"); fecharModalPlaylist(); }
}

// Função para fechar o modal de criação de playlist, limpando os dados temporários e escondendo o modal
function fecharModalPlaylist() {
    document.getElementById('modal-playlist').style.display = 'none';
}

/* ============================================================
   SISTEMA DE ARTISTAS (ESTILO SPOTIFY - VOLTOU AO ORIGINAL)
   ============================================================ */

   // Função para carregar os artistas únicos da tabela de músicas e renderizar os cards de artista na seção de explorar
async function carregarArtistasExplorar() {
    const container = document.getElementById('lista-artistas');
    if (!container) return;
    const cores = ['#FF5733', '#33FF57', '#3357FF', '#F333FF', '#FF33A8', '#33FFF6', '#FFC300'];

    try {
        const { data: musicas } = await conexaoSupabase.from('musicas').select('artista');
        const artistasUnicos = [...new Set(musicas.map(m => m.artista))].filter(a => a);

        // Renderiza os cards de artista, usando o índice para escolher a cor do círculo e criando um ID limpo para o dropdown de músicas
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

// Função para mostrar/esconder o dropdown de músicas de um artista, e carregar as músicas do artista quando o dropdown for aberto
async function toggleMusicasArtista(nomeArtista) {
    const idLimpo = nomeArtista.replace(/\s+/g, '');
    const dropdown = document.getElementById(`musicas-${idLimpo}`);
    
    if (dropdown.style.display === 'block') { 
        dropdown.style.display = 'none'; 
        return; 
    }

    // Esconde todos os outros dropdowns de músicas e mostra o do artista clicado
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

        const favsLocais = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

        // Renderiza a lista de músicas do artista, incluindo o estado do coração de favorito e um layout simples para cada faixa
        dropdown.innerHTML = musicas.map(m => {
            const isFav = favsLocais.includes(String(m.id));
            return `
                <div class="track-item" style="display:flex; align-items:center; justify-content:between; padding:5px 10px;">
                    <img src="${m.capa_url}" class="track-img" onerror="this.src='https://via.placeholder.com/45?text=🎵'">
                    <div class="track-info">
                        <p class="track-name">${m.titulo}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        
                        <button onclick="alternarFavoritoDoMain('${m.id}')" id="btn-fav-main-${m.id}" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">
                            ${isFav ? '❤️' : '🤍'}
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    } catch (err) { 
        dropdown.innerHTML = "<p style='color:red; font-size:0.7rem;'>Erro ao carregar.</p>"; 
    }
}


/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    renderizarApp();
});

// Exportar funções para o escopo global
window.renderizarApp = renderizarApp;
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