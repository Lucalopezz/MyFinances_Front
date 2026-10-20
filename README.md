# MyFinances: deploy único na Vercel

Este repositório reúne o [front Next.js](apps/web/README.md) e a [API NestJS](apps/api/README.md). O deploy unificado deve usar **outro projeto Vercel**, criado para esta branch, com a raiz deste repositório e o framework **Services**. Assim o projeto `my-finances-front` que já atende produção permanece intacto. O arquivo `vercel.json` publica o front e liga suas chamadas servidoras à API privada do mesmo deployment por `BACKEND_INTERNAL_URL`, gerada automaticamente pela Vercel. O navegador não recebe a URL interna nem o JWT.

## Estado desta etapa

- Front, autenticação, transações, importação e demais rotas da API usam o mesmo deployment. Por decisão do proprietário, o Preview atual usa o MongoDB de produção: alterações feitas nele afetam os dados reais.
- A exportação de transações fica indisponível na Vercel. O módulo BullMQ e o worker não iniciam nas funções HTTP, e a interface não oferece novos pedidos. Em desenvolvimento local, o fluxo anterior continua ativo.
- Não houve mudança no `prisma/schema.prisma` nem execução de migração no banco. O deploy em si não altera os dados; operações feitas pelos usuários no Preview podem alterá-los.

## Variáveis de ambiente

Configure no novo projeto Vercel, para o ambiente de Preview. Um MongoDB separado continua sendo a opção recomendada para testes; o Preview atual foi autorizado a compartilhar o banco de produção:

| Variável | Necessidade | Observação |
| --- | --- | --- |
| `DATABASE_URL` | Obrigatória | Atualmente aponta para o MongoDB de produção também no Preview. Um banco separado evita que testes mudem dados reais. |
| `JWT_SECRET` | Obrigatória | Use um segredo longo e aleatório; ao compartilhar sessões entre deployments, preserve o segredo anterior. |
| `FINANCIAL_DATA_ENCRYPTION_KEY` | Obrigatória | **Ao usar o banco existente, reutilize exatamente a chave de produção** ou os dados financeiros antigos ficarão ilegíveis. |
| `JWT_TOKEN_AUDIENCE` | Conforme configuração anterior | Padrão documentado: `myfinances`. Preserve o valor anterior. |
| `JWT_TOKEN_ISSUER` | Conforme configuração anterior | Padrão documentado: `myfinances-api`. Preserve o valor anterior. |
| `JWT_TTL` e `JWT_REFRESH_TTL` | Opcionais | Padrões do código: `3600` e `86400` segundos. |

`BACKEND_INTERNAL_URL` é um **service binding**: a Vercel a injeta apenas no front em cada deployment. Não crie essa variável manualmente. `BACKEND_URL` é só o fallback para desenvolvimento local. Nesta etapa da Vercel, `REDIS_URL`, `EXPORT_STORAGE_PATH`, `TRANSACTION_EXPORT_BATCH_SIZE`, `PORT` e `FRONTEND_URL` não são necessários para as rotas publicadas. Não use `NEXT_PUBLIC_*` para segredos.

## Publicação

1. O projeto Vercel separado `my-finances-unificado` já foi criado com **Root Directory** na raiz deste repositório e **Framework Preset** em **Services**. Não mude as configurações do projeto `my-finances-front` que já está em produção.
2. Em **Settings → Environment Variables** do novo projeto, configure as variáveis para **Preview**. Confira que `DATABASE_URL` aponta para o MongoDB pretendido e que a chave de criptografia corresponde aos dados existentes. Depois de salvar as variáveis, faça um novo deployment: elas não atualizam o Preview anterior.
3. Confirme o projeto selecionado com `vercel project inspect --non-interactive` na raiz antes de qualquer deploy. Publique um Preview da branch `deploy-unificado-vercel` e teste `/api/health`, login e leitura. Faça testes de gravação apenas se aceitar que eles modificarão o banco configurado. A publicação inicial foi feita pelo CLI; até conectar o Git a este novo projeto, novos pushes não criam Previews automaticamente nele.
4. Mantenha a branch `main` e o deployment atual intactos. O rollback do código do Preview é o redeploy do commit anterior desta branch; alterações de dados exigem reversão própria ou backup.

O build da API executa `prisma generate` e `nest build`, mas não chama `prisma db push`. Com Prisma 6 e MongoDB, `db push` não gera histórico de migrações reversíveis; por isso esta integração não sincroniza schema automaticamente. Para qualquer mudança futura no banco, prepare scripts versionados de avanço e reversão, valide ambos em uma cópia descartável e faça backup antes de aplicar em produção.

Na Vercel, a limpeza periódica de importações fica desligada: funções HTTP não executam timers de manutenção de forma confiável. No Preview com banco ainda compartilhado com produção, isso também impede uma exclusão automática de dados ao iniciar a API.

## Novas funcionalidades

Use esta branch unificada como base: `apps/web` contém o front e `apps/api` contém o back. Crie uma branch de feature a partir de `deploy-unificado-vercel`, altere as duas pastas necessárias, rode os testes relevantes e abra um PR de volta para `deploy-unificado-vercel`. O repositório `MyFinances_API` original não é sincronizado automaticamente com esta cópia; escolha o repositório unificado como fonte das próximas mudanças para evitar divergência. Enquanto o novo projeto Vercel não estiver ligado ao GitHub, faça o deploy de Preview pelo CLI. Não una esta branch à `main` antiga antes de planejar a troca da produção.

## Desenvolvimento local

Cada app mantém seu `package-lock.json` e os comandos próprios. Para iniciar como antes, use um terminal em `apps/api` e outro em `apps/web`, com `BACKEND_URL=http://localhost:3001` no front. A API local continua usando MongoDB e Redis. Com o CLI instalado, `vercel dev -L` na raiz executa os serviços e injeta o binding local.
