# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.5` (Migração para SuperDB Auth Nativo)

### O que mudou na v1.1.0.5:
- **Remoção da tabela customizada `usuarios`**: O sistema agora utiliza 100% o serviço nativo de autenticação do SuperDB (`auth.users`).
- **Ajuste da Chave Estrangeira**: A tabela `patrimonios` agora faz referência direta a `auth.users(id)` utilizando o tipo `UUID`.
- **Uso do `superdb.auth.signUp`**: Integração com a chamada nativa fornecida nas instruções do SuperDB.
- **Simplificação do Formulário de Cadastro**: Removido campo desnecessário de nome, utilizando apenas `email` e `senha` nativos do SuperDB Auth.

### Execução Local
```bash
npm install
npm run dev
```
