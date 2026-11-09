# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.11` (Favicon SVG Moderno & Tratamento Robusto do Parse de Auth)

### Correção de Login:
- O erro `JSON.parse: unexpected non-whitespace character after JSON data...` ocorria quando a resposta HTTP de autenticação/login não retornava JSON puro [cite: 13].
- Adicionado tratamento em `js/auth.js` com `.text()` e `try/catch` para capturar a mensagem legível retornada pelo servidor antes de tentar o parse do JSON.
