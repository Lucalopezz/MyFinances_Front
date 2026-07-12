# Autenticacao

Este documento explica como a autenticacao funciona no front-end do MyFinances.

## Visao Geral

A aplicacao usa JWT retornado pela API e armazena esse token em um cookie HTTP-only chamado `mf_token`.

O cookie e lido no servidor para proteger rotas privadas. A protecao segue o fluxo esperado do App Router: o `middleware.ts` faz a primeira barreira de navegacao e o layout privado `src/app/(private)/layout.tsx` faz a garantia server-side antes de renderizar qualquer pagina autenticada.

Arquivos principais:

- `src/actions/login/login-action.ts`: envia credenciais para a API e grava o cookie.
- `src/actions/login/logout-action.ts`: remove o cookie de autenticacao.
- `src/middleware.ts`: protege rotas privadas e limpa token expirado.
- `src/app/layout.tsx`: layout raiz global, sem regra de autenticacao.
- `src/app/(private)/layout.tsx`: exige autenticacao com `requireAuth()` e renderiza o shell privado.
- `src/lib/serverAuth.ts`: le o cookie no servidor e expoe `requireAuth()`.
- `src/providers/auth-provider.tsx`: mantem o estado client-side necessario para UI, logout e tratamento de `401`.
- `src/lib/client-auth.ts`: emite evento de sessao expirada no browser.
- `src/lib/jwt.ts`: valida localmente se o JWT ja expirou.
- `src/actions/**`: Server Actions e funcoes server-side que leem o cookie e chamam a API.

## Login

O login acontece pela Server Action `loginAction`.

Fluxo:

1. A tela de login chama `loginAction` com email e senha.
2. A action envia `POST /auth` para a API configurada em `BACKEND_URL`.
3. A API retorna `accessToken`.
4. A action salva o token no cookie `mf_token`.
5. O usuario e redirecionado para `/dashboard`.
6. O `middleware.ts` permite a navegacao para `/dashboard`.
7. O layout `src/app/(private)/layout.tsx` valida o cookie com `requireAuth()` e inicializa o `AuthProvider`.

O cookie e configurado como HTTP-only, entao ele nao pode ser lido diretamente pelo JavaScript do browser. Isso reduz a exposicao do token no client.

## Layouts

O `RootLayout` deve permanecer neutro: ele aplica estilos globais e providers compartilhados, mas nao decide se uma rota e publica ou privada.

As paginas autenticadas ficam no route group `src/app/(private)`. Esse grupo nao altera as URLs; por exemplo, `src/app/(private)/transactions/page.tsx` continua respondendo em `/transactions`.

O layout privado chama `requireAuth()` antes de renderizar os filhos. Se o cookie nao existir ou se o JWT estiver expirado, a request e redirecionada para `/login`.

As paginas publicas ficam em `src/app/(public)`, como `/login` e `/register`.

## Estado de Autenticacao no Client

Depois que o layout privado valida a sessao, ele monta o `AuthProvider`. O provider controla:

- `status`: `authenticated` ou `unauthenticated`.
- `logout`: funcao para encerrar a sessao.

Esse estado nao e a barreira principal de seguranca. Ele existe para renderizar a UI privada, executar logout e reagir a respostas `401` vindas de chamadas client-side.

## Protecao de Rotas

O `middleware.ts` roda antes das rotas da aplicacao.

Rotas publicas:

- `/`
- `/login`
- `/register`

Para as demais rotas, o middleware verifica o cookie `mf_token`. A landing em `/` continua acessível inclusive com sessão ativa. Usuários autenticados que tentarem acessar `/login` ou `/register` são enviados para `/dashboard`.

Se o cookie nao existir ou se o JWT estiver expirado, o usuario e redirecionado para `/login`. Quando o token esta expirado, o middleware tambem remove o cookie para evitar que a aplicacao continue montando uma sessao invalida.

Se um usuario autenticado tentar acessar `/login` ou `/register`, o middleware redireciona para `/`.

## Token Expirado

A aplicacao trata token expirado em tres lugares:

1. No middleware, antes da rota renderizar.
2. No layout privado, por `requireAuth()`.
3. Nas Server Actions que chamam a API com o token lido no servidor.

No servidor, `isJwtExpired` le o campo `exp` do JWT. Se o token ja venceu:

- o middleware limpa o cookie quando intercepta a request;
- rotas privadas redirecionam para `/login`.

Quando uma chamada server-side identifica sessao ausente ou invalida, a rota privada volta a ser protegida pelo middleware/layout no proximo render ou navegacao.

O `AuthProvider` continua centralizando o logout manual e pode encerrar a sessao uma unica vez quando algum fluxo client-side emitir `mf:session-expired`:

- muda `status` para `unauthenticated`;
- chama `logoutAction` para remover o cookie;
- navega com `router.replace("/login")`;
- faz `router.refresh()` para sincronizar o estado server-side.

Esse fluxo evita recarregamentos repetidos de `/login` e impede que menus de usuario logado continuem visiveis apos a expiracao do token.

## Logout

O logout manual usa a mesma rotina de encerramento de sessao usada quando a API retorna `401`.

Fluxo:

1. O usuario clica no botao de logout.
2. O `AuthProvider` limpa o estado local.
3. `logoutAction` remove o cookie `mf_token`.
4. O usuario e enviado para `/login`.
5. A pagina e atualizada para refletir a sessao encerrada no servidor.

## Chamadas para a API

Chamadas server-side usam `fetch` com o token lido por `getServerToken`.

Chamadas server-side usam `fetch` com o token lido por `getServerToken`.

Chamadas iniciadas por componentes client-side que dependem de autenticacao devem chamar Server Actions. A action roda no servidor, le o cookie HTTP-only `mf_token` e repassa a chamada ao backend com:

```http
Authorization: Bearer <token>
```

Isso evita expor o JWT no JavaScript do browser.

## Pontos de Atencao

- O middleware nao valida assinatura do JWT; ele apenas verifica o campo `exp` para evitar sessoes claramente vencidas no front-end.
- A autorizacao real continua sendo responsabilidade da API.
- O token HTTP-only nao deve ser lido diretamente pelo browser nem passado para componentes client-side.
- Novas chamadas client-side autenticadas devem usar Server Actions em vez de Axios direto.
