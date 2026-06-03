/* ============================================================
   FUNÇÕES ESPECÍFICAS PARA INDEX.HTML (PÁGINA PÚBLICA)
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

function exibirLogin(){
    alert('Faça o login para continuar.');
    widow.location.href = 'login.html?tab=login';
}
// Inicializa funções quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    carregarDestaquesPublicos();
    carregarFeedGlobal();
});

// Exportar funções para o escopo global
window.scrollVitrine = scrollVitrine;
window.carregarDestaquesPublicos = carregarDestaquesPublicos;
window.carregarFeedGlobal = carregarFeedGlobal;