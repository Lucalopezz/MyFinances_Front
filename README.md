# MyFinances: deploy único na Vercel

Este repositório reúne o [front Next.js](apps/web/README.md) e a [API NestJS](apps/api/README.md). O deploy unificado deve usar **outro projeto Vercel**, criado para esta branch, com a raiz deste repositório e o framework **Services**. Assim o projeto `my-finances-front` que já atende produção permanece intacto. O arquivo `vercel.json` publica o front e liga suas chamadas servidoras à API privada do mesmo deployment por `BACKEND_INTERNAL_URL`, gerada automaticamente pela Vercel. O navegador não recebe a URL interna nem o JWT.

## Estado desta etapa

- Front, autenticação, transações, importação e demais rotas da API usam o mesmo deployment e o MongoDB configurado para o Preview.
- A exportação de transações fica indisponível na Vercel. O módulo BullMQ e o worker não iniciam nas funções HTTP, e a interface não oferece novos pedidos. Em desenvolvimento local, o fluxo anterior continua ativo.
- Não houve mudança no `prisma/schema.prisma` nem execução de migração no banco. Nenhum dado existente é alterado por esta integração.

## Variáveis de ambiente

Configure no novo projeto Vercel, para o ambiente de Preview. Use um banco MongoDB separado do de produção enquanto valida esta branch:

| Variável | Necessidade | Observação |
| --- | --- | --- |
| `DATABASE_URL` | Obrigatória | URL de um MongoDB de Preview, com replica set e índices do schema atual. Preserve o banco de produção. |
| `JWT_SECRET` | Obrigatória | Pode ser diferente em Preview; preserve a anterior somente se futuramente migrar este deploy para o banco e domínio de produção. |
| `FINANCIAL_DATA_ENCRYPTION_KEY` | Obrigatória | Gere uma chave para Preview. **Ao usar o banco existente no futuro, reutilize exatamente a chave de produção** ou os dados financeiros antigos ficarão ilegíveis. |
| `JWT_TOKEN_AUDIENCE` | Conforme configuração anterior | Padrão documentado: `myfinances`. Preserve o valor anterior. |
| `JWT_TOKEN_ISSUER` | Conforme configuração anterior | Padrão documentado: `myfinances-api`. Preserve o valor anterior. |
| `JWT_TTL` e `JWT_REFRESH_TTL` | Opcionais | Padrões do código: `3600` e `86400` segundos. |

`BACKEND_INTERNAL_URL` é um **service binding**: a Vercel a injeta apenas no front em cada deployment. Não crie essa variável manualmente. `BACKEND_URL` é só o fallback para desenvolvimento local. Nesta etapa da Vercel, `REDIS_URL`, `EXPORT_STORAGE_PATH`, `TRANSACTION_EXPORT_BATCH_SIZE`, `PORT` e `FRONTEND_URL` não são necessários para as rotas publicadas. Não use `NEXT_PUBLIC_*` para segredos.

## Publicação

1. Crie um projeto Vercel separado do `my-finances-front`, com **Root Directory** na raiz deste repositório e **Framework Preset** em **Services**. Não mude as configurações do projeto que já está em produção.
2. Configure as variáveis de Preview no novo projeto e confira que `DATABASE_URL` aponta para um MongoDB de Preview já preparado com os índices necessários.
3. Confirme o projeto selecionado com `vercel project inspect --non-interactive` na raiz antes de qualquer deploy. Publique um Preview da branch `deploy-unificado-vercel` e teste `/api/health`, login, leitura e gravação de uma transação e importação.
4. Mantenha a branch `main`, o deployment atual e o banco de produção intactos. O rollback do Preview é o redeploy do commit anterior desta branch.

O build da API executa `prisma generate` e `nest build`, mas não chama `prisma db push`. Com Prisma 6 e MongoDB, `db push` não gera histórico de migrações reversíveis; por isso esta integração não sincroniza schema automaticamente. Para qualquer mudança futura no banco, prepare scripts versionados de avanço e reversão, valide ambos em uma cópia descartável e faça backup antes de aplicar em produção.

## Desenvolvimento local

Cada app mantém seu `package-lock.json` e os comandos próprios. Para iniciar como antes, use um terminal em `apps/api` e outro em `apps/web`, com `BACKEND_URL=http://localhost:3001` no front. A API local continua usando MongoDB e Redis. Com o CLI instalado, `vercel dev -L` na raiz executa os serviços e injeta o binding local.
