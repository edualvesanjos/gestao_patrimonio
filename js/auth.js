// Gerenciador de Autenticação com cliente SuperDB Real
import { CONFIG } from './config.js';

let superdbClient = null;

export function getSuperDBClient() {
  const cfg = CONFIG.getSuperDBConfig();
  if (!superdbClient && window.supabase) {
    superdbClient = window.supabase.createClient(cfg.url, cfg.anonKey);
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

      const client = getSuperDBClient();
      if (!client) throw new Error("Cliente SuperDB não inicializado.");

      const { data, error } = await client.auth.signInWithPassword({ email, password });
      
      if (error) throw error;
      if (!data || !data.user) throw new Error("Usuário não retornado.");

      const user = {
        id: data.user.id,
        name: data.user.email.split('@')[0],
        email: data.user.email
      };
      
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao realizar login via SuperDB: " + err.message);
      return null;
    }
  },

  async registerSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const client = getSuperDBClient();
      if (!client) throw new Error("Cliente SuperDB não inicializado.");

      const { data, error } = await client.auth.signUp({ email, password });

      if (error) throw error;
      
      if (!data || !data.user) {
        throw new Error("Erro no registro. Verifique a confirmação de e-mail ou se o usuário já existe.");
      }

      const user = { 
        id: data.user.id,
        name: data.user.email.split('@')[0],
        email: data.user.email 
      };

      alert(`Usuário registrado com sucesso no SuperDB!`);
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
    const client = getSuperDBClient();
    if (client) {
      await client.auth.signOut().catch(() => {});
    }
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    window.location.reload();
  }
};

window.AuthManager = AuthManager;
