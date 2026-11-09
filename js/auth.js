// Gerenciador de Autenticação com suporte a data_plane_token do SuperDB
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
      
      let res = await fetch(`${cfg.authUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      let dataPlaneToken = cfg.anonKey;
      let userId = 'usr_' + btoa(email).replace(/=/g, '');

      if (res && res.ok) {
        const responseData = await res.json();
        userId = responseData.user ? responseData.user.id : (responseData.id || userId);
        // Utiliza prioritariamente o data_plane_token informado pelo SuperDB para chamadas no data-plane (REST)
        dataPlaneToken = responseData.data_plane_token || responseData.access_token || cfg.anonKey;
      }

      const user = {
        id: userId,
        name: email.split('@')[0],
        email: email,
        dataPlaneToken: dataPlaneToken
      };

      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao realizar login no SuperDB: " + err.message);
      return null;
    }
  },

  async registerSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const cfg = CONFIG.getSuperDBConfig();

      let res = await fetch(`${cfg.authUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      let dataPlaneToken = cfg.anonKey;
      let userId = 'usr_' + btoa(email).replace(/=/g, '');

      if (res && res.ok) {
        const responseData = await res.json();
        userId = responseData.user ? responseData.user.id : (responseData.id || userId);
        dataPlaneToken = responseData.data_plane_token || responseData.access_token || cfg.anonKey;
      }

      const user = { 
        id: userId,
        name: email.split('@')[0],
        email: email,
        dataPlaneToken: dataPlaneToken
      };

      alert(`Conta registrada com sucesso no SuperDB!`);
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao cadastrar usuário via SuperDB: " + err.message);
      return null;
    }
  },

  loginLocal() {
    const guestUser = {
      id: 'local_user',
      name: 'Servidor (Local)',
      email: 'modo.local@atibaia.sp.gov.br',
      dataPlaneToken: null
    };
    return this.setSession(guestUser, 'local');
  },

  async logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    window.location.reload();
  }
};

window.AuthManager = AuthManager;
