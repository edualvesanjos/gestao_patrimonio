# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.10` (Inclusão do Cabeçalho `X-SuperDB-Project`)

### Diagnóstico do Erro:
A resposta em formato JSON da API indicou expressamente:
`missing_project_header - send the project slug, e.g. X-SuperDB-Project: meu-projeto` [cite: 10]

Como o servidor central `auth.superdb.com.br` atende a múltiplos projetos, ele exige que as requisições HTTP contenham o cabeçalho HTTP personalizado `X-SuperDB-Project` contendo a identificação (slug) do projeto (`p_bb8ce510ea`).

### Solução Aplicada em v1.1.0.10:
- Inclusão do cabeçalho `X-SuperDB-Project: p_bb8ce510ea` nas requisições HTTP REST de cadastro, login e operações de banco de dados (`js/auth.js` e `js/db.js`).
