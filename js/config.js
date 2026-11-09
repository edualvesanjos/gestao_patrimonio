// Configuração do Cliente SuperDB (SDK Supabase/SuperDB)

export const CONFIG = {
  APP_NAME: 'Patrimônio Atibaia',
  VERSION: '1.1.0.7',
  
  ENV_KEY: 'patrimonio_env_mode',

  STORAGE_KEYS: {
    USER_SESSION: 'patrimonio_user_session',
    LOCAL_DATA: 'patrimonio_items_local'
  },

  // Insira a URL e a Anon/Public Key do seu projeto SuperDB aqui:
  ENVIRONMENTS: {
    dev: {
      name: 'Desenvolvimento',
      url: 'https://p_bb8ce510ea.superdb.com.br', // Substitua pela URL da instância DEV
      anonKey: 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImRwa18yNjA2XzY1NzMwNTM2IiwidHlwIjoiSldUIn0.eyJyb2xlIjoiYW5vbiIsInByb2plY3RfaWQiOiJkNGNmM2JkZi00ZDI1LTRhZGItYjcxOS0wZTQ5MWM1NjVhMTgiLCJwcm9qZWN0X3NjaGVtYSI6InByb2pfcF9iYjhjZTUxMGVhIiwia3YiOjEsInN1YiI6ImFwaWtleTphbm9uIiwiaWF0IjoxNzk0MjQxNTgyLCJpc3MiOiJodHRwczovL2F1dGguc3VwZXJkYi5jb20uYnIiLCJhdWQiOiJodHRwczovL2FwaS5zdXBlcmRiLmNvbS5iciJ9.nGXVWTgL4G7e_Y34w3oSpGO53clyUMPZo-XnCxNw5gtOJxofCcl-LAuL2IXz50IMINL4lQMyBItsDoo6gvFfQw'
    },
    release: {
      name: 'Produção (Release)',
      url: 'https://p_bb8ce510ea.superdb.com.br', // Substitua pela URL da instância RELEASE
      anonKey: 'SUA_ANON_KEY_RELEASE_AQUI'
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
