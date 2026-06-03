/* ============================================================
   SISTEMA DE BUSCA (BUSCA.HTML)
   ============================================================ */

async function buscar() {
    const campo = document.getElementById('campo-busca');
    const container = document.getElementById('resultados');
    const vazio = document.getElementById('estado-vazio');
    
    const termo = campo.value.trim();

    // Se apagar o texto, limpa os resultados
    if (termo.length < 2) {
        container.innerHTML = "";
        vazio.style.display = 'block';
        return;
    }

    try {
        const { data: musicas, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .or(`titulo.ilike.%${termo}%,artista.ilike.%${termo}%`);

        if (error) throw error;

        if (!musicas || musicas.length === 0) {
            container.innerHTML = "";
            vazio.style.display = 'block';
            vazio.innerHTML = `<p style="color:gray;">Nenhum resultado para "${termo}"</p>`;
            return;
        }

        // Esconde o estado vazio e mostra os resultados
        vazio.style.display = 'none';
        container.innerHTML = musicas.map(m => {
            const isFav = verificarSeEFavorito(m.id);
            return `
                <div class="music-card-horizontal" style="display:flex; align-items:center; background:#1e1b2e; padding:12px; border-radius:12px; margin-bottom:10px; border: 1px solid rgba(255,255,255,0.05);">
                    <img src="${m.capa_url}" style="width:60px; height:60px; border-radius:8px; object-fit:cover; margin-right:15px;" onerror="this.src='https://via.placeholder.com/60?text=🎵'">
                    <div style="flex-grow:1">
                        <h5 style="color:white; margin:0; font-size:1rem; font-weight:bold;">${m.titulo}</h5>
                        <p style="color:#a89ec9; margin:0; font-size:0.85rem;">${m.artista}</p>
                    </div>
                    <button onclick="alternarFavoritoGlobal('${m.id}')" id="btn-fav-${m.id}" style="background:none; border:none; font-size:1.3rem; cursor:pointer;">
                        ${isFav ? '❤️' : '🤍'}
                    </button>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Erro na busca:", err);
    }
}

// Exportar funções para o escopo global
window.buscar = buscar;