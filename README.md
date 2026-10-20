# MyFinances

Monorepositório principal do MyFinances: [interface Next.js](apps/web/README.md) em `apps/web` e [API NestJS](apps/api/README.md) em `apps/api`. O código dos dois serviços, os testes e a documentação evoluem na mesma branch. O antigo repositório `MyFinances_API` permanece apenas como referência histórica; novas mudanças devem ser feitas aqui.

## Aplicação e código

- **Aplicação em produção:** [my-finances-front.vercel.app](https://my-finances-front.vercel.app).
- **Código principal:** [github.com/Lucalopezz/MyFinances](https://github.com/Lucalopezz/MyFinances), branch `main`.
- **Estado do frontend antes da unificação:** branch [`backup/main-before-monorepo-2026-10-20`](https://github.com/Lucalopezz/MyFinances/tree/backup/main-before-monorepo-2026-10-20).
- **API original:** [MyFinances_API](https://github.com/Lucalopezz/MyFinances_API), mantida como histórico.

## Como funciona o deploy

O projeto Vercel `my-finances-unificado` usa **Services** com a raiz deste repositório: o `vercel.json` publica o front e a API no mesmo deployment. O front acessa a API privada pelo service binding `BACKEND_INTERNAL_URL`; essa URL e o JWT não são expostos ao navegador.

O GitHub está conectado à Vercel. Cada push na `main` gera um deployment de produção dos dois serviços; pushes em outras branches geram Previews. Para novas funcionalidades, crie uma branch a partir de `main`, altere `apps/web` e/ou `apps/api`, execute os testes afetados e abra um PR para `main`. Também é possível publicar manualmente com `vercel deploy --prod` a partir da raiz, após confirmar o projeto com `vercel project inspect --non-interactive`.

**Atenção aos Previews:** a configuração atual usa o mesmo MongoDB da produção. Cadastro, edição, remoção e testes de escrita em Preview afetam dados reais. Use um banco separado antes de testar alterações destrutivas ou migrações. O build executa `prisma generate`, mas não executa `prisma db push`; mudanças de schema exigem preparação e backup próprios.

## Exportações

Na Vercel, PDF, CSV e XLSX são gerados na própria requisição autenticada e enviados em stream. Cada arquivo fica em um diretório temporário exclusivo e é removido após o download. Não há Redis, worker ou armazenamento compartilhado nesse fluxo. Em desenvolvimento local, o fluxo anterior com BullMQ e Redis continua disponível. Históricos muito grandes podem atingir o limite de duração da função.

## Configuração

As variáveis `DATABASE_URL`, `JWT_SECRET` e `FINANCIAL_DATA_ENCRYPTION_KEY` são obrigatórias no projeto Vercel. Ao usar o banco existente, preserve exatamente a chave de criptografia para manter a leitura dos dados. `JWT_TOKEN_AUDIENCE` e `JWT_TOKEN_ISSUER` devem corresponder aos tokens já emitidos; os padrões do código são `myfinances` e `myfinances-api`. `JWT_TTL` e `JWT_REFRESH_TTL` são opcionais. `TRANSACTION_EXPORT_BATCH_SIZE` controla opcionalmente a leitura em lotes.

`BACKEND_INTERNAL_URL` é injetada automaticamente pela Vercel no front. `BACKEND_URL` serve como fallback local. `REDIS_URL`, `EXPORT_STORAGE_PATH`, `PORT` e `FRONTEND_URL` não são necessários no deployment da Vercel. Não use `NEXT_PUBLIC_*` para segredos.

## Desenvolvimento local

Cada app mantém seu próprio `package-lock.json`. Para iniciar os dois serviços, use terminais separados:

```bash
cd apps/api
npm ci
npm run setup:local
npm run db:local
npx prisma generate
npx prisma db push
npm run start:dev
```

```bash
cd apps/web
npm ci
npm run dev
```

O script `setup:local` preserva arquivos `.env` existentes e configura o front para a API local. MongoDB e Redis locais são usados no desenvolvimento; consulte o [guia de ambiente local](apps/api/docs/local-development.md) antes de criar dados de exemplo. Para os testes, veja os guias da [API](apps/api/docs/testing.md) e do [front](apps/web/docs/testing.md).

Na Vercel, a limpeza periódica de importações permanece desligada: funções HTTP não executam timers de manutenção de forma confiável.
