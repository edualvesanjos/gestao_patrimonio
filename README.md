# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.17` (Resolução Definitiva PGRST301 e Eliminação do Bug de Duplicação)

### O que originou as falhas no seu ambiente de testes?
1. **Erro PGRST301 de Sincronização**: O seu navegador guardou em *cache* local (`localStorage`) uma sessão antiga contendo um token de controlo de sessão (`PASETO` iniciado em `v4.local.`). A API de dados exige um JWT real. 
2. **Duplicação Visual ao Editar**: Como o envio para a Nuvem (Cloud) estava a falhar com o erro do token, o sistema tentava executar o modo "fallback local", que usava indevidamente o comando `push` em vez de localizar e atualizar a linha previamente existente no ecrã.

### Correções Aplicadas na v1.1.0.17:
- **Limpeza de Sessão Corrompida (Auto Logout)**: Se o aplicativo detetar um token antigo no seu navegador (`v4.local.`), irá automaticamente desconectá-lo. Basta fazer um novo login e receberá o `data_plane_token` (JWT) válido!
- **Extrator JWT à Prova de Falhas**: Novo algoritmo recursivo que procura e recolhe qualquer JWT válido da resposta de Autenticação para evitar falhas silenciosas.
- **Edição Resiliente Sem Duplicados**: Correção do fallback no `db.js`. O código usa o `findIndex` para sobrepor o item editado.
- **Requisição PATCH**: O botão "Salvar Ativo" (edição) agora utiliza nativamente o verbo `PATCH` com query param `?id=eq.{id}`, garantindo que o servidor substitui exatamente aquele ativo.
