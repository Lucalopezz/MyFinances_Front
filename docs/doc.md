# Documentação Técnica do Front-end

Documentação técnica do front-end do MyFinances. O projeto é uma aplicação Next.js para gerenciamento financeiro pessoal, consumindo uma API externa via HTTP. Consulte o [índice da documentação](README.md), o [escopo atual](features.md) e o [changelog](../CHANGELOG.md) para navegar pelas referências.

## Stack

- Next.js 15 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- Shadcn/UI e Radix UI para componentes base.
- TanStack Query para cache client-side.
- React Hook Form e Zod para formulários e validação.
- Server Actions e `fetch` no servidor para comunicação com a API.
- Recharts para gráficos.
- `next-themes` para tema claro/escuro.

## Configuração

Crie um arquivo `.env` com base em `env.exemple`:

```env
BACKEND_URL=http://localhost:3001
```

Variáveis:

- `BACKEND_URL`: URL da API usada pelo servidor Next em Server Components e Server Actions.
- `NEXT_PUBLIC_BACKEND_URL`: mantida apenas como fallback legado em `getServerBackendUrl`; novas chamadas autenticadas nao devem depender dela no browser.

Busca global, projeção mensal, orçamentos, marcação de todas as notificações
como lidas e exportação CSV ficam ativos por padrão, sem variáveis de ativação.
O backend configurado deve oferecer as rotas descritas no
[contrato HTTP](api-routes.md). As antigas variáveis de ativação não são mais utilizadas.
A exportação PDF continua disponível no seletor de formato. A ação de marcar
todas como lidas aparece quando há notificações não lidas.

## Scripts

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

Observações:

- `npm run dev` inicia o Next.js em modo desenvolvimento.
- `npm run build` gera a build de produção.
- `npm run start` serve a build gerada.
- `npx tsc --noEmit` verifica os tipos sem gerar arquivos JavaScript.
- `npm run test:connection` valida timers, deduplicação, reconexão, limites de tentativas, preservação da sessão e envio único de gravações. Os testes usam o runner nativo do Node.js (24 ou superior) e o TypeScript já instalado.
- `npm run lint` é um script legado baseado em `next lint`; não há configuração funcional para execução não interativa.
- A configuração atual da build permite ignorar erros de tipos; use a verificação de TypeScript separadamente ao validar mudanças de código.

## Estrutura

```plaintext
src/
  actions/       Server Actions e funções server-side para leitura, mutação e cache.
  app/           Rotas do App Router.
  components/    Componentes de tela, layout, formulário e UI.
  constants/     Constantes de domínio.
  hooks/         Hooks de autenticação, queries e query client.
  models/        Tipos e modelos compartilhados de domínio.
  lib/           Utilitários de autenticação, backend e helpers.
  providers/     Providers globais da aplicação.
  schemas/       Schemas Zod de formulários.
  utils/         Formatadores e utilitários.
```

## Rotas

| Rota | Descrição |
| --- | --- |
| `/login` | Autenticação do usuário. |
| `/register` | Cadastro de usuário. |
| `/` | Landing page pública do MyFinances. |
| `/dashboard` | Dashboard financeiro autenticado. |
| `/transactions` | Listagem mensal, busca, criação, importação e exportação de transações. |
| `/transactions/[id]` | Detalhes, edição e remoção de transação. |
| `/wishlist` | Metas, reservas, distribuição inicial e histórico de compras. |
| `/wishlist/edit/[id]` | Edição de nome, valor desejado e prazo de meta ativa. |
| `/calendar` | Agenda financeira, receitas recorrentes e projeção diária. |
| `/cards` | Cartões, limite, compras parceladas e faturas. |
| `/fixed-expenses` | Listagem, criação, edição por diálogo e pagamento de despesas fixas. |
| `/comparative` | Comparativos financeiros. |
| `/config` | Configurações do usuário. |

A logo no cabeçalho público e no cabeçalho autenticado sempre direciona para a landing em `/`.

## Autenticação

O login é feito pela Server Action `loginAction`, que envia credenciais para `POST /auth`.

Quando a API retorna `accessToken`, o token é salvo no cookie HTTP-only `mf_token`.

Fluxo principal:

- `middleware.ts` bloqueia rotas privadas quando o cookie `mf_token` não existe ou está expirado.
- `src/app/(private)/layout.tsx` chama `requireAuth()` e garante a autenticação antes de renderizar páginas privadas.
- `RootLayout` fica neutro e mantém apenas providers globais.
- `AuthProvider` mantém o estado de sessão no client para UI, logout e tratamento de `401`.
- `src/lib/serverAuth.ts` lê o token no servidor e expõe `requireAuth()`.
- Server Actions em `src/actions/**` leem o cookie HTTP-only no servidor e repassam `Authorization` para a API.
- `logoutAction` remove o cookie; `AuthProvider` limpa o cache, navega para `/login` e atualiza a página.

## Comunicação com a API

A camada server-side usa `fetch` em `src/actions`, organizada por domínio:

- `user` e `login`: cadastro, perfil, senha e sessão.
- `transaction` e `export`: transações, busca, totais, importação e exportação.
- `dashboard` e `budget`: resumo, comparativos e orçamentos.
- `category`: catálogo, regras e sugestões.
- `calendar`, `cards`, `wishlist` e `fixed-expense`: recorrências, faturas, metas e pagamentos.
- `notification`: consulta e gestão de alertas.

Chamadas autenticadas devem passar por Server Actions ou funcoes server-side em `src/actions/**`. Essas funcoes leem o cookie `mf_token` no servidor e adicionam `Authorization: Bearer <token>` quando existe sessão.

### Disponibilidade e cold start

`BackendConnectionProvider` é global, inclusive em login, cadastro e entrada
direta em rotas privadas. Usa o endpoint público `/api/health` na abertura e a
cada cinco minutos com a aba visível. `visibilitychange`, foco, `pageshow` e
reconexão da internet verificam novamente quando o último contato tem pelo
menos cinco minutos. As verificações são deduplicadas e canceladas no unmount.
O browser pode congelar uma aba em segundo plano; não há garantia de manter
a Render acordada com a aba oculta ou o dispositivo suspenso.

Cada rodada faz até três chamadas de saúde, com timeout de 22 segundos no
browser e 20 segundos no handler, intercaladas por pausas de dois e cinco
segundos. Uma chamada lenta exibe aviso após 1,5 segundo. Falha final oferece
“Tentar novamente”; falta de internet é indicada separadamente. Os dados já
renderizados e o cache de usuário permanecem disponíveis.

Ao recuperar uma falha, o provider refaz apenas queries ativas que terminaram
em erro e atualiza os Server Components da rota privada. Mutações não são
reexecutadas. Login e cadastro aguardam disponibilidade antes de enviar o
formulário, e enviam a gravação uma única vez.

`backendFetch` centraliza as chamadas das actions. GET/HEAD têm timeout de 15
segundos por tentativa e uma repetição em erro de rede/timeout ou HTTP
502/503/504. Cancelamentos do chamador e demais status não são repetidos.
POST/PATCH/DELETE preservam o envio único e o comportamento anterior de
timeout. Falhas de consulta não devem retornar listas vazias, saldo zero ou
“não encontrado”. `getUser` retorna `null` apenas sem sessão ou em `401`.

O layout raiz declara `maxDuration = 60` para renderizações/actions, e o
handler de saúde declara `maxDuration = 30`. A plataforma aplica esses limites
conforme a configuração e o plano; confirmar os valores no deployment da
Vercel. Não foi criado agendador externo nem alterado o plano da Render.

## Cache e Revalidação

Leituras server-side usam `cache: "no-store"` e tags do Next quando necessário.

Mutações ficam em `src/actions` e chamam:

- `revalidateTag` para invalidar dados por domínio.
- `revalidatePath` para atualizar páginas específicas.
- `redirect` quando a ação deve encerrar em outra rota.

Tags usadas atualmente:

- `transactions`
- `transaction`
- `dashboard`
- `monthlyComparison`
- `sixMonthComparison`
- `fixed-expenses`
- `fixed-expense`
- `wishlist`
- `get-user`
- `budgets`
- `categories` e `category-rules`
- `calendar`
- `cards`

## Layout

O layout global fica em `src/app/layout.tsx`.

`AppProviders` monta `QueryClientProvider`, `ThemeProvider`,
`BackendConnectionProvider` e `ToastProvider` no layout raiz. O layout privado
exige `requireAuth()` e monta `AuthProvider`. O catálogo e o `AppShell` ficam
em `PrivateShell`, dentro de `Suspense`, permitindo mostrar um skeleton e
iniciar o aquecimento enquanto os dados chegam. `loading.tsx` cobre as rotas
privadas sem skeleton específico; `error.tsx` oferece reconexão e nova leitura,
inclusive após a recuperação automática do backend.

O `body` já usa o mesmo fundo dos layouts (`bg-white dark:bg-gray-700`) antes
de o shell montar. O skeleton privado reutiliza `Skeleton` com os cinzas da
aplicação, e mensagens/avisos de conexão acompanham os temas claro e escuro.

`AppShell` renderiza:

- `Header`
- `Sidebar` para usuários autenticados
- conteúdo da rota
- `Footer`

## Domínios Funcionais

### Dashboard

Exibe saldo total, resumo mensal, projeção e orçamentos. O saldo total consulta
`GET /transactions/balance`, soma todo o histórico registrado e não muda com o
mês ou filtros. Resultado, entradas e saídas do mês usam um painel compacto;
economia e maior gasto ficam em uma seção expansível de indicadores.
A criação de transações fica no topo,
com botão de largura inteira no mobile. O gráfico de evolução fica na tela de
comparativo, acessível por um link, sem repetir a consulta na dashboard.

### Transações

O saldo total usa a mesma consulta e chave React Query da dashboard:
`["transactions", "balance"]`. Mutações que invalidam `transactions` também
atualizam esse saldo. Leituras usam cookie HTTP-only e `no-store`; falhas exibem
mensagem com tentativa novamente, sem assumir saldo zero. O resumo do mês
continua usando os totais de todos os resultados dos filtros, sem depender da
página. Com filtros ativos, os rótulos indicam resultado, entradas e saídas dos
resultados filtrados.

Permite criar, listar, editar e remover receitas ou despesas. O catálogo vem de `GET /categories`; as constantes mantêm apenas compatibilidade com códigos padrão.
Uma transação pode ser duplicada no formulário de criação com data sugerida de
hoje, sem alterar o registro original. A tela abre no mês atual de São Paulo e
permite navegar entre meses ou escolher o mês diretamente. Tipo, categoria e
busca ficam na URL. A lista usa cursores em páginas de 50 itens dentro do mês;
os cards usam `/transactions/summary`, somando todos os resultados dos mesmos
filtros em lotes no servidor. Mutações invalidam a lista e os totais.

Exportações PDF/CSV são solicitadas pela API e acompanhadas até a conclusão. O download passa pelo handler autenticado `/api/exports/transactions/[id]/download`, mantendo o token no servidor.

### Categorias e regras

O layout privado carrega o catálogo no servidor e o entrega a `CategoryProvider`; atualizações interativas usam React Query com as chaves centralizadas `categories` e `category-rules`. Falha de leitura mantém o catálogo padrão e oferece tentativa novamente, sem impedir a navegação.

Configurações permite criar/editar/arquivar/restaurar categorias com nome, cor e ícone, e criar/editar/ativar/desativar/excluir regras com prioridade e teste de descrição antes de salvar. Formulários usam React Hook Form e Zod em `src/schemas/category.schema.ts`. Catálogo e regras permanecem apenas em memória no navegador.

Seletores de transações, despesas fixas e orçamento usam categorias ativas do tipo correspondente. Ao editar, a referência arquivada original pode ser mantida. Duplicar é novo uso e exige categoria ativa. Filtros e rótulos de listas, dashboard e comparativos incluem arquivadas. O servidor revalida todas as referências.

Novos lançamentos consultam `/categories/resolve` após 400 ms sem digitação e mostram “Usar sugestão”; respostas obsoletas são descartadas. A consulta não substitui a categoria escolhida. Edições não consultam regras. Erro de sugestão mantém o preenchimento manual disponível.

Actions em `src/actions/category/categories.ts` preservam cookie HTTP-only, `no-store` e o tratamento público de erros. Mutações revalidam configurações, transações, despesas fixas, orçamento, dashboard e comparativos, além do catálogo e regras no client. Publicar a API com as novas rotas antes do front. Importação de extratos usa o mesmo catálogo.

Login e logout cancelam consultas pendentes e limpam o QueryClient para preservar isolamento do catálogo e das regras entre contas. Evidências e limitações da entrega estão em [Validação da entrega A](delivery-a-validation.md).

### Importação de extratos

O botão “Importar” fica ao lado da exportação na listagem mensal de transações. Abre um modal responsivo com etapas de arquivo/mapeamento, revisão, confirmação com totais e resultado por linha. CSV permite escolher codificação, delimitador, formato de data/decimal e colunas de valor ou entrada/saída. OFX identifica os campos no servidor.

`src/components/transaction/transaction-import` separa formulário, revisão paginada de 20 linhas e coordenação do modal. O formulário usa React Hook Form/Zod. A revisão mantém erros por linha, respeita categorias ativas por tipo, permite edição individual/em lote e seleção. Duplicatas começam desmarcadas, com aceite explícito antes de selecionar. A confirmação final mostra totais e quantidade de duplicatas autorizadas; envio repetido é bloqueado enquanto há requisição ativa.

As Server Actions de `src/actions/transaction/import-transactions.ts` leem exclusivamente o cookie HTTP-only e encaminham multipart/JSON para a API com `cache: no-store`. JWT nunca chega ao client. Erros `401` encerram a sessão. O limite de Server Actions é 3 MiB para acomodar multipart; o arquivo permanece limitado a 2 MiB no formulário, na action e no backend.

Após qualquer tentativa de confirmação, invalidar transações, dashboard, orçamento, comparativos e wishlist, inclusive quando a resposta se perdeu após uma gravação parcial. O resultado permite consultar o estado e revisar pendências, mantendo importadas bloqueadas. Reservas da wishlist não são recalculadas após importação.

Arquivo e campos financeiros ficam apenas em memória. O parâmetro `importBatch` guarda apenas o ID opaco do lote no endereço para recuperar a revisão após recarregar a página. Recuperação exige a mesma sessão/autorização no backend; não expõe dados de outro usuário. Fechar o modal mantém a prévia; “Descartar prévia” exige confirmação e apaga o payload temporário sem desfazer transações. Expiração de 24h impede nova confirmação e orienta reenviar o arquivo. Consulte os formatos e contratos em [Rotas da API](api-routes.md).

### Calendário financeiro

A rota privada `/calendar` recebe dados iniciais via Server Components e atualiza meses/receitas com TanStack Query e Server Actions em `src/actions/calendar`. O cookie HTTP-only não sai do servidor. Navegação da sidebar inclui Calendário e fecha o menu móvel ao navegar.

A tela inclui calendário com seleção por teclado, agenda por dia (padrão em telas pequenas), filtros de receita/despesa/situação, pendências, recorrências com edição/pausa, formulário validado por React Hook Form/Zod e confirmação do valor/data reais. Há estados de carregamento, vazio, erro com tentativa novamente e feedback de sucesso. Suporta temas claro e escuro.

O card compartilhado `ProjectionCard` apresenta gráfico diário, primeiro dia negativo, saldo-base, premissas e tabela acessível. O dashboard usa a mesma projeção do calendário. Mutações revalidam calendário, transações, dashboard, comparativos e wishlist; a agenda busca novamente ao montar para acompanhar alterações feitas em outras telas.

Contrato, regras de data, implantação e limites estão em [financial-calendar.md](financial-calendar.md). As evidências e os limites da verificação original estão no [relatório histórico de validação](delivery-c-validation.md).

### Wishlist

A wishlist mostra saldos registrado, reservado e livre, progresso individual, sugestão mensal, histórico de movimentos e filtro de compras concluídas. O progresso anual antigo é exibido somente como referência; o usuário distribui reservas com aportes e marca a transição como concluída. Ações de aportar, retirar e concluir usam Server Actions autenticadas e invalidam dados financeiros afetados. A conclusão mostra o vínculo direto em `/transactions/[id]`, gera uma única despesa e sai da lista ativa. O formulário de edição não altera a reserva diretamente.

Datas seguem `YYYY-MM-DD`; valores têm centavos. A interface bloqueia envio repetido enquanto a ação está pendente. O saldo livre pode ficar negativo após despesas posteriores, com aviso sem apagar os aportes. O contrato está em [Rotas da API](api-routes.md).

### Cartões de crédito

Remover cartão abre uma confirmação e chama `DELETE /cards/:id`. A API arquiva
o cartão, preserva pagamentos e exige quitar parcelas e anuidades fechadas.
Cartões removidos saem também do seletor de novas despesas no crédito.

A rota privada `/cards` carrega os cartões no servidor e apresenta limite total, em uso e disponível, compras e faturas por competência. Permite cadastrar cartão com dia de fechamento, vencimento e anuidade; registrar compra com categoria e até 60 parcelas; e marcar como paga uma fatura fechada. O formulário de nova despesa também aceita “Crédito”, cartão e número de parcelas, encaminhando a compra para `/cards/:id/purchases`.

As Server Actions em `src/actions/cards/cards.ts` usam o cookie HTTP-only e chamadas sem cache. Após mutações, revalidam cartões, transações, calendário, dashboard, orçamentos e comparativos. Uma compra compromete o limite, mas não aparece como despesa realizada até o pagamento integral da fatura; faturas pendentes entram na projeção do calendário. O contrato HTTP está em [Rotas da API](api-routes.md) e as regras de cálculo e implantação no [guia de cartões da API](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/credit-cards.md).

### Despesas Fixas

Controla despesas recorrentes, vencimento, status de pagamento e atualização do próximo ciclo.
A projeção diária compartilhada com o calendário mostra compromissos pendentes, receitas previstas e movimentações realizadas.

### Orçamentos

O dashboard permite criar, editar e remover limites mensais
por categoria de despesa. O gasto é calculado pela API a cada leitura do resumo.

### Comparativo

Exibe a análise dos seis meses até o mês atual, com receitas, despesas, saldo,
taxa de economia, maior categoria de gasto, melhor e pior mês e variação do
saldo em relação aos seis meses anteriores. O detalhamento de despesas por
categoria é agregado no servidor a partir de todas as páginas de transações,
sem expor o token no browser.

### Configurações

Permite atualizar dados do usuário e senha.

### Notificações

O cabeçalho privado permite consultar alertas, excluir notificações e marcar uma ou todas como lidas. As chamadas passam pelas actions de `src/actions/notification` e preservam a sessão HTTP-only.

## Convenções de Implementação

- Use alias `@/*` para imports internos.
- Mantenha acesso HTTP autenticado concentrado em Server Actions/funcoes server-side dentro de `src/actions/**`.
- Use Server Actions para mutações que dependem de cookie HTTP-only.
- Após mutações, revalide tags e rotas afetadas.
- Componentes de UI base devem ficar em `src/components/ui`.
- Schemas de formulários devem ficar em `src/schemas`.
- Tipos de domínio compartilhados devem ficar em `src/models` ou próximos do componente quando forem específicos da tela.

## Dependências da API

O front depende dos seguintes grupos de endpoints:

- `POST /auth`
- `/user`
- `/user/get-one`
- `/user/update`
- `/transactions`
- `/transactions/:id`
- `/transactions/search` e `/transactions/summary`
- `/exports`
- `/categories` e `/category-rules`
- `/budgets`
- `/calendar`
- `/cards`
- `/notifications`
- `/wishlist`
- `/wishlist/:id`
- `/fixed-expenses`
- `/fixed-expenses/:id`
- `/dashboard`
- `/dashboard/monthly-comparison`

Mudanças de contrato nesses endpoints devem ser refletidas nas actions, nos modelos e nos formulários correspondentes. Consulte [Rotas da API](api-routes.md) para o contrato completo.
