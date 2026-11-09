# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.9` (Roteamento Direto para Endpoints Centrais SuperDB)

### Análise da Chave JWT Fornecida:
Decodificando a JWT fornecida, os dados de infraestrutura do SuperDB são:
- `iss` (Emissor Auth): `https://auth.superdb.com.br`
- `aud` (Audiência API): `https://api.superdb.com.br`
- `project_id`: `d4cf3bdf-4d25-4adb-b719-0e491c565a18`
- `project_schema`: `proj_p_bb8ce510ea`

### Solução Aplicada em v1.1.0.9:
As chamadas REST foram redirecionadas para o serviço oficial central em `https://auth.superdb.com.br/auth/v1/signup` com o header `apikey`, eliminando a dependência do subdomínio customizado.
