// Controlador de Interface e Navegação SPA
import { CONFIG } from './config.js';
import { AuthManager } from './auth.js';

document.addEventListener('DOMContentLoaded', () => {
  const authScreen = document.getElementById('auth-screen');
  const appScreen = document.getElementById('app-screen');
  
  const tabBtns = document.querySelectorAll('.tab-btn');
  const formLogin = document.getElementById('form-login');
  const formRegister = document.getElementById('form-register');
  const btnGuest = document.getElementById('btn-guest');
  const btnLogout = document.getElementById('btn-logout');
  const envSelector = document.getElementById('env-selector');

  const userInfoDisplay = document.getElementById('user-info-display');
  const storageModeBadge = document.getElementById('storage-mode-badge');
  const envModeBadge = document.getElementById('env-mode-badge');
  const currentDbMode = document.getElementById('current-db-mode');
  const currentEnvDisplay = document.getElementById('current-env-display');
  const currentUserEmail = document.getElementById('current-user-email');
  const appVersionDisplay = document.getElementById('app-version-display');

  if (appVersionDisplay) {
    appVersionDisplay.textContent = `v${CONFIG.VERSION}`;
  }

  if (envSelector) {
    envSelector.value = CONFIG.getEnvironment();
    envSelector.addEventListener('change', (e) => {
      CONFIG.setEnvironment(e.target.value);
      console.log(`Ambiente alterado para: ${e.target.value}`);
    });
  }

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      tabBtns.forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.auth-form').forEach(f => f.classList.remove('active'));

      btn.classList.add('active');
      const targetTab = btn.getAttribute('data-tab');
      document.getElementById(`form-${targetTab}`).classList.add('active');
    });
  });

  formLogin.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('login-email').value;
    const password = document.getElementById('login-password').value;

    const session = await AuthManager.loginSuperDB(email, password);
    if (session) checkAuthAndRender();
  });

  formRegister.addEventListener('submit', async (e) => {
    e.preventDefault();
    const name = document.getElementById('reg-name').value;
    const email = document.getElementById('reg-email').value;
    const password = document.getElementById('reg-password').value;

    const session = await AuthManager.registerSuperDB(name, email, password);
    if (session) checkAuthAndRender();
  });

  btnGuest.addEventListener('click', () => {
    AuthManager.loginLocal();
    checkAuthAndRender();
  });

  btnLogout.addEventListener('click', () => {
    AuthManager.logout();
  });

  function checkAuthAndRender() {
    const session = AuthManager.getCurrentUser();

    if (session && session.user) {
      authScreen.classList.remove('active');
      appScreen.classList.add('active');

      userInfoDisplay.textContent = session.user.name;
      currentUserEmail.textContent = session.user.email;

      const currentEnvConfig = CONFIG.getSuperDBConfig();
      currentEnvDisplay.textContent = currentEnvConfig.name;
      envModeBadge.textContent = CONFIG.getEnvironment().toUpperCase();

      if (CONFIG.getEnvironment() === 'dev') {
        envModeBadge.style.background = '#e67e22';
        envModeBadge.style.color = '#ffffff';
      } else {
        envModeBadge.style.background = '#28a745';
        envModeBadge.style.color = '#ffffff';
      }

      if (session.mode === 'superdb') {
        storageModeBadge.textContent = 'SuperDB Nuvem';
        storageModeBadge.style.background = '#0056b3';
        currentDbMode.textContent = `SuperDB (${currentEnvConfig.name})`;
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

  checkAuthAndRender();
});
