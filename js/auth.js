// Gerenciador de Autenticação Dual (SuperDB + Local Storage)

const AuthManager = {
    // Retorna o usuário logado atualmente ou null
    getCurrentUser() {
      const session = localStorage.getItem(CONFIG.STORAGE_KEYS.USER_SESSION);
      return session ? JSON.parse(session) : null;
    },
  
    // Salva a sessão do usuário
    setSession(user, mode) {
      const sessionData = {
        user: user,
        mode: mode, // 'superdb' ou 'local'
        loggedAt: new Date().toISOString()
      };
      localStorage.setItem(CONFIG.STORAGE_KEYS.USER_SESSION, JSON.stringify(sessionData));
      return sessionData;
    },
  
    // Login via SuperDB
    async loginSuperDB(email, password) {
      try {
        // Simulação de chamada de API ao SuperDB
        // Na integração real, fazer fetch() para CONFIG.SUPERDB.API_URL
        if (!email || !password) throw new Error("Preencha todos os campos.");
  
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
  
    // Cadastro via SuperDB
    async registerSuperDB(name, email, password) {
      try {
        if (!name || !email || !password) throw new Error("Preencha todos os campos.");
  
        const user = { name, email };
        return this.setSession(user, 'superdb');
      } catch (err) {
        alert("Erro ao cadastrar usuário: " + err.message);
        return null;
      }
    },
  
    // Acesso Local / Modo Convidado (Sem cadastro)
    loginLocal() {
      const guestUser = {
        name: 'Servidor (Local)',
        email: 'modo.local@atibaia.sp.gov.br'
      };
      return this.setSession(guestUser, 'local');
    },
  
    // Logout
    logout() {
      localStorage.removeItem(CONFIG.STORAGE_KEYS.USER_SESSION);
      window.location.reload();
    }
  };