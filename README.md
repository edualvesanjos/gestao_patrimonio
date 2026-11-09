# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.7` (Integração com SDK do SuperDB)

### Por que os dados não estavam subindo para o BD na versão anterior?
1. O código anterior **apenas simulava a criação da conta e da sessão**, mas não enviava a chamada HTTP de fato para os endpoints da API do SuperDB.
2. Não havia o cliente oficial instanciado com a **URL da Instância** e a **Anon/Public Key** do projeto.

### O que foi corrigido na v1.1.0.7:
- Inclusão da biblioteca/SDK oficial do SuperDB (`@supabase/supabase-js`) no `index.html`.
- Inicialização dinâmica em `js/auth.js` via `createClient(url, anonKey)`.
- Execução real dos métodos de cadastro (`signUp`), login (`signInWithPassword`) e persistência/sincronização (`from('patrimonios').insert(...)`).

### O que você precisa preencher:
Edite o arquivo `js/config.js` com a **URL** e a **Anon Key** do seu projeto no SuperDB:
```javascript
ENVIRONMENTS: {
  dev: {
    url: 'https://p_bb8ce510ea.superdb.com.br',
    anonKey: 'SUA_ANON_KEY_DEV_AQUI'
  },
  release: {
    url: 'https://p_bb8ce510ea.superdb.com.br',
    anonKey: 'SUA_ANON_KEY_RELEASE_AQUI'
  }
}
```
