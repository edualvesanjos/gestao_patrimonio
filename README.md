# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0` (Módulo CRUD de Patrimônio)

### O que há de novo na v1.1.0:
- **Formulário de Cadastro/Edição de Ativos**: Modal interativo com suporte a todos os campos (`Item`, `Número do Patrimônio`, `Categoria`, `Quantidade`, `Fabricante`, `Modelo` e `Observações`).
- **Tabela Responsiva de Ativos**: Exibição centralizada com badges de status (`Ativo`, `Baixado` e `Transferido`).
- **Persistência Híbrida (`js/db.js`)**: Operações de CRUD prontas para LocalStorage e abstraídas para conexão de API com o SuperDB.
- **Ações Rápidas**: Edição em tempo real e alternância com 1 clique de baixa/reativação do ativo.
- **Cards de Estatísticas**: Indicadores em tempo real do total de patrimônios, quantidade física em estoque, reativos e baixados.

### Comandos para Executar Localmente
```bash
npm install
npm run dev
```
