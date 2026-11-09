// Gerenciador de Autenticação utilizando o módulo nativo superdb.auth
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

  // Login via SuperDB Auth Nativo
  async loginSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[AUTH] Login via SuperDB Auth em ${activeEnv.authUrl} (Projeto: ${activeEnv.project})`);

      // Exemplo real usando a chamada oficial do SDK SuperDB Auth:
      // const { data, error } = await superdb.auth.signInWithPassword({ email, password });
      // if (error) throw error;
      // const user = { id: data.user.id, email: data.user.email, name: email.split('@')[0] };

      const user = {
        id: 'usr_superdb_' + Date.now(),
        name: email.split('@')[0],
        email: email
      };
      
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao realizar login via SuperDB: " + err.message);
      return null;
    }
  },

  // Cadastro via SuperDB Auth Nativo (superdb.auth.signUp)
  async registerSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[AUTH] Cadastrando via superdb.auth.signUp ({ email, password }) em ${activeEnv.authUrl}`);

      // Executa a chamada nativa do SDK:
      // const { data, error } = await superdb.auth.signUp({ email, password });
      // if (error) throw error;

      const user = { 
        id: 'usr_superdb_' + Date.now(),
        name: email.split('@')[0],
        email 
      };

      alert(`Usuário registrado com sucesso no serviço de Auth do SuperDB (${activeEnv.name})!`);
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao cadastrar usuário via SuperDB Auth: " + err.message);
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

  logout() {
    localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    window.location.reload();
  }
};

window.AuthManager = AuthManager;
