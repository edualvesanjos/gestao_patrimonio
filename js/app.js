// Controlador de Interface e Navegação SPA

document.addEventListener('DOMContentLoaded', () => {
    // Elementos de tela
    const authScreen = document.getElementById('auth-screen');
    const appScreen = document.getElementById('app-screen');
    
    // Elementos de autenticação
    const tabBtns = document.querySelectorAll('.tab-btn');
    const formLogin = document.getElementById('form-login');
    const formRegister = document.getElementById('form-register');
    const btnGuest = document.getElementById('btn-guest');
    const btnLogout = document.getElementById('btn-logout');
  
    // Elementos do Header/Dashboard
    const userInfoDisplay = document.getElementById('user-info-display');
    const storageModeBadge = document.getElementById('storage-mode-badge');
    const currentDbMode = document.getElementById('current-db-mode');
    const currentUserEmail = document.getElementById('current-user-email');
  
    // Alternância de Abas na Tela de Auth
    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));
  
        btn.classList.add('active');
        const targetTab = btn.getAttribute('data-tab');
        document.getElementById(`form-${targetTab}`).classList.add('active');
      });
    });
  
    // Submit Login SuperDB
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const email = document.getElementById('login-email').value;
      const password = document.getElementById('login-password').value;
  
      const session = await AuthManager.loginSuperDB(email, password);
      if (session) checkAuthAndRender();
    });
  
    // Submit Cadastro SuperDB
    formRegister.addEventListener('submit', async (e) => {
      e.preventDefault();
      const name = document.getElementById('reg-name').value;
      const email = document.getElementById('reg-email').value;
      const password = document.getElementById('reg-password').value;
  
      const session = await AuthManager.registerSuperDB(name, email, password);
      if (session) checkAuthAndRender();
    });
  
    // Acesso Modo Local
    btnGuest.addEventListener('click', () => {
      AuthManager.loginLocal();
      checkAuthAndRender();
    });
  
    // Logout
    btnLogout.addEventListener('click', () => {
      AuthManager.logout();
    });
  
    // Verificação de Estado da Sessão e Troca de Telas
    function checkAuthAndRender() {
      const session = AuthManager.getCurrentUser();
  
      if (session && session.user) {
        authScreen.classList.remove('active');
        appScreen.classList.add('active');
  
        // Atualiza os dados na UI
        userInfoDisplay.textContent = session.user.name;
        currentUserEmail.textContent = session.user.email;
  
        if (session.mode === 'superdb') {
          storageModeBadge.textContent = 'SuperDB Nuvem';
          storageModeBadge.style.background = '#28a745';
          currentDbMode.textContent = 'SuperDB (Sincronizado na Nuvem)';
        } else {
          storageModeBadge.textContent = 'Modo Local';
          storageModeBadge.style.background = '#6c757d';
          currentDbMode.textContent = 'Navegador LocalStorage (Offline)';
        }
      } else {
        appScreen.classList.remove('active');
        authScreen.classList.add('active');
      }
    }
  
    // Inicializa o app verificando autenticação
    checkAuthAndRender();
  });