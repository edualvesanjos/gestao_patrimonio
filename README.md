# Gestão de Patrimônio — Atibaia (DEV v1.1.0.19)

## Instalação e publicação

Projeto Vite estático, adequado a GitHub Pages após `npm install` e `npm run build`.
Esta versão é exclusiva para branch `develop` e SuperDB DEV `p_bb8ce510ea`.
**Não publicar em `main`**. Produção não está configurada e não existe fallback para DEV.

## Segurança e primeiro acesso

- Login via `POST /auth/v1/signin`; exige resposta com `user.id` e `data_plane_token`.
- O cadastro pelo aplicativo está temporariamente desativado; criar contas no painel SuperDB.
- Primeiro login online exige PIN de 6 números; dados locais criptografados com AES-GCM e chave PBKDF2.
- A cada reinício da página, entrar online e informar PIN ou desbloquear com PIN offline.
- Tokens de autenticação não são persistidos. Para sincronizar após reiniciar, fazer login online.
- PIN não é substituto para autenticação remota. Bloqueio local pode ser contornado por quem controla o navegador; usar dispositivos protegidos.
- Sem internet no primeiro acesso, não há perfil offline válido.

## Dados e sincronização

- Alterações ficam criptografadas no navegador e indicadas como pendentes até sincronização manual.
- O botão de sincronização envia registros novos e alterações cuja versão-base remota não tenha mudado.
- Se detectar conflito, interrompe e preserva o registro local. A interface de resolução de conflitos é uma etapa posterior.
- Não limpar dados do site, cache de armazenamento nem usar modo privado para trabalho duradouro.
- **Dados locais legados** de v1.1.0.17 permanecem intactos na chave antiga `patrimonio_items_local`, mas não são importados automaticamente por não terem identidade comprovada; revisar antes de migração.
- A sincronização depende de permissões RLS e schema compatíveis; testar apenas em DEV.

## Limitações da primeira entrega

- Não foi realizado teste de integração com o serviço SuperDB nem com usuários reais.
- Não há resolução interativa de conflitos; registros conflitantes permanecem pendentes.
- Um navegador com perfil offline configurado é associado a um único usuário; migração multiusuário depende de projeto posterior.
- O armazenamento local usa localStorage criptografado. A migração para IndexedDB pode ser planejada após validar a integração.
- Os dados não são disponíveis offline no primeiro acesso até uma consulta online bem-sucedida.

## Testes recomendados

1. Login válido e inválido; conferir status da requisição `/auth/v1/signin`.
2. Criar PIN, sair, desligar rede e desbloquear pelo PIN.
3. Cadastrar item offline e verificar indicador Local.
4. Restaurar rede, entrar online, desbloquear PIN e clicar em sincronizar.
5. Confirmar no painel SuperDB que o registro foi gravado.
6. Editar e sincronizar; simular alteração concorrente e confirmar bloqueio.
7. Validar que nenhum dado é enviado ao ambiente PROD.

## Correção v1.1.0.19

- Reescrita a expressão de versão-base em `js/db.js` para eliminar o erro de parsing do navegador.
- Corrigida a identificação de sessão online na interface.
- Mantidas as chaves de armazenamento local da v1.1.0.18 para preservar dados e PIN.
