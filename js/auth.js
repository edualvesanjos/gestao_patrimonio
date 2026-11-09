// Gerenciador de Autenticação com cliente SuperDB
import { CONFIG } from './config.js';

export const AuthManager = {
  getCurrentUser() {
    const session = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  },

  setSession(user, mode) {
    const sessionData = {
      user: user,
      mode: mode,
      env: CONFIG.getEnvironment(),
      loggedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    return sessionData;
  },

  async loginSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const cfg = CONFIG.getSuperDBConfig();
      
      // Lista de endpoints de autenticação a tentar em ordem
      const authEndpoints = [
        `${cfg.apiUrl}/auth/v1/token?grant_type=password`,
        `${cfg.authUrl}/auth/v1/token?grant_type=password`,
        `${cfg.apiUrl}/auth/v1/user`
      ];

      let lastError = "Erro ao conectar com o serviço de autenticação.";
      let userSession = null;

      for (const endpoint of authEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': cfg.anonKey,
              'X-SuperDB-Project': cfg.projectSlug
            },
            body: JSON.stringify({ email, password })
          });

          if (res.status === 404) continue;

          const responseText = await res.text();
          let responseData = {};
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            continue;
          }

          if (res.ok) {
            const user = {
              id: responseData.user ? responseData.user.id : (responseData.id || 'usr_' + Date.now()),
              name: email.split('@')[0],
              email: email,
              accessToken: responseData.access_token || null
            };
            userSession = this.setSession(user, 'superdb');
            break;
          } else {
            lastError = responseData.msg || responseData.error_description || responseData.message || 'Credenciais inválidas.';
          }
        } catch (fetchErr) {
          console.warn(`[AUTH] Falha ao tentar endpoint: ${endpoint}`, fetchErr);
        }
      }

      if (!userSession) {
        throw new Error(lastError);
      }

      return userSession;
    } catch (err) {
      alert("Erro ao realizar login no SuperDB: " + err.message);
      return null;
    }
  },

  async registerSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const cfg = CONFIG.getSuperDBConfig();

      const registerEndpoints = [
        `${cfg.apiUrl}/auth/v1/signup`,
        `${cfg.authUrl}/auth/v1/signup`
      ];

      let lastError = "Erro ao criar conta no SuperDB.";
      let registeredUser = null;

      for (const endpoint of registerEndpoints) {
        try {
          const res = await fetch(endpoint, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'apikey': cfg.anonKey,
              'X-SuperDB-Project': cfg.projectSlug
            },
            body: JSON.stringify({ email, password })
          });

          if (res.status === 404) continue;

          const responseText = await res.text();
          let responseData = {};
          try {
            responseData = JSON.parse(responseText);
          } catch (e) {
            continue;
          }

          if (res.ok) {
            const user = { 
              id: responseData.user ? responseData.user.id : (responseData.id || 'usr_' + Date.now()),
              name: email.split('@')[0],
              email: email 
            };
            registeredUser = this.setSession(user, 'superdb');
            alert(`Conta criada com sucesso no SuperDB!`);
            break;
          } else {
            lastError = responseData.msg || responseData.error_description || responseData.message || 'Erro ao criar conta.';
          }
        } catch (fetchErr) {
          console.warn(`[AUTH] Falha no cadastro via: ${endpoint}`, fetchErr);
        }
      }

      if (!registeredUser) {
        throw new Error(lastError);
      }

      return registeredUser;
    } catch (err) {
      alert("Erro ao cadastrar usuário via SuperDB: " + err.message);
      return null;
    }
  },

  loginLocal() {
    const guestUser = {
      id: 'local_user',
      name: 'Servidor (Local)',
      email: 'modo.local@atibaia.sp.gov.br'
    };
    return this.setSession(guestUser, 'local');
  },

  async logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    window.location.reload();
  }
};

window.AuthManager = AuthManager;
