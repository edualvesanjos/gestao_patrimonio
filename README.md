# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.8` (Correção de Formato da URL SuperDB / CORS)

### O que causou o erro de CORS?
Na URL de conexão estava sendo utilizado `https://p_bb8ce510ea.superdb.com.br` com um caractere de underline `_`. Nos padrões HTTP/DNS e na infraestrutura de roteamento/subdomínio do SuperDB, o nome de host utiliza hífens: `https://p-bb8ce510ea.superdb.com.br`.

### Alterações efetuadas na v1.1.0.8:
- Correção da URL em `js/config.js` para `https://p-bb8ce510ea.superdb.com.br`.
- Inclusão da **Anon Key de Desenvolvimento** em `js/config.js`.
- Ajuste no seletor de ambiente para recarregar com a nova configuração.
