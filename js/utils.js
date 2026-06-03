/* ============================================================
   UTILITÁRIOS GLOBAIS E CONFIGURAÇÃO DO SUPABASE
   ============================================================ */

// Variáveis de configuração do Supabase
var URL_BANCO = 'https://aolewmjptkjcbhjczrjm.supabase.co';
var CHAVE_BANCO = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImFvbGV3bWpwdGtqY2JoamN6cmptIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzgyNjkzNjAsImV4cCI6MjA5Mzg0NTM2MH0.K7pGC4EfuULjlVgZT2RMXa9oZ5cawY23OOj7nneXm4M';

// Conexão de forma GLOBAL
window.conexaoSupabase = supabase.createClient(URL_BANCO, CHAVE_BANCO);
var conexaoSupabase = window.conexaoSupabase;

// Variáveis de controle global
let musicasSelecionadasParaPlaylist = [];
let notaSelecionada = 0;

/* ============================================================
   FUNÇÕES DE AUTENTICAÇÃO
   ============================================================ */

// Função para fazer logout, removendo o usuário do localStorage e redirecionando
function logout() {
    localStorage.removeItem('usuario');
    window.location.href = window.location.pathname.includes('/pages/') ? '../index.html' : 'index.html';
}

// Função para exigir login (usada em páginas públicas)
function exigirLogin() {
    window.location.href = 'login.html?tab=login';
}

// Controle de abas no login.html (cadastro/login)
function showTab(aba) {
    const formCad = document.getElementById('form-cadastro');
    const formLog = document.getElementById('form-login');
    const btnCad = document.getElementById('tab-cadastro');
    const btnLog = document.getElementById('tab-login');

    if (aba === 'cadastro') {
        if (formCad) formCad.style.display = 'block';
        if (formLog) formLog.style.display = 'none';
        if (btnCad) btnCad.classList.add('active');
        if (btnLog) btnLog.classList.remove('active');
    } else {
        if (formCad) formCad.style.display = 'none';
        if (formLog) formLog.style.display = 'block';
        if (btnLog) btnLog.classList.add('active');
        if (btnCad) btnCad.classList.remove('active');
    }
}

/* ============================================================
   SISTEMA DE LOGIN
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

function exigirLogin() {
    window.location.href = 'login.html?tab=login'; // Esta linha já está correta!
}
/* ============================================================
   SISTEMA DE CADASTRO
   ============================================================ */
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

// Se precisar redirecionar via JavaScript para o cadastro:
function irParaCadastro() {
    window.location.href = 'login.html?tab=cadastro';
}
/* ============================================================
   SISTEMA DE FAVORITOS (GLOBAL)
   ============================================================ */

// Função para alternar o estado de favorito de uma música
function alternarFavoritoGlobal(id) {
    if (window.event) window.event.stopPropagation();
    let favs = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    const botoes = document.querySelectorAll(`[id="btn-fav-${id}"], [id="btn-fav-main-${id}"]`);
    
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

// Verifica se uma música é favorita
function verificarSeEFavorito(id) {
    const favs = JSON.parse(localStorage.getItem('meus_favoritos') || '[]');
    return favs.includes(id) || favs.includes(String(id)) || favs.includes(parseInt(id));
}

/* ============================================================
   INICIALIZAÇÃO GLOBAL
   ============================================================ */

document.addEventListener('DOMContentLoaded', () => {
    // Atualiza nome do usuário se estiver no app.html
    const user = JSON.parse(localStorage.getItem('usuario') || '{}');
    if (document.getElementById('nome-usuario') && user.nome) {
        document.getElementById('nome-usuario').textContent = `Olá, ${user.nome}!`;
    }

    // Lógica para abrir a aba correta no Login
    if (window.location.pathname.includes('login.html')) {
        const urlParams = new URLSearchParams(window.location.search);
        const tab = urlParams.get('tab');
        
        if (tab === 'login') {
            showTab('login');
        } else {
            showTab('cadastro');
        }
    }
});

// Exportar funções para o escopo global
window.logout = logout;
window.exigirLogin = exigirLogin;
window.showTab = showTab;
window.login = login;
window.cadastrar = cadastrar;
window.alternarFavoritoGlobal = alternarFavoritoGlobal;
window.verificarSeEFavorito = verificarSeEFavorito;
window.conexaoSupabase = conexaoSupabase;