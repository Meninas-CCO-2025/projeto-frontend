// favoritos.js

document.addEventListener('DOMContentLoaded', carregarFavoritos);

async function carregarFavoritos() {
    const container = document.getElementById('lista-favoritos');
    const idsFavoritos = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

    if (!container) return;

    if (idsFavoritos.length === 0) {
        container.innerHTML = `
            <div style="text-align:center; margin-top:50px;">
                <p style="color:gray;">Ainda não tens músicas favoritas.</p>
                <a href="busca.html" style="color:#e81856; text-decoration:none;">🔍 Ir procurar músicas</a>
            </div>`;
        return;
    }

    try {
        const { data: musicas, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .in('id', idsFavoritos);

        if (error) throw error;

        container.innerHTML = musicas.map(m => `
            <div class="review-card" id="card-fav-${m.id}">
                <div class="review-header" style="display:flex; align-items:center;">
                    <img src="${m.capa_url}" style="width:52px; height:52px; border-radius:8px; object-fit:cover; margin-right:12px;">
                    <div style="flex:1">
                        <p class="music-title" style="margin:0; font-weight:bold; color:white;">${m.titulo}</p>
                        <p class="music-artist" style="margin:0; color:#a89ec9; font-size:0.85rem;">${m.artista}</p>
                    </div>
                    <button onclick="removerFavorito('${m.id}')" style="background:none; border:none; color:#e81856; cursor:pointer; font-size:1.2rem;">❤️</button>
                </div>
            </div>
        `).join('');

    } catch (err) {
        console.error("Erro ao carregar favoritos:", err);
    }
}

function removerFavorito(id) {
    let favs = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    favs = favs.filter(favId => favId !== id);
    localStorage.setItem('meus_favoritos', JSON.stringify(favs));
    
    // Remove o card da tela imediatamente
    const card = document.getElementById(`card-fav-${id}`);
    if (card) card.remove();
    
    // Se ficou vazio, recarrega para mostrar a mensagem de "vazio"
    if (favs.length === 0) carregarFavoritos();
}