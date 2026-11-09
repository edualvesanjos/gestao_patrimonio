// Configuração global da aplicação, Versionamento e Chaves SuperDB por Ambiente

export const CONFIG = {
  APP_NAME: 'Patrimônio Atibaia',
  VERSION: '1.1.0.5', // Ajuste para SuperDB Auth Nativo (superdb.auth.signUp)
  
  ENV_KEY: 'patrimonio_env_mode',

  STORAGE_KEYS: {
    USER_SESSION: 'patrimonio_user_session',
    LOCAL_DATA: 'patrimonio_items_local'
  },

  ENVIRONMENTS: {
    dev: {
      name: 'Desenvolvimento',
      authUrl: 'https://auth-dev.superdb.com.br',
      project: 'p_bb8ce510ea',
      anonKey: 'CHAVE_SUPERDB_DEV_ANON_KEY'
    },
    release: {
      name: 'Produção (Release)',
      authUrl: 'https://auth.superdb.com.br',
      project: 'p_bb8ce510ea',
      anonKey: 'CHAVE_SUPERDB_RELEASE_ANON_KEY'
    }
  },

  getEnvironment() {
    const savedEnv = localStorage.getItem(this.ENV_KEY);
    return savedEnv && this.ENVIRONMENTS[savedEnv] ? savedEnv : 'release';
  },

  setEnvironment(env) {
    if (this.ENVIRONMENTS[env]) {
      localStorage.setItem(this.ENV_KEY, env);
    }
  },

  getSuperDBConfig() {
    const env = this.getEnvironment();
    return this.ENVIRONMENTS[env];
  }
};

window.CONFIG = CONFIG;
