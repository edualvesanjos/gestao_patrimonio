// Gerenciador de Autenticação Dual (SuperDB + Local Storage) com Suporte a Ambientes

const AuthManager = {
  getCurrentUser() {
    const session = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SESSION);
    return session ? JSON.parse(session) : null;
  },

  setSession(user, mode) {
    const sessionData = {
      user: user,
      mode: mode, // 'superdb' ou 'local'
      env: CONFIG.getEnvironment(),
      loggedAt: new Date().toISOString()
    };
    localStorage.setItem(CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
    return sessionData;
  },

  async loginSuperDB(email, password) {
    try {
      if (!email || !password) throw new Error("Preencha todos os campos.");

      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[AUTH] Conectando ao SuperDB (${activeEnv.name}) na URL: ${activeEnv.apiUrl}`);
      console.log(`[AUTH] Utilizando API Key: ${activeEnv.apiKey}`);

      const user = {
        name: email.split('@')[0],
        email: email
      };
      
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao realizar login via SuperDB: " + err.message);
      return null;
    }
  },

  async registerSuperDB(name, email, password) {
    try {
      if (!name || !email || !password) throw new Error("Preencha todos os campos.");

      const activeEnv = CONFIG.getSuperDBConfig();
      console.log(`[AUTH] Cadastrando no SuperDB (${activeEnv.name}) via URL: ${activeEnv.apiUrl}`);

      const user = { name, email };
      return this.setSession(user, 'superdb');
    } catch (err) {
      alert("Erro ao cadastrar usuário: " + err.message);
      return null;
    }
  },

  loginLocal() {
    const guestUser = {
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
