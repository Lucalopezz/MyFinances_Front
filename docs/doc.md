# Documentação Técnica do Front-end

Documentação técnica do front-end do MyFinances. O projeto é uma aplicação Next.js para gerenciamento financeiro pessoal, consumindo uma API externa via HTTP.

## Stack

- Next.js 15 com App Router.
- React 19.
- TypeScript.
- Tailwind CSS 4.
- Shadcn/UI e Radix UI para componentes base.
- TanStack Query para cache client-side.
- React Hook Form e Zod para formulários e validação.
- Axios e `fetch` para comunicação com a API.
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
O backend configurado deve oferecer as rotas da versão 2.1 descritas em
`docs/api-routes.md`. As antigas variáveis de ativação não são mais utilizadas.
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
- `npm run lint` executa o lint configurado no projeto.

## Estrutura

```plaintext
src/
  actions/       Server Actions para mutações e revalidação de cache.
  app/           Rotas do App Router.
  components/    Componentes de tela, layout, formulário e UI.
  constants/     Constantes de domínio.
  hooks/         Hooks de autenticação, queries e query client.
  interfaces/    Tipos compartilhados por serviços e componentes.
  lib/           Utilitários de autenticação, backend e helpers.
  providers/     Providers globais da aplicação.
  schemas/       Schemas Zod de formulários.
  services/      Camada de acesso à API no servidor.
  utils/         Cliente Axios e formatadores.
```

## Rotas

| Rota | Descrição |
| --- | --- |
| `/login` | Autenticação do usuário. |
| `/register` | Cadastro de usuário. |
| `/` | Landing page pública do MyFinances. |
| `/dashboard` | Dashboard financeiro autenticado. |
| `/transactions` | Listagem, criação, edição e remoção de transações. |
| `/wishlist` | Listagem e criação de itens desejados. |
| `/wishlist/edit/[id]` | Edição de item da wishlist. |
| `/fixed-expenses` | Listagem e criação de despesas fixas. |
| `/fixed-expenses/edit/[id]` | Edição de despesa fixa. |
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
- `logoutAction` remove o cookie e redireciona o usuário para `/login`.

## Comunicação com a API

A camada server-side usa `fetch` dentro de `src/services`.

Services principais:

- `config.service.ts`: usuário, cadastro e atualização de dados.
- `dashboard.service.ts`: resumo financeiro e comparativos.
- `transactions.service.ts`: CRUD de transações.
- `wishlist.service.ts`: CRUD de wishlist.
- `fixed-expenses.service.ts`: CRUD e marcação de pagamento de despesas fixas.

Chamadas autenticadas devem passar por Server Actions ou funcoes server-side em `src/actions/**`. Essas funcoes leem o cookie `mf_token` no servidor e adicionam `Authorization: Bearer <token>` quando existe sessão.

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

## Layout

O layout global fica em `src/app/layout.tsx`.

Providers globais:

- `AuthProvider`
- `QueryClientProvider`
- `ThemeProvider`
- `ToastProvider`

`AppShell` renderiza:

- `Header`
- `Sidebar` para usuários autenticados
- conteúdo da rota
- `Footer`

## Domínios Funcionais

### Dashboard

Exibe resumo financeiro, cards e gráficos. Os dados vêm de endpoints de dashboard e comparativo mensal.

### Transações

Permite criar, listar, editar e remover receitas ou despesas. O catálogo vem de `GET /categories`; as constantes mantêm apenas compatibilidade com códigos padrão.
Uma transação pode ser duplicada no formulário de criação com data sugerida de
hoje, sem alterar o registro original. A busca global é consultada por padrão,
com filtros na URL e navegação por cursores. Se a API responder `404` para a
busca, a tela mantém a listagem paginada existente como fallback.

### Wishlist

Controla objetivos de compra, valor desejado, valor salvo e data alvo.

### Despesas Fixas

Controla despesas recorrentes, vencimento, status de pagamento e atualização do próximo ciclo.
Quando disponível, a projeção do dashboard mostra despesas pendentes sem
criar transações previstas.

### Orçamentos

Quando disponível, o dashboard permite criar, editar e remover limites mensais
por categoria de despesa. O gasto é calculado pela API a cada leitura do resumo.

### Comparativo

Exibe a análise dos seis meses até o mês atual, com receitas, despesas, saldo,
taxa de economia, maior categoria de gasto, melhor e pior mês e variação do
saldo em relação aos seis meses anteriores. O detalhamento de despesas por
categoria é agregado no servidor a partir de todas as páginas de transações,
sem expor o token no browser.

### Configurações

Permite atualizar dados do usuário e senha.

## Convenções de Implementação

- Use alias `@/*` para imports internos.
- Mantenha acesso HTTP autenticado concentrado em Server Actions/funcoes server-side dentro de `src/actions/**`.
- Use Server Actions para mutações que dependem de cookie HTTP-only.
- Após mutações, revalide tags e rotas afetadas.
- Componentes de UI base devem ficar em `src/components/ui`.
- Schemas de formulários devem ficar em `src/schemas`.
- Tipos de domínio compartilhados devem ficar em `src/interfaces` ou próximos do componente quando forem específicos da tela.

## Dependências da API

O front depende dos seguintes grupos de endpoints:

- `POST /auth`
- `/user`
- `/user/get-one`
- `/user/update`
- `/transactions`
- `/transactions/:id`
- `/wishlist`
- `/wishlist/:id`
- `/fixed-expenses`
- `/fixed-expenses/:id`
- `/dashboard`
- `/dashboard/monthly-comparison`

Mudanças de contrato nesses endpoints devem ser refletidas nos services, interfaces e formulários correspondentes.

### Categorias e regras — entrega A

O layout privado carrega o catálogo no servidor e o entrega a `CategoryProvider`; atualizações interativas usam React Query com as chaves centralizadas `categories` e `category-rules`. Falha de leitura mantém o catálogo padrão e oferece tentativa novamente, sem impedir a navegação.

Configurações permite criar/editar/arquivar/restaurar categorias com nome, cor e ícone, e criar/editar/ativar/desativar/excluir regras com prioridade e teste de descrição antes de salvar. Formulários usam React Hook Form e Zod em `src/schemas/category.schema.ts`. Catálogo e regras permanecem apenas em memória no navegador.

Seletores de transações, despesas fixas e orçamento usam categorias ativas do tipo correspondente. Ao editar, a referência arquivada original pode ser mantida. Duplicar é novo uso e exige categoria ativa. Filtros e rótulos de listas, dashboard e comparativos incluem arquivadas. O servidor revalida todas as referências.

Novos lançamentos consultam `/categories/resolve` após 400 ms sem digitação e mostram “Usar sugestão”; respostas obsoletas são descartadas. A consulta não substitui a categoria escolhida. Edições não consultam regras. Erro de sugestão mantém o preenchimento manual disponível.

Actions em `src/actions/category/categories.ts` preservam cookie HTTP-only, `no-store` e o tratamento público de erros. Mutações revalidam configurações, transações, despesas fixas, orçamento, dashboard e comparativos, além do catálogo e regras no client. Publicar a API com as novas rotas antes do front. Importação de extratos usa o mesmo catálogo na entrega B.

Login e logout cancelam consultas pendentes e limpam o QueryClient para preservar isolamento do catálogo e das regras entre contas. Evidências e limitações da entrega estão em [Validação da entrega A](delivery-a-validation.md).


### Importação de extratos — entrega B

O botão “Importar” fica ao lado da exportação nas listas de transações (busca global e fallback paginado). Abre um modal responsivo com etapas de arquivo/mapeamento, revisão, confirmação com totais e resultado por linha. CSV permite escolher codificação, delimitador, formato de data/decimal e colunas de valor ou entrada/saída. OFX identifica os campos no servidor.

`src/components/transaction/transaction-import` separa formulário, revisão paginada de 20 linhas e coordenação do modal. O formulário usa React Hook Form/Zod. A revisão mantém erros por linha, respeita categorias ativas por tipo, permite edição individual/em lote e seleção. Duplicatas começam desmarcadas, com aceite explícito antes de selecionar. A confirmação final mostra totais e quantidade de duplicatas autorizadas; envio repetido é bloqueado enquanto há requisição ativa.

As Server Actions de `src/actions/transaction/import-transactions.ts` leem exclusivamente o cookie HTTP-only e encaminham multipart/JSON para a API com `cache: no-store`. JWT nunca chega ao client. Erros `401` encerram a sessão. O limite de Server Actions é 3 MiB para acomodar multipart; o arquivo permanece limitado a 2 MiB no formulário, na action e no backend.

Após qualquer tentativa de confirmação, invalidar transações, dashboard, orçamento, comparativos e wishlist, inclusive quando a resposta se perdeu após uma gravação parcial. O resultado permite consultar o estado e revisar pendências, mantendo importadas bloqueadas. Recálculo pendente da wishlist tem ação própria de repetição.

Arquivo e campos financeiros ficam apenas em memória. O parâmetro `importBatch` guarda apenas o ID opaco do lote no endereço para recuperar a revisão após recarregar a página. Recuperação exige a mesma sessão/autorização no backend; não expõe dados de outro usuário. Fechar o modal mantém a prévia; “Descartar prévia” exige confirmação e apaga o payload temporário sem desfazer transações. Expiração de 24h impede nova confirmação e orienta reenviar o arquivo. Consulte os formatos e contratos em [Rotas da API](api-routes.md).


## Calendário financeiro — entrega C

A rota privada `/calendar` recebe dados iniciais via Server Components e atualiza meses/receitas com TanStack Query e Server Actions em `src/actions/calendar`. O cookie HTTP-only não sai do servidor. Navegação da sidebar inclui Calendário e fecha o menu móvel ao navegar.

A tela inclui calendário com seleção por teclado, agenda por dia (padrão em telas pequenas), filtros de receita/despesa/situação, pendências, recorrências com edição/pausa, formulário validado por React Hook Form/Zod e confirmação do valor/data reais. Há estados de carregamento, vazio, erro com tentativa novamente e feedback de sucesso. Suporta temas claro e escuro.

O card compartilhado `ProjectionCard` apresenta gráfico diário, primeiro dia negativo, saldo-base, premissas e tabela acessível. O dashboard usa a mesma projeção do calendário. Mutações revalidam calendário, transações, dashboard, comparativos e wishlist; a agenda busca novamente ao montar para acompanhar alterações feitas em outras telas.

Contrato, regras de data, implantação e limites estão em [financial-calendar.md](financial-calendar.md). Validação visual em navegador continua pendente quando a sessão não oferece navegador.
