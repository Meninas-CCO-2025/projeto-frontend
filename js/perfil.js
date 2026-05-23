window.addEventListener('DOMContentLoaded', async () => {
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (usuario.nome) {
        document.getElementById('perfil-nome').textContent = '@' + usuario.nome;
        document.getElementById('perfil-email').textContent = usuario.email || 'email@exemplo.com';
        
        // Preenche os inputs do modal com os dados atuais
        document.getElementById('novo-nome').value = usuario.nome;
        document.getElementById('novo-email').value = usuario.email || '';

        setTimeout(() => carregarDadosPessoais(usuario.nome), 600);
    } else {
        window.location.href = '../index.html';
    }
});

// --- FUNÇÕES DE CONFIGURAÇÃO (MODAL) ---

window.abrirModalConfig = () => document.getElementById('modal-config').style.display = 'flex';
window.fecharModalConfig = () => document.getElementById('modal-config').style.display = 'none';

async function salvarNome() {
    const db = window.conexaoSupabase;
    const novoNome = document.getElementById('novo-nome').value.trim();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const msg = document.getElementById('msg-nome');

    if (!novoNome || novoNome === usuario.nome) return;

    try {
        // Atualiza na tabela de perfis/usuarios (ajuste o nome da tabela conforme seu banco)
        const { error } = await db.from('usuarios').update({ nome: novoNome }).eq('id', usuario.id);
        
        if (error) throw error;

        // Atualiza localmente
        usuario.nome = novoNome;
        localStorage.setItem('usuario', JSON.stringify(usuario));
        document.getElementById('perfil-nome').textContent = '@' + novoNome;
        
        msg.textContent = "Nome atualizado com sucesso!";
        msg.style.color = "#00ff00";
    } catch (err) {
        msg.textContent = "Erro ao atualizar nome.";
        console.error(err);
    }
}

async function salvarEmail() {
    const db = window.conexaoSupabase;
    const novoEmail = document.getElementById('novo-email').value.trim();
    const usuario = JSON.parse(localStorage.getItem('usuario'));
    const msg = document.getElementById('msg-email');

    if (!novoEmail || novoEmail === usuario.email) return;

    try {
        const { error } = await db.from('usuarios').update({ email: novoEmail }).eq('id', usuario.id);
        
        if (error) throw error;

        usuario.email = novoEmail;
        localStorage.setItem('usuario', JSON.stringify(usuario));
        document.getElementById('perfil-email').textContent = novoEmail;
        
        msg.textContent = "E-mail atualizado!";
        msg.style.color = "#00ff00";
    } catch (err) {
        msg.textContent = "Erro ao atualizar e-mail.";
        console.error(err);
    }
}

window.confirmarDelecao = () => document.getElementById('modal-deletar').style.display = 'flex';
window.fecharModalDeletar = () => document.getElementById('modal-deletar').style.display = 'none';

async function deletarConta() {
    const db = window.conexaoSupabase;
    const usuario = JSON.parse(localStorage.getItem('usuario'));

    try {
        // 1. Apagar dados relacionados (Playlists, Reviews)
        await db.from('playlists').delete().eq('usuario_id', usuario.nome);
        await db.from('reviews').delete().eq('usuario', usuario.nome);
        
        // 2. Apagar o usuário
        const { error } = await db.from('usuarios').delete().eq('id', usuario.id);
        
        if (error) throw error;

        localStorage.clear();
        window.location.href = '../index.html';
    } catch (err) {
        alert("Erro ao deletar conta.");
        console.error(err);
    }
}

// --- LOGICA DE DADOS (REVIEWS, PLAYLISTS, FAVORITOS) ---

async function carregarDadosPessoais(nomeLogado) {
    const db = window.conexaoSupabase;
    if (!db) return;

    try {
        // Reviews
        const { data: reviews } = await db.from('reviews').select('*').eq('usuario', nomeLogado);
        const containerRev = document.getElementById('perfil-reviews-container');
        if (containerRev && reviews) {
            containerRev.innerHTML = reviews.length > 0 ? reviews.map(r => `
                <div class="col-12 mb-3" id="review-${r.id}">
                    <div style="background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; border:1px solid #e81856; position:relative;">
                        <button onclick="excluirReview('${r.id}')" style="position:absolute; right:15px; top:15px; background:none; border:none; color:#ff4d4d; cursor:pointer;">🗑️</button>
                        <h5 class="m-0 text-white">${r.musica}</h5>
                        <p class="m-0" style="color:#e81856;">${"★".repeat(r.estrelas)}</p>
                    </div>
                </div>`).join('') : '<p class="text-muted text-center w-100">Sem reviews.</p>';
            document.getElementById('stat-reviews').textContent = reviews.length;
        }

        await carregarGradePlaylists(nomeLogado);
        atualizarContadorFavoritos();
    } catch (err) { console.error(err); }
}

async function carregarGradePlaylists(nomeLogado) {
    const db = window.conexaoSupabase;
    const containerPlay = document.getElementById('perfil-grade-playlists');
    if (!containerPlay) return;

    const { data: playlists } = await db.from('playlists').select('*').eq('usuario_id', nomeLogado);

    if (playlists && playlists.length > 0) {
        containerPlay.innerHTML = ''; 
        for (const p of playlists) {
            const idsMusicas = p.musicas ? p.musicas.map(m => m.id) : [];
            let capa = 'https://via.placeholder.com/150?text=Vazia';
            
            if (idsMusicas.length > 0) {
                const { data: musicas } = await db.from('musicas').select('capa_url').in('id', idsMusicas).limit(1);
                if (musicas && musicas.length > 0) capa = musicas[0].capa_url;
            }

            const divGeral = document.createElement('div');
            divGeral.className = 'col-12 mb-3';
            divGeral.id = `playlist-item-${p.id}`;
            divGeral.innerHTML = `
                <div style="position:relative;">
                    <div onclick="togglePlaylist('${p.id}')" style="cursor:pointer; background:rgba(255,255,255,0.05); padding:15px; border-radius:12px; display:flex; align-items:center;">
                        <img src="${capa}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; margin-right:15px;">
                        <div style="flex:1">
                            <h5 class="m-0 text-white">${p.nome}</h5>
                            <p class="m-0 text-muted small">${p.musicas ? p.musicas.length : 0} músicas</p>
                        </div>
                        <span id="seta-${p.id}" style="transition: 0.3s; margin-right:30px;">▼</span>
                    </div>
                    <button onclick="excluirPlaylist('${p.id}')" style="position:absolute; right:15px; top:50%; transform:translateY(-50%); background:none; border:none; color:gray; cursor:pointer;">🗑️</button>
                </div>
                <div id="lista-${p.id}" class="d-none mt-2" style="background:rgba(0,0,0,0.2); border-radius:12px; padding:10px;">
                    <p class="text-white small">Carregando músicas...</p>
                </div>
            `;
            containerPlay.appendChild(divGeral);
        }
        document.getElementById('stat-playlists').textContent = playlists.length;
    }
}

// Funções Auxiliares de Exclusão
async function excluirReview(id) {
    if (!confirm("Apagar esta review?")) return;
    await window.conexaoSupabase.from('reviews').delete().eq('id', id);
    document.getElementById(`review-${id}`).remove();
    const stat = document.getElementById('stat-reviews');
    stat.textContent = parseInt(stat.textContent) - 1;
}

async function excluirPlaylist(id) {
    if (!confirm("Apagar esta playlist?")) return;
    await window.conexaoSupabase.from('playlists').delete().eq('id', id);
    document.getElementById(`playlist-item-${id}`).remove();
    const stat = document.getElementById('stat-playlists');
    stat.textContent = parseInt(stat.textContent) - 1;
}

function atualizarContadorFavoritos() {
    const idsFav = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    const elStat = document.getElementById('stat-favoritos');
    if (elStat) elStat.textContent = idsFav.length;
}

window.togglePlaylist = async function(id) {
    const lista = document.getElementById(`lista-${id}`);
    const seta = document.getElementById(`seta-${id}`);
    const db = window.conexaoSupabase;

    if (lista.classList.contains('d-none')) {
        lista.classList.remove('d-none');
        seta.style.transform = "rotate(180deg)";
        
        // Busca músicas detalhadas para a playlist aberta
        const { data: p } = await db.from('playlists').select('musicas').eq('id', id).single();
        const ids = p.musicas.map(m => m.id);
        const { data: musicas } = await db.from('musicas').select('*').in('id', ids);
        
        lista.innerHTML = musicas.map(m => `
            <div class="d-flex align-items-center mb-2 p-2" style="border-bottom:1px solid rgba(255,255,255,0.05)">
                <img src="${m.capa_url}" style="width:35px; height:35px; border-radius:4px; margin-right:12px;">
                <div><p class="m-0 text-white small fw-bold">${m.titulo}</p><p class="m-0 text-muted" style="font-size:0.7rem">${m.artista}</p></div>
            </div>`).join('');
    } else {
        lista.classList.add('d-none');
        seta.style.transform = "rotate(0deg)";
    }
};

window.mostrarSecao = function(tipo) {
    const secoes = ['perfil-reviews-container', 'perfil-grade-playlists', 'perfil-favoritos-container'];
    const abas = ['btn-aba-reviews', 'btn-aba-playlists', 'btn-aba-favoritos'];

    secoes.forEach(id => document.getElementById(id).classList.add('d-none'));
    abas.forEach(id => document.getElementById(id).classList.remove('active'));

    document.getElementById(`perfil-${tipo === 'favoritos' ? 'favoritos-container' : tipo === 'reviews' ? 'reviews-container' : 'grade-playlists'}`).classList.remove('d-none');
    document.getElementById(`btn-aba-${tipo}`).classList.add('active');
    
    if (tipo === 'favoritos') carregarFavoritosPerfil();
};

async function carregarFavoritosPerfil() {
    const db = window.conexaoSupabase;
    const container = document.getElementById('perfil-favoritos-container');
    const ids = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    
    if (ids.length === 0) {
        container.innerHTML = '<p class="text-muted text-center w-100">Sem favoritos.</p>';
        return;
    }

    const { data: musicas } = await db.from('musicas').select('*').in('id', ids);
    container.innerHTML = musicas.map(m => `
        <div class="col-12 mb-2" id="fav-${m.id}">
            <div class="d-flex align-items-center" style="background:rgba(255,255,255,0.05); padding:10px; border-radius:10px;">
                <img src="${m.capa_url}" style="width:45px; height:45px; border-radius:5px; margin-right:15px;">
                <div style="flex:1"><p class="m-0 text-white fw-bold">${m.titulo}</p><p class="m-0 text-muted small">${m.artista}</p></div>
                <button onclick="removerFavorito('${m.id}')" style="background:none; border:none; color:#e81856;">💔</button>
            </div>
        </div>`).join('');
}

window.removerFavorito = (id) => {
    let ids = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    ids = ids.filter(i => i !== id);
    localStorage.setItem('meus_favoritos', JSON.stringify(ids));
    document.getElementById(`fav-${id}`).remove();
    atualizarContadorFavoritos();
};