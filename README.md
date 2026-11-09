# Controle de Patrimônio - Prefeitura de Atibaia

Sistema web de controle de ativos e patrimônio para o departamento municipal.

## Versão Atual: `v1.1.0.12` (Correção do Erro 404 de Login & Dupla Estratégia de Autenticação)

### Diagnóstico do Erro:
Conforme demonstrado no painel da imagem, o usuário `eduardo.anjos.trabalho@gmail.com` está cadastrado com sucesso no SuperDB [cite: 16].
O erro `404 Not Found` no login ocorria porque a requisição REST direta tentava acessar a rota `/auth/v1/token?grant_type=password` no servidor central `auth.superdb.com.br` sem acionar o motor de autenticação da SDK [cite: 15].

### Solução Aplicada na v1.1.0.12:
1. **Priorização da SDK Oficial Supabase (`client.auth.signInWithPassword`)**: O login agora é realizado via SDK oficial já carregada no projeto, enviando os cabeçalhos `X-SuperDB-Project` e `apikey` diretamente na inicialização do cliente.
2. **Fallback Gracioso para REST**: Mantida a resiliência HTTP com detecção automática de rotas caso o cliente encontre qualquer divergência de endpoint.
3. **Favicon SVG**: Favicon SVG moderno e atualizado integrado.
