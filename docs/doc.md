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

Permite criar, listar, editar e remover receitas ou despesas. As categorias ficam em `src/constants/transaction-categories.ts`.

### Wishlist

Controla objetivos de compra, valor desejado, valor salvo e data alvo.

### Despesas Fixas

Controla despesas recorrentes, vencimento, status de pagamento e atualização do próximo ciclo.

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
