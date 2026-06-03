/* ============================================================
   SISTEMA DE ARTISTAS E GÊNEROS (EXPLORAR.HTML)
   ============================================================ */

// Função para carregar os artistas únicos da tabela de músicas
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

// Função para mostrar/esconder o dropdown de músicas de um artista
async function toggleMusicasArtista(nomeArtista) {
    const idLimpo = nomeArtista.replace(/\s+/g, '');
    const dropdown = document.getElementById(`musicas-${idLimpo}`);
    
    if (dropdown.style.display === 'block') { 
        dropdown.style.display = 'none'; 
        return; 
    }

    // Esconde todos os outros dropdowns e mostra o do artista clicado
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

        dropdown.innerHTML = musicas.map(m => {
            const isFav = favsLocais.includes(String(m.id));
            return `
                <div class="track-item" style="display:flex; align-items:center; justify-content:between; padding:5px 10px;">
                    <img src="${m.capa_url}" class="track-img" onerror="this.src='https://via.placeholder.com/45?text=🎵'">
                    <div class="track-info">
                        <p class="track-name">${m.titulo}</p>
                    </div>
                    <div style="display:flex; align-items:center; gap:8px;">
                        <button onclick="alternarFavoritoGlobal('${m.id}')" id="btn-fav-main-${m.id}" style="background:none; border:none; font-size:1.2rem; cursor:pointer;">
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

// Função para filtrar por gênero
async function filtrarPorGenero(generoAlvo) {
    const container = document.getElementById('resultado-explorar');

    container.innerHTML = `<p style="color:white; margin: 20px;">Explorando músicas de ${generoAlvo}...</p>`;

    try {
        const { data: musicas, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .ilike('genero', `%${generoAlvo}%`);

        if (error) throw error;

        if (!musicas || musicas.length === 0) {
            container.innerHTML = `<p style="color:gray; margin: 20px;">Nenhuma música encontrada para o gênero "${generoAlvo}".</p>`;
            return;
        }

        const favsLocais = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');

        container.innerHTML = musicas.map(m => {
            const isFav = favsLocais.includes(String(m.id)) || favsLocais.includes(parseInt(m.id));
            return `
                <div class="col-6 col-md-3 mb-4">
                    <div class="music-card" style="background:#1e1b2e; padding:15px; border-radius:16px; height:100%; border: 1px solid rgba(255,255,255,0.05); position:relative;">
                        
                        <button onclick="alternarFavoritoGlobal('${m.id}')" id="btn-fav-main-${m.id}" style="position:absolute; bottom:15px; right:15px; background:rgba(0,0,0,0.6); border:none; font-size:1.2rem; cursor:pointer; z-index:10; border-radius:50%; width:32px; height:32px; display:flex; align-items:center; justify-content:center;">
                            ${isFav ? '❤️' : '🤍'}
                        </button>

                        <div class="music-cover" style="width:100%; aspect-ratio:1/1; border-radius:12px; overflow:hidden; margin-bottom:12px;">
                            <img src="${m.capa_url}" style="width:100%; height:100%; object-fit:cover;" onerror="this.src='https://via.placeholder.com/150?text=🎵'">
                        </div>
                        <h5 style="color:white; font-size:1rem; margin:0; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;" title="${m.titulo}">
                            ${m.titulo}
                        </h5>
                        <p style="color:#a89ec9; font-size:0.8rem; margin-bottom:10px;">${m.artista}</p>
                        <div style="display:flex; flex-wrap:wrap; gap:5px;">
                            ${m.genero.split(',').map(g => `
                                <span style="font-size:0.65rem; background:rgba(232,24,86,0.15); color:#e81856; padding:2px 8px; border-radius:10px; font-weight:bold;">
                                    ${g.trim()}
                                </span>
                            `).join('')}
                        </div>
                    </div>
                </div>
            `;
        }).join('');

    } catch (err) {
        console.error("Erro ao explorar:", err);
        container.innerHTML = `<p style="color:red; margin: 20px;">Ocorreu um erro ao carregar as músicas.</p>`;
    }
}

/* ============================================================
   INICIALIZAÇÃO
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    carregarArtistasExplorar();
    
    // Carrega um gênero inicial quando a página abrir
    if (document.getElementById('resultado-explorar')) {
        filtrarPorGenero('Pop');
    }
});

// Exportar funções para o escopo global
window.carregarArtistasExplorar = carregarArtistasExplorar;
window.toggleMusicasArtista = toggleMusicasArtista;
window.filtrarPorGenero = filtrarPorGenero;