// Configuração global da aplicação, Versionamento e Chaves SuperDB por Ambiente

export const CONFIG = {
  APP_NAME: 'Patrimônio Atibaia',
  VERSION: '1.1.0', // Versão 1.1.0 - Módulo CRUD de Patrimônio
  
  ENV_KEY: 'patrimonio_env_mode',

  STORAGE_KEYS: {
    USER_SESSION: 'patrimonio_user_session',
    LOCAL_DATA: 'patrimonio_items_local'
  },

  ENVIRONMENTS: {
    dev: {
      name: 'Desenvolvimento',
      apiUrl: 'https://dev-api.superdb.example/v1',
      apiKey: 'CHAVE_SUPERDB_DEV_XXXXXXXXXXXXXXXX'
    },
    release: {
      name: 'Produção (Release)',
      apiUrl: 'https://api.superdb.example/v1',
      apiKey: 'CHAVE_SUPERDB_RELEASE_YYYYYYYYYYYYYYYY'
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
