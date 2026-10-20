# Testes do frontend

Os testes, configurações e auxiliares ficam em `tests/`, separados de `src/`:

- `unit/`: schemas, datas civis, valores, filtros mensais, sessão, transporte e disponibilidade.
- `integration/`: componentes React com formulários, hooks e QueryClient reais; Server Actions com transporte real e limites externos controlados.
- `e2e/`: navegador Chromium com Next, API Nest, JWT, bcrypt, MongoDB, Redis e worker reais.
- `legacy/`: os 36 testes anteriores de conexão, notificações e exportação, preservados no runner nativo do Node.
- `support/`: auxiliares exclusivos dos testes, incluindo o ciclo de vida dos serviços E2E.

## Comandos

Use Node.js 24 ou superior e npm. Instale as dependências com `npm ci`.

| Comando | Uso |
| --- | --- |
| `npm test` | Suítes anteriores, unitários e integrações, sem API nem navegador |
| `npm run test:unit` | Regras e funções isoladas |
| `npm run test:integration` | Componentes, providers, hooks e Server Actions |
| `npm run test:legacy` | As suítes anteriores |
| `npm run test:watch` | Desenvolvimento com Vitest |
| `npm run test:cov` | Unitários e integrações com relatório V8 |
| `npm run test:e2e` | Fluxos completos com navegador e serviços locais |
| `npm run test:all` | Todas as camadas em sequência |
| `npm run typecheck` | TypeScript estrito, incluindo os testes |

Os comandos `test:connection`, `test:notifications` e `test:exports` continuam disponíveis. Configurações específicas ficam em `tests/vitest.config.mts` e `tests/playwright.config.ts`. Para escolher um cenário:

```bash
npx vitest run --config tests/vitest.config.mts tests/unit/schemas/financial-forms.test.ts
npm run test:e2e -- --project=desktop --grep 'cria, edita'
```

## Ambiente E2E

O runner precisa de um checkout da API com dependências de desenvolvimento instaladas e Prisma Client gerado. Por padrão, usa `../MyFinances_API`, sem alterar os arquivos desse repositório. Para preparar o ambiente a partir do frontend:

```bash
npm ci
npx playwright install chromium
cd ../MyFinances_API
npm ci
npx prisma generate
npm run db:local
cd ../MyFinances_Front
npm run test:e2e
```

O comando inicia e encerra automaticamente a API em `127.0.0.1:3101` e o Next em `127.0.0.1:3100`. Não reaproveita servidores existentes. O Next roda em desenvolvimento com diretório `.next-e2e`, separado do `.next` habitual. Os testes não validam o bundle ou o tratamento de erros exclusivo da build de produção; a verificação de tipos e a build são validações separadas.

MongoDB usa por padrão `mongodb://127.0.0.1:27028/?replicaSet=rs0&directConnection=true`, e Redis usa `redis://127.0.0.1:6380`. O Mongo precisa de replica set para operações financeiras atômicas. Personalizações podem ser exportadas no shell:

| Variável | Uso |
| --- | --- |
| `E2E_API_DIR` | Caminho para o checkout local da API |
| `E2E_FRONTEND_PORT` / `E2E_API_PORT` | Portas dos dois processos exclusivos dos testes |
| `TEST_DATABASE_URL` | Servidor MongoDB local para criar o banco aleatório |
| `TEST_REDIS_URL` | Servidor Redis local para criar a fila exclusiva |
| `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` | Caminho opcional para Chromium já instalado |

Destinos remotos são recusados. Cada execução cria banco, prefixo de fila e pasta de exportações aleatórios, removidos no encerramento. Nenhuma limpeza usa `DATABASE_URL` ou o banco habitual da aplicação. Segredos JWT e chave financeira são fixtures exclusivas dos testes. Cada caso tem uma conta própria; preparação dos casos financeiros usa HTTP da API para criar conta e sessão, e o fluxo de cadastro/login/logout também é exercitado inteiramente pela interface.

O projeto `desktop` cobre todos os fluxos; `mobile` repete os cenários de autenticação e navegação com viewport móvel. Falhas geram screenshot, trace e contexto em `test-results/`; o relatório fica em `playwright-report/index.html`.

## Cobertura e limites

`npm run test:cov` mede todos os arquivos TypeScript/TSX de produção, inclusive os ainda sem testes. Gera `coverage/index.html`, `coverage/lcov.info` e `coverage/coverage-summary.json`. Não inclui os testes Node legados, que carregam módulos dinamicamente, nem agrega execução de navegador/servidor dos E2E. Portanto, seus percentuais não representam a cobertura consolidada das três camadas.

O piso global inicial é 25% de linhas/statements e 18% de funções/branches. Há exigências maiores para regras já isoladas: schemas exigem 100% de linhas/statements/funções e 90% de branches; utilitários exigem 95% de linhas; o transporte compartilhado exige 90% de linhas e 95% de branches. A medição global ainda deixa espaço para ampliar a cobertura de componentes e páginas; os E2E complementam os fluxos principais, sem inflar esse percentual.

Na validação desta ampliação, passaram **254 testes**: 36 anteriores, 100 unitários, 100 de integração e 18 E2E (14 desktop e 4 mobile). O Vitest mediu 26,44% de linhas, 26,17% de statements, 19,42% de branches e 19,83% de funções sobre todo o `src`. Os schemas tiveram 100% de linhas, e os utilitários de datas e formatação ficaram acima de 95%. Passaram também `npm run typecheck`, a build de produção e a revisão de formatação. O encerramento dos E2E foi conferido sem bancos nem chaves de fila residuais da execução.

Os cenários abrangem validação e acessibilidade de formulários; datas e recorrências; sessão HTTP-only, limpeza e isolamento de cache; falhas e reconexão sem repetir gravações; transporte, autorização e revalidação das ações financeiras; estados de carregamento, erro e recuperação; transações e filtros; wishlist; calendário; cartões e parcelas; orçamento; despesas fixas e notificações; perfil/senha; importação CSV e download de exportação assíncrona.

As correções de rótulos/erros dos inputs, identificação da exclusão e feedback/bloqueio do cadastro foram precedidas por testes que falharam pelo comportamento ausente. Novas alterações devem seguir TDD e regressão obrigatória, conforme `AGENTS.md`.
