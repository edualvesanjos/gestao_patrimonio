// Configuração global da aplicação, Versionamento e Chaves SuperDB por Ambiente

const CONFIG = {
  APP_NAME: 'Patrimônio Atibaia',
  VERSION: '1.0.1', // Formato x.x.x (Recurso) ou x.x.x.x (Correção/Patch)
  
  // Chave no localStorage para persistir a escolha de ambiente do desenvolvedor/servidor
  ENV_KEY: 'patrimonio_env_mode',

  STORAGE_KEYS: {
    USER_SESSION: 'patrimonio_user_session',
    LOCAL_DATA: 'patrimonio_items_local'
  },

  // Credenciais do SuperDB separadas por ambiente
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

  // Obtém o ambiente selecionado (Padrão: release)
  getEnvironment() {
    const savedEnv = localStorage.getItem(this.ENV_KEY);
    return savedEnv && this.ENVIRONMENTS[savedEnv] ? savedEnv : 'release';
  },

  // Define o ambiente ativo
  setEnvironment(env) {
    if (this.ENVIRONMENTS[env]) {
      localStorage.setItem(this.ENV_KEY, env);
    }
  },

  // Retorna a configuração do SuperDB correspondente ao ambiente ativo
  getSuperDBConfig() {
    const env = this.getEnvironment();
    return this.ENVIRONMENTS[env];
  }
};
