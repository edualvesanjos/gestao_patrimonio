# Gestão de Patrimônio – Atibaia | DEV v1.1.1

## Objetivo desta versão

Operação **somente online**: cadastro, edição e baixa dependem de resposta confirmada da API SuperDB. Falha HTTP não gera cadastro local nem mensagem falsa de sucesso.

## Preservação de dados antigos

Os dados criptografados das versões v1.1.0.18/19 continuam nas mesmas chaves do navegador. Não limpar o armazenamento, não remover PIN e não apagar registros pendentes. O botão **Recuperar pendências** usa o PIN anterior, compara registros remotos e tenta enviar pendências; falhas preservam o que não foi confirmado. O usuário deve conferir o registro no banco após qualquer erro ambíguo.

## Problema conhecido e bloqueio da homologação

A restrição `patrimonios_usuario_id_fkey` aponta para `usuarios.id`, tabela vazia no projeto DEV. O HTTP 409 continuará até que o relacionamento e a política de acesso sejam corrigidos no servidor. **Esta versão não modifica schema nem implementa RBAC.** Não remover a FK indiscriminadamente nem criar usuários fictícios. Primeiro validar como o SuperDB associa identidade nativa, vínculos de acesso e políticas RLS. Nenhuma regra de autorização deve depender apenas de JavaScript.

## Limites e cuidados

- O aplicativo exige login online a cada abertura e não disponibiliza acesso offline.
- O PIN antigo é usado apenas para recuperação dos dados locais preexistentes, não para autenticação offline.
- A interface de perfis configuráveis e o administrador inicial ainda não foram implementados.
- A branch `main` e o SuperDB PROD permanecem fora do escopo; o projeto PROD não existe.
- Em caso de falha de rede após envio de POST, verifique no banco antes de repetir para evitar duplicidade.

## Validação recomendada

1. Subir arquivos na branch `develop`, realizar commit antes dos testes.
2. Entrar com usuário SuperDB DEV e verificar HTTP 200 em `signin`.
3. Consultar patrimônios; em caso de erro, conferir mensagem real e políticas de acesso.
4. **Não tentar gravar novamente o patrimônio 111222** até corrigir a FK.
5. Planejar a migração de relacionamento/RBAC antes de homologar gravação.


## v1.1.2 DEV — diagnóstico RPC

- Botão **Testar permissão RPC** na tela principal após login.
- Consulta exclusivamente a função `usuario_tem_permissao('patrimonios.consultar')` via POST `/rest/v1/rpc/usuario_tem_permissao`, usando a sessão autenticada já existente.
- Mostra resultado booleano ou erro HTTP sem exibir tokens.
- Não altera RLS, dados, login, PIN ou sincronização.
- Teste ainda pendente de execução pelo usuário em DEV.


## v1.1.3 DEV — login sem PIN
- Login online não solicita PIN automaticamente, mesmo com dados legados.
- O PIN continua disponível exclusivamente no botão Recuperar pendências.
- A aba de cadastro público foi ocultada e o botão de login renomeado para Entrar.
- Cadastro por Administrador: **ainda não implementado**. Requer rota de servidor protegida com validação de `usuarios.gerenciar` e integração segura com a API de autenticação. Não inserir service_role no navegador e não confundir ocultação de UI com autorização.
- Não há alteração de schema, políticas RLS ou ambiente PROD.
