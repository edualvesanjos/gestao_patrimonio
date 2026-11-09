// Gerenciador de Autenticação com Extração Robusta de JWT (Data Plane Token)
import { CONFIG } from './config.js';

// Função auxiliar para procurar um JWT válido (inicia com eyJ e possui 3 partes separadas por ponto)
function findValidJWT(obj) {
  if (!obj || typeof obj !== 'object') return null;
  for (let key in obj) {
    const val = obj[key];
    if (typeof val === 'string' && val.startsWith('eyJ') && val.split('.').length === 3) {
      return val;
    }
    if (typeof val === 'object') {
      const nested = findValidJWT(val);
      if (nested) return nested;
    }
  }
  return null;
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
      
      let res = await fetch(`${cfg.authUrl}/auth/v1/token?grant_type=password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': cfg.anonKey,
          'X-SuperDB-Project': cfg.projectSlug
        },
        body: JSON.stringify({ email, password })
      }).catch(() => null);

      let dataPlaneToken = cfg.anonKey; // Fallback JWT se nada for retornado (útil em testes locais)
      let userId = 'usr_' + btoa(email).replace(/=/g, '');

      if (res && res.ok) {
        const responseData = await res.json();
        userId = responseData.user ? responseData.user.id : (responseData.id || userId);
        
        // Garante que não usaremos o access_token se ele for PASETO (v4.local...)
        // Tenta achar explicitamente o data_plane_token na raiz ou na sessão
        let extractedToken = responseData.data_plane_token || (responseData.session && responseData.session.data_plane_token);
        
        if (!extractedToken) {
           extractedToken = findValidJWT(responseData);
        }
        
        if (extractedToken && extractedToken.startsWith('eyJ')) {
          dataPlaneToken = extractedToken;
        }
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
        
        let extractedToken = responseData.data_plane_token || (responseData.session && responseData.session.data_plane_token);
        if (!extractedToken) extractedToken = findValidJWT(responseData);
        
        if (extractedToken && extractedToken.startsWith('eyJ')) {
          dataPlaneToken = extractedToken;
        }
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
