# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.13` (Remoção do Header Incompatível com CORS & Rota HTTP REST Direta)

### Diagnóstico do Erro Visualizado na Captura de Tela:
A consola do navegador exibia:
`Requisição cross-origin bloqueada: ... (motivo: header 'x-supabase-api-version' não permitido, de acordo com o header 'Access-Control-Allow-Headers' da resposta de comprovação (preflight) do CORS)` [cite: 18]

A biblioteca/SDK inseria o cabeçalho `x-supabase-api-version` automaticamente nas requisições preflight do browser, o qual é rejeitado pelo CORS do servidor SuperDB [cite: 18].

### Solução Aplicada em v1.1.0.13:
1. **Remoção da Inicialização Automática da SDK com Headers Não Autorizados**: As chamadas de Autenticação (`loginSuperDB` e `registerSuperDB`) foram padronizadas para requisições `fetch` REST nativas contendo estritamente os cabeçalhos aceitos pelo servidor (`Content-Type`, `apikey`, `X-SuperDB-Project`) [cite: 18].
2. **Favicon SVG**: Favicon SVG moderno e atualizado mantido na raiz do projeto.
