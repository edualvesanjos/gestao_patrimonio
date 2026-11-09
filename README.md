# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.16` (Resolução do Token PGRST301, Evitar Duplicação & Indicador de Status Sync)

### 1. Correção do Erro `PGRST301` ("Token inválido para a API de dados")
No SuperDB, o token de sessão retornado (`access_token`) utiliza o formato PASETO e é exclusivo do control-plane de autenticação. Para consumir a API REST de dados (`data-plane`), deve ser enviado o `data_plane_token` (JWT válido).
- Atualizado em `js/auth.js` para armazenar `user.dataPlaneToken`.
- Atualizado em `js/db.js` para enviar `Authorization: Bearer ${user.dataPlaneToken}` em todas as requisições à REST API.

### 2. Eliminação de Registros Duplicados na Edição
- Ao editar um item, o `saveItem` preserva rigorosamente o ID existente (`pat_...` ou ID original do banco).
- Adicionada a instrução `Prefer: resolution=merge-duplicates` no `POST` da REST API para realizar UPSERT (atualização sem criar novos registros).

### 3. Indicador Visual de Status de Sincronização (Local vs Nuvem)
- Adicionada uma coluna **Origem / Sync** na tabela principal de patrimônios.
- **☁️ Nuvem** (Badge Azul): Indica que o item está persistido e confirmado no Banco de Dados SuperDB.
- **💻 Local** (Badge Laranja): Indica que o item foi salvo/editado localmente no browser e aguarda sincronização.
