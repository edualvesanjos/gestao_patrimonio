# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.14` (Estratégia Fallback de Login & Resolução de Endpoints)

### O que causou a falha na versão v1.1.0.13:
A requisição direta ao endpoint `https://auth.superdb.com.br/auth/v1/token?grant_type=password` recebia resposta `404 Not Found` [cite: 18]. No ecossistema SuperDB, as APIs REST de projetos específicos respondem na URL com hífen `https://p-bb8ce510ea.superdb.com.br`.

### Solução Aplicada na v1.1.0.14:
- **Estratégia Multi-Endpoint Fallback**: O módulo `js/auth.js` tenta sequencialmente os endpoints da API do projeto (`https://p-bb8ce510ea.superdb.com.br/auth/v1/token?grant_type=password`) e o portal central `auth.superdb.com.br` [cite: 18].
- **Preservação de CORS**: Mantidos exclusivamente os cabeçalhos autorizados (`Content-Type`, `apikey`, `X-SuperDB-Project`) [cite: 18].
- **Iconografia**: Favicon SVG mantido em `favicon.svg`.
