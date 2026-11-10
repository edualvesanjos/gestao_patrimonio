export const CONFIG = {
  APP_NAME: 'Patrimônio Atibaia', VERSION: '1.1.0.18',
  STORAGE_KEYS: { USER_SESSION: 'patrimonio_v118_session', LOCAL_DATA: 'patrimonio_v118_data', OFFLINE: 'patrimonio_v118_offline' },
  ENVIRONMENTS: {
    dev: {
      name: 'Desenvolvimento', authUrl: 'https://auth.superdb.com.br', apiUrl: 'https://api.superdb.com.br',
      projectSlug: 'p_bb8ce510ea', projectSchema: 'proj_p_bb8ce510ea',
      anonKey: 'eyJhbGciOiJFUzI1NiIsImtpZCI6ImRwa18yNjA2XzY1NzMwNTM2IiwidHlwIjoiSldUIn0.eyJyb2xlIjoiYW5vbiIsInByb2plY3RfaWQiOiJkNGNmM2JkZi00ZDI1LTRhZGItYjcxOS0wZTQ5MWM1VhMTgiLCJwcm9qZWN0X3NjaGVtYSI6InByb2pfcF9iYjhjZTUxMGVhIiwia3YiOjEsInN1YiI6ImFwaWtleTphbm9uIiwiaWF0IjoxNzk0MjQxNTgyLCJpc3MiOiJodHRwczovL2F1dGguc3VwZXJkYi5jb20uYnIiLCJhdWQiOiJodHRwczovL2FwaS5zdXBlcmRiLmNvbS5iciJ9.nGXVWTgL4G7e_Y34w3oSpGO53clyUMPZo-XnCxNw5gtOJxofCcl-LAuL2IXz50IMINL4lQMyBItsDoo6gvFfQw'
    },
    release: null // Sem projeto PROD: nunca usar DEV como fallback.
  },
  getEnvironment() { return 'dev'; },
  getSuperDBConfig() { return this.ENVIRONMENTS.dev; }
};
window.CONFIG = CONFIG;
