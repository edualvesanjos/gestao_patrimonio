// Gerenciador de Autenticação com cliente SuperDB
import { CONFIG } from './config.js';

let superdbClient = null;

export function getSuperDBClient() {
  const cfg = CONFIG.getSuperDBConfig();
  if (!superdbClient && window.supabase) {
    superdbClient = window.supabase.createClient(cfg.authUrl, cfg.anonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      },
      global: {
        headers: {
          'X-SuperDB-Project': cfg.projectSlug,
          'apikey': cfg.anonKey
        }
      },
      db: {
        schema: cfg.projectSchema
      }
    });
  }
  return superdbClient;
}

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

      const res = await fetch(`${cfg.authUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify({ email, password })
      });

      const responseText = await res.text();
      let responseData = {};
      try {
        responseData = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(responseText || "Erro inesperado na resposta do servidor.");
      }

      if (!res.ok) {
        throw new Error(responseData.msg || responseData.error_description || responseData.message || 'Credenciais inválidas ou erro no servidor.');
      }

      const user = {
        id: responseData.user ? responseData.user.id : 'usr_' + Date.now(),
        name: email.split('@')[0],
        email: email,
        accessToken: responseData.access_token
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

      const res = await fetch(`${cfg.authUrl}/auth/v1/signup`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify({ email, password })
      });

      const responseText = await res.text();
      let responseData = {};
      try {
        responseData = JSON.parse(responseText);
      } catch (parseErr) {
        throw new Error(responseText || "Erro inesperado na resposta do servidor.");
      }

      if (!res.ok) {
        throw new Error(responseData.msg || responseData.error_description || responseData.message || 'Erro ao criar conta no servidor SuperDB.');
      }

      const user = { 
        id: responseData.user ? responseData.user.id : (responseData.id || 'usr_' + Date.now()),
        name: email.split('@')[0],
        email: email 
      };

      alert(`Conta criada com sucesso no SuperDB!`);
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
