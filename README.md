# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.0.1`

### Regras de Versionamento Semantic Versioning (SemVer)
- **`x.x.x`** (Ex: `1.0.1`, `1.1.0`): Utilizado para lançamento de novas funcionalidades, refatorações ou frentes de módulo.
- **`x.x.x.x`** (Ex: `1.0.1.1`): Utilizado exclusivamente para correções pontuais, patches ou bugfixes rápidos.

### Troca de Ambientes (DEV vs RELEASE)
O projeto conta com alternância de chaves API no arquivo `js/config.js`:
- **DEV**: Aponta para o ambiente de testes do SuperDB.
- **RELEASE**: Aponta para o ambiente de produção oficial do SuperDB.

A seleção pode ser feita diretamente na tela de login ou editada no arquivo `config.js`.
