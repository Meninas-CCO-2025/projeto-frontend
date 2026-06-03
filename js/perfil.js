// --- SISTEMA DE CONFIGURAÇÕES DO PERFIL ---

// Abre e fecha o modal principal de configurações
window.abrirModalConfig = () => document.getElementById('modal-config').style.display = 'flex';
window.fecharModalConfig = () => document.getElementById('modal-config').style.display = 'none';

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

// ============================================================
// FUNÇÃO PARA ALTERAR E SALVAR O NOME DE USUÁRIO
// ============================================================

// Atualiza o nome do usuário diretamente nos metadados de autenticação do Supabase, garantindo que a mudança seja refletida em toda a plataforma.
window.salvarNome = async function() {
    const db = window.conexaoSupabase;
    const novoNome = document.getElementById('novo-nome').value.trim();
    let usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const msg = document.getElementById('msg-nome');

    if (!novoNome) {
        if (msg) {
            msg.style.color = "#e81856";
            msg.innerText = "O nome não pode ficar vazio.";
        }
        return;
    }

    try {
        // 1. Atualiza o full_name nos metadados de autenticação do Supabase (Auth)
        const { error: authError } = await db.auth.updateUser({
            data: { full_name: novoNome }
        });
        if (authError) throw authError;

        // 2. Atualiza o objeto local
        usuario.nome = novoNome;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // 3. Atualiza os elementos visuais imediatamente na página
        if (document.getElementById('perfil-nome')) {
            document.getElementById('perfil-nome').textContent = '@' + novoNome;
        }

        if (msg) {
            msg.style.color = "#27ae60"; 
            msg.innerText = "Nome atualizado com sucesso!";
        }
        
        // Recarrega os dados pessoais da página para atualizar a lista de reviews abaixo com o novo nome
        if (typeof carregarDadosPessoais === 'function') {
            carregarDadosPessoais(novoNome);
        }

        setTimeout(fecharModalConfig, 1200);

    } catch (err) {
        console.error("Erro ao salvar nome:", err);
        if (msg) {
            msg.style.color = "#e81856";
            msg.innerText = "Erro: " + err.message;
        }
    }
};


// ============================================================
// FUNÇÃO PARA ALTERAR E SALVAR O E-MAIL (DIRETO NO SUPABASE)
// ============================================================

// Esta função chama uma função SQL (RPC) personalizada no Supabase que atualiza o e-mail do usuário diretamente no banco de dadoos
window.salvarEmail = async function() {
    const db = window.conexaoSupabase;
    const novoEmail = document.getElementById('novo-email').value.trim();
    let usuario = JSON.parse(localStorage.getItem('usuario') || '{}');
    const msg = document.getElementById('msg-email');

    if (!novoEmail) {
        if (msg) {
            msg.style.color = "#e81856";
            msg.innerText = "O e-mail não pode ficar vazio.";
        }
        return;
    }

    try {
        // 1. Chama a função SQL (RPC) para forçar a mudança do e-mail sem enviar links
        const { error: rpcError } = await db.rpc('atualizar_email_direto', {
            novo_email: novoEmail
        });
        
        if (rpcError) throw rpcError;

        // 2. Atualiza o localStorage para manter a sessão sincronizada localmente
        usuario.email = novoEmail;
        localStorage.setItem('usuario', JSON.stringify(usuario));

        // 3. Atualiza a interface do utilizador imediatamente
        if (document.getElementById('perfil-email')) {
            document.getElementById('perfil-email').textContent = novoEmail;
        }

        if (msg) {
            msg.style.color = "#27ae60";
            msg.innerText = "E-mail alterado com sucesso no banco de dados!";
        }

        // Fecha o modal após o sucesso
        setTimeout(fecharModalConfig, 1500);

    } catch (err) {
        console.error("Erro ao salvar e-mail:", err);
        if (msg) {
            msg.style.color = "#e81856";
            msg.innerText = "Erro ao atualizar: " + err.message;
        }
    }
};

// --- CONTROLE DO MODAL DE DELETAR CONTA ---

// Estas funções controlam a abertura, fechamento e ação de deletar conta do modal de confirmação
window.confirmarDelecao = function() {
    const modalDeletar = document.getElementById('modal-deletar');
    if (modalDeletar) modalDeletar.style.display = 'flex';
};

// Esta função fecha o modal de deleção sem realizar nenhuma ação, permitindo que o usuário cancele a operação
window.fecharModalDeletar = function() {
    const modalDeletar = document.getElementById('modal-deletar');
    if (modalDeletar) modalDeletar.style.display = 'none';
};

// Deleta definitivamente a conta do usuário, removendo suas reviews e depois deletando o próprio usuário do Supabase, garantindo que todos os dados relacionados sejam limpos
window.deletarContaDefinitiva = async function() {
    const db = window.conexaoSupabase;
    const usuario = JSON.parse(localStorage.getItem('usuario') || '{}');

    try {
        if (usuario.nome) {
            await db.from('reviews').delete().eq('usuario', usuario.nome);
        }

        const { error } = await db.rpc('deletar_proprio_usuario');
        if (error) throw error;

        localStorage.clear();
        window.location.href = '../index.html';
    } catch (err) {
        console.error("Erro ao deletar conta:", err);
        alert("Não foi possível deletar a conta: " + err.message);
    }
};

// --- LOGICA DE DADOS (REVIEWS, PLAYLISTS, FAVORITOS) ---

// Carrega as reviews, playlists e favoritos do usuário logado
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

// Carrega as playlists do usuário logado, mostrando a capa da primeira música, nome da playlist e quantidade de músicas
async function carregarGradePlaylists(nomeLogado) {
    const db = window.conexaoSupabase;
    const containerPlay = document.getElementById('perfil-grade-playlists');
    if (!containerPlay) return;

    const { data: playlists } = await db.from('playlists').select('*').eq('usuario_id', nomeLogado);

    // Para cada playlist, busca a capa da primeira música (ou usa uma imagem padrão se estiver vazia) e renderiza a playlist com um botão de exclusão e uma seta para expandir a lista de músicas
    if (playlists && playlists.length > 0) {
        containerPlay.innerHTML = ''; 
        for (const p of playlists) {
            const idsMusicas = p.musicas ? p.musicas.map(m => m.id) : [];
            let capa = 'https://via.placeholder.com/150?text=Vazia';
            
            if (idsMusicas.length > 0) {
                const { data: musicas } = await db.from('musicas').select('capa_url').in('id', idsMusicas).limit(1);
                if (musicas && musicas.length > 0) capa = musicas[0].capa_url;
            }

            // Renderiza cada playlist com a capa, nome e quantidade de músicas, além de um botão para excluir a playlist e uma seta para expandir a lista de músicas
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

// Exclui a playlist do banco de dados e remove o item da interface, atualizando o contador de playlists
async function excluirPlaylist(id) {
    if (!confirm("Apagar esta playlist?")) return;
    await window.conexaoSupabase.from('playlists').delete().eq('id', id);
    document.getElementById(`playlist-item-${id}`).remove();
    const stat = document.getElementById('stat-playlists');
    stat.textContent = parseInt(stat.textContent) - 1;
}

// Atualiza o contador de favoritos no perfil, lendo os IDs dos favoritos do localStorage e atualizando o número exibido na interface
function atualizarContadorFavoritos() {
    const idsFav = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    const elStat = document.getElementById('stat-favoritos');
    if (elStat) elStat.textContent = idsFav.length;
}

// Alterna a exibição da lista de músicas de uma playlist, buscando os detalhes das músicas do banco de dados quando a playlist é aberta e renderizando as informações na interface
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
        
        // Renderiza a lista de músicas da playlist, mostrando capa, título e artista de cada música
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

// Controla a exibição das seções de reviews, playlists e favoritos no perfil, mostrando apenas a seção selecionada e atualizando o estilo das abas para indicar qual está ativa. Quando a aba de favoritos é selecionada, também carrega os favoritos do perfil para garantir que a lista esteja atualizada.
window.mostrarSecao = function(tipo) {
    const secoes = ['perfil-reviews-container', 'perfil-grade-playlists', 'perfil-favoritos-container'];
    const abas = ['btn-aba-reviews', 'btn-aba-playlists', 'btn-aba-favoritos'];

    secoes.forEach(id => document.getElementById(id).classList.add('d-none'));
    abas.forEach(id => document.getElementById(id).classList.remove('active'));

    // Mostra a seção selecionada e marca a aba correspondente como ativa
    document.getElementById(`perfil-${tipo === 'favoritos' ? 'favoritos-container' : tipo === 'reviews' ? 'reviews-container' : 'grade-playlists'}`).classList.remove('d-none');
    document.getElementById(`btn-aba-${tipo}`).classList.add('active');
    
    if (tipo === 'favoritos') carregarFavoritosPerfil();
};

// Carrega as músicas favoritas do usuário, buscando os detalhes das músicas a partir dos IDs armazenados no localStorage e renderizando a lista de favoritos na interface, permitindo também remover músicas da lista de favoritos
async function carregarFavoritosPerfil() {
    const db = window.conexaoSupabase;
    const container = document.getElementById('perfil-favoritos-container');
    const ids = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    
    if (ids.length === 0) {
        container.innerHTML = '<p class="text-muted text-center w-100">Sem favoritos.</p>';
        return;
    }

    // Busca os detalhes das músicas favoritas a partir dos IDs e renderiza a lista de favoritos, mostrando capa, título e artista de cada música, além de um botão para remover a música dos favoritos
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

// Remove uma música dos favoritos, atualizando o localStorage, removendo o item da interface e atualizando o contador de favoritos no perfil
window.removerFavorito = (id) => {
    let ids = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    ids = ids.filter(i => i !== id);
    localStorage.setItem('meus_favoritos', JSON.stringify(ids));
    document.getElementById(`fav-${id}`).remove();
    atualizarContadorFavoritos();
};

