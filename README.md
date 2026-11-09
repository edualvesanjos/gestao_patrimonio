# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.0.1.1` (Patch Fix)

### Comandos de Execução Local (StackBlitz / Node.js)
```bash
# Instalar dependências (Vite)
npm install

# Iniciar servidor de desenvolvimento
npm run dev

# Gerar build estático para GitHub Pages
npm run build
```

### Regras de Versionamento Semantic Versioning (SemVer)
- **`x.x.x`** (Ex: `1.0.1`, `1.1.0`): Lançamento de novas funcionalidades ou frentes de módulo.
- **`x.x.x.x`** (Ex: `1.0.1.1`): Correções pontuais, patches de execução ou scripts do projeto.

### Troca de Ambientes (DEV vs RELEASE)
O projeto conta com alternância de chaves API no arquivo `js/config.js`:
- **DEV**: Aponta para o ambiente de testes do SuperDB.
- **RELEASE**: Aponta para o ambiente de produção oficial do SuperDB.
