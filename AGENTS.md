# AGENTS.md

Guia para IAs e agentes de codigo trabalhando neste repositorio.

## Visao Geral

MyFinances Front-end e uma aplicacao Next.js 15 com App Router para gerenciamento financeiro pessoal. O front consome uma API externa para autenticacao, transacoes, wishlist, despesas fixas, dashboard, comparativos financeiros e notificacoes.

Stack principal:

- Next.js 15, React 19 e TypeScript com `strict`.
- App Router em `src/app`.
- Server Actions e `fetch` server-side para chamadas autenticadas.
- Cookie HTTP-only `mf_token` para sessao.
- TanStack Query para cache client-side quando necessario.
- React Hook Form e Zod para formularios e validacao.
- Tailwind CSS 4, Radix UI, componentes estilo shadcn/ui e `lucide-react`.
- Recharts para graficos.

## Documentacao Obrigatoria

Leia estes arquivos antes de alterar fluxos relacionados:

- `README.md`: resumo do projeto, stack, instalacao e estrutura geral.
- `docs/doc.md`: documentacao tecnica do front-end, rotas, cache, autenticacao e convencoes.
- `docs/api-routes.md`: contrato atual da API. Siga este padrao ao criar ou alterar integracoes.
- `docs/authentication.md`: fluxo de login, logout, cookie HTTP-only, middleware e protecao de rotas.
- `docs/v2.md`: planejamento de melhorias. Use como contexto, nao como especificacao ja implementada.
- `env.exemple`: variaveis esperadas para rodar o projeto.

Nao duplique essas documentacoes dentro deste arquivo. Use este guia como orientacao operacional e a documentacao acima como fonte de verdade.

## Comandos

Use `npm`, pois o repositorio possui `package-lock.json`.

```bash
npm install
npm run dev
npm run build
npm run start
npm run lint
```

Observacoes:

- Configure `BACKEND_URL` no `.env` antes de rodar fluxos que consomem a API.
- Se `npm run lint` falhar por configuracao do Next/lint, reporte a falha e valide com `npm run build` quando possivel.

## Estrutura do Projeto

Principais diretorios:

- `src/app`: rotas do App Router. Rotas publicas ficam em `(public)` e rotas privadas em `(private)`.
- `src/actions`: Server Actions e funcoes server-side de acesso a API por dominio.
- `src/components`: componentes de tela, layout, dominio e UI.
- `src/components/ui`: componentes base reutilizaveis.
- `src/hooks`: hooks de autenticacao, query client e queries client-side.
- `src/lib`: autenticacao, backend, JWT e utilitarios compartilhados.
- `src/models`: tipos/modelos de dominio usados pela aplicacao.
- `src/providers`: providers globais.
- `src/schemas`: schemas Zod para formularios.
- `src/constants`: constantes de dominio.
- `src/utils`: formatadores e utilitarios.
- `docs`: documentacao tecnica e planejamento.

Use o alias `@/*` para imports internos.

## Padrao de Integracao com a API

Siga o contrato descrito em `docs/api-routes.md`.

Para chamadas autenticadas:

- Nao exponha o JWT no browser.
- Leia o token no servidor com `getServerToken()` de `src/lib/serverAuth.ts`.
- Monte headers com `createJsonHeaders(token)` de `src/lib/backend.ts`.
- Use `getServerBackendUrl()` para obter a URL da API.
- Prefira Server Actions ou funcoes server-side em `src/actions/**` para chamadas que dependem do cookie HTTP-only.
- Use `cache: "no-store"` e `noStore()` em leituras sensiveis ou dependentes de usuario autenticado.

Para mutacoes:

- Coloque a action no dominio correspondente em `src/actions/<dominio>`.
- Revalide as tags e paths afetados com `revalidateTag` e/ou `revalidatePath`.
- Mantenha nomes de tags consistentes com os ja usados: `transactions`, `transaction`, `dashboard`, `monthlyComparison`, `sixMonthComparison`, `fixed-expenses`, `fixed-expense`, `wishlist`, `get-user`.
- Atualize modelos, schemas e componentes quando o contrato da API mudar.

Nao crie chamadas autenticadas diretas no client usando token. Componentes client-side devem acionar Server Actions ou hooks que preservem esse limite.

## Autenticacao e Rotas Privadas

O fluxo de autenticacao esta documentado em `docs/authentication.md`.

Regras importantes:

- O cookie de sessao se chama `mf_token` e deve continuar HTTP-only.
- `src/middleware.ts` faz a primeira protecao das rotas privadas.
- `src/app/(private)/layout.tsx` deve continuar exigindo `requireAuth()` antes de renderizar paginas privadas.
- `src/app/layout.tsx` deve permanecer neutro, apenas com providers e estrutura global.
- Paginas publicas pertencem a `src/app/(public)`.
- Paginas autenticadas pertencem a `src/app/(private)`.
- O App Router route group nao altera a URL final.

## Padroes de Next.js e React

- Preserve a separacao entre Server Components e Client Components.
- Use `"use client"` somente quando houver estado local, efeitos, eventos do browser, hooks client-side ou bibliotecas que exijam client.
- Use `"use server"` em Server Actions.
- Evite mover logica sensivel para o client.
- Prefira buscar dados no servidor quando a informacao depende de sessao ou deve ser renderizada inicialmente.
- Em formularios, use React Hook Form com schemas Zod em `src/schemas`.
- Mantenha componentes de dominio proximos do dominio em `src/components/<dominio>`.
- Mantenha componentes genericos em `src/components/ui`.
- Evite componentes grandes com multiplas responsabilidades; extraia subcomponentes quando houver repeticao ou estados complexos.

## UI e Estilo

- Siga os componentes e padroes existentes em `src/components/ui`.
- Use Tailwind CSS e `cn` de `src/lib/utils.ts` para composicao de classes quando necessario.
- Use `lucide-react` para icones.
- Preserve suporte a tema claro/escuro fornecido pelos providers existentes.
- Para graficos, siga o uso atual de Recharts.
- Adicione estados de loading, vazio e erro quando criar telas ou blocos que dependam da API.

## Tipagem, Validacao e Dados

- Mantenha TypeScript estrito. Evite `any` salvo quando houver justificativa clara.
- Tipos de dominio compartilhados devem ficar em `src/models`.
- Schemas de formulario devem ficar em `src/schemas`.
- Constantes de dominio devem ficar em `src/constants`.
- Datas enviadas para a API devem seguir o contrato, preferencialmente `YYYY-MM-DD` quando o endpoint aceitar data.
- Formate valores monetarios, percentuais e datas por utilitarios existentes em `src/utils` quando possivel.

## Cache e Revalidacao

- Leituras autenticadas devem evitar cache compartilhado indevido.
- Mantenha tags de cache alinhadas ao dominio alterado.
- Depois de criar, editar, remover ou marcar pagamento, revalide todas as telas impactadas. Exemplo: despesas fixas pagas podem afetar `fixed-expenses`, `transactions`, `dashboard` e comparativos.
- Nao remova revalidacoes existentes sem verificar o fluxo visual afetado.

## Seguranca e Privacidade

- Nao registre tokens, cookies ou payloads financeiros sensiveis em logs.
- Nao persista dados financeiros sensiveis no browser sem necessidade.
- Trate respostas `401` como sessao ausente, invalida ou expirada.
- A autorizacao real e responsabilidade da API; o front apenas protege navegacao e experiencia do usuario.
- Nao adicione `NEXT_PUBLIC_*` para segredos ou URLs que nao precisam estar no browser.

## Ao Alterar Contratos da API

Quando um endpoint mudar:

1. Atualize `docs/api-routes.md`.
2. Atualize modelos em `src/models`.
3. Atualize schemas em `src/schemas`, se houver formulario.
4. Atualize actions/funcoes server-side em `src/actions`.
5. Atualize componentes e hooks que consomem os dados.
6. Valide build e fluxos principais afetados.

## Boas Praticas de Edicao

- Prefira mudancas pequenas e coesas.
- Nao refatore areas nao relacionadas ao pedido.
- Preserve nomes e padroes ja usados no repositorio.
- Antes de criar uma nova abstracao, verifique se ja existe algo semelhante.
- Se encontrar documentacao desatualizada, atualize junto com a mudanca.
- Se nao conseguir validar algo por falta de API, dependencia ou ambiente, informe isso claramente.

## Antes de Finalizar

Execute validacoes proporcionais a mudanca:

- Mudanca pequena de texto/documentacao: revise o arquivo alterado.
- Mudanca de tipo, schema, action ou componente: rode `npm run build` quando possivel.
- Mudanca de estilo ou tela: teste visualmente em `npm run dev` quando possivel.
- Mudanca em autenticacao, middleware ou API: revise `docs/authentication.md` e `docs/api-routes.md` e valide o fluxo afetado.

