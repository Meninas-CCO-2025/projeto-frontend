// reviews.js

document.addEventListener('DOMContentLoaded', carregarTodasReviews);

// Variável global para guardar todas as reviews e facilitar o filtro
let todasAsReviews = []; 

async function carregarTodasReviews() {
    const container = document.getElementById('lista-todas-reviews');
    if (!container) return;

    container.innerHTML = '<p style="color:gray; text-align:center;">Carregando reviews da comunidade...</p>';

    try {
        // Busca todas as reviews no Supabase, da mais recente para a mais antiga
        const { data: reviews, error } = await conexaoSupabase
            .from('reviews')
            .select('*')
            .order('created_at', { ascending: false });

        if (error) throw error;

        todasAsReviews = reviews; // Salva na variável
        renderizarReviews(todasAsReviews); // Desenha na tela

    } catch (err) {
        console.error("Erro ao carregar reviews:", err);
        container.innerHTML = '<p style="color:#e81856; text-align:center;">Erro ao carregar as reviews.</p>';
    }
}

// Função que desenha as reviews na tela
function renderizarReviews(lista) {
    const container = document.getElementById('lista-todas-reviews');
    
    if (!lista || lista.length === 0) {
        container.innerHTML = '<p style="color:gray; text-align:center;">Nenhuma review encontrada com esse filtro.</p>';
        return;
    }

    container.innerHTML = lista.map(r => {
        // Lógica simples para mostrar as estrelas vazias também
        const estrelasPreenchidas = '★'.repeat(r.estrelas);
        const estrelasVazias = '☆'.repeat(5 - r.estrelas);

        // Monta o card da review, mostrando usuário, música, artista, estrelas e texto do comentário (ou mensagem padrão se não tiver comentário)
        return `
        <div class="review-card mb-3 p-3" style="background: rgba(255,255,255,0.03); border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);">
            <div class="d-flex justify-content-between align-items-center">
                <strong style="color: var(--btn); font-size: 1.1rem;">${r.usuario}</strong>
                <span style="color: #FFC300; font-size: 1.2rem;">${estrelasPreenchidas}<span style="color: #555;">${estrelasVazias}</span></span>
            </div>
            <div class="mt-2">
                <span style="color: white; font-weight: bold; font-size: 1.1rem;">${r.musica}</span> 
                <span style="color: #a89ec9;"> — ${r.artista}</span>
            </div>
            <p class="mt-3 mb-0" style="color: #ccc; font-style: italic;">"${r.texto || 'Deu a nota, mas não deixou comentário.'}"</p>
        </div>
        `;
    }).join('');
}

// Função chamada sempre que o usuário digita algo no input (onkeyup)
function filtrarReviews() {
    const termo = document.getElementById('filtro-reviews').value.toLowerCase();
    
    // Filtra procurando o termo no nome da música, artista, usuário ou no texto da review
    const filtradas = todasAsReviews.filter(r => 
        (r.musica && r.musica.toLowerCase().includes(termo)) ||
        (r.artista && r.artista.toLowerCase().includes(termo)) ||
        (r.usuario && r.usuario.toLowerCase().includes(termo)) ||
        (r.texto && r.texto.toLowerCase().includes(termo))
    );

    renderizarReviews(filtradas);
}