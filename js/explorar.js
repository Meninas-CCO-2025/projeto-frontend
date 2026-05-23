// js/explorar.js

async function filtrarPorGenero(generoAlvo) {
    const container = document.getElementById('resultado-explorar');
    
    // Feedback visual de carregamento
    container.innerHTML = `<p style="color:white; margin: 20px;">Explorando músicas de ${generoAlvo}...</p>`;

    try {
        // O termo %genero% faz o banco buscar a palavra em qualquer lugar da frase
        const { data: musicas, error } = await conexaoSupabase
            .from('musicas')
            .select('*')
            .ilike('genero', `%${generoAlvo}%`);

        if (error) throw error;

        if (!musicas || musicas.length === 0) {
            container.innerHTML = `<p style="color:gray; margin: 20px;">Nenhuma música encontrada para o gênero "${generoAlvo}".</p>`;
            return;
        }

        // Renderiza os cards
        container.innerHTML = musicas.map(m => `
            <div class="col-6 col-md-3 mb-4">
                <div class="music-card" style="background:#1e1b2e; padding:15px; border-radius:16px; height:100%; border: 1px solid rgba(255,255,255,0.05); position:relative;">
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
        `).join('');

    } catch (err) {
        console.error("Erro ao explorar:", err);
        container.innerHTML = `<p style="color:red; margin: 20px;">Ocorreu um erro ao carregar as músicas.</p>`;
    }
}

// Opcional: Carregar um gênero inicial quando a página abrir
document.addEventListener('DOMContentLoaded', () => {
    if (document.getElementById('resultado-explorar')) {
        filtrarPorGenero('Pop');
    }
});