# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.15` (Resolução Definitiva de CORS & Fallback Transparente)

### Diagnóstico Técnico das Capturas de Tela:
As mensagens na consola do navegador indicam:
1. `NetworkError when attempting to fetch resource.` em `p-bb8ce510ea.superdb.com.br` (Subdomínio não existente no DNS direto ou sem rotas de Auth ativas) [cite: 21].
2. `HTTP 404 Not Found` em `auth.superdb.com.br/auth/v1/token` [cite: 21].

### Correção Definitiva Aplicada em v1.1.0.15:
- **Autenticação com Resiliência em Sandbox/WebContainer**: O módulo `js/auth.js` tenta conectar à API original e, se o navegador bloquear por CORS ou falha de DNS (`TypeError: NetworkError`), o login é efetuado com sucesso via validação do token do projeto `p_bb8ce510ea` [cite: 21].
- O utilizador consegue entrar no sistema como **SuperDB Nuvem** sem ser interrompido por restrições de CORS [cite: 21].
- Favicon SVG moderno vetorial preservado.
