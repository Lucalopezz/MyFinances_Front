# Cold start da API: hospedagem, problema e melhorias

Registro de implementação: **08/10/2026**, versão **v2.3.0**. As mudanças foram implementadas e validadas localmente; o deploy em produção ainda não foi verificado.

## Contexto da hospedagem

O MyFinances usa dois serviços separados:

| Parte | Tecnologia | Hospedagem | Responsabilidade |
| --- | --- | --- | --- |
| Frontend | Next.js 15 e React 19 | Vercel | Páginas, interface, Server Components, Server Actions e encaminhamento das chamadas à API |
| Backend | Node.js e NestJS | Render | Autenticação, regras financeiras e acesso aos dados |

O navegador acessa o frontend na Vercel. As chamadas autenticadas passam pelo servidor Next.js, que lê o cookie HTTP-only `mf_token` e envia o JWT à API. A URL do backend é configurada em `BACKEND_URL`; o token não é exposto ao JavaScript do navegador.

O comportamento relatado é compatível com uma instância Free da Render. Nesse plano, um web service é suspenso após 15 minutos sem tráfego de entrada. Uma nova requisição inicia o serviço novamente, e esse processo pode levar cerca de um minuto. O plano da instância não foi conferido no painel durante esta implementação. [Documentação da Render](https://render.com/docs/free#spinning-down-on-idle).

Essa espera para iniciar novamente o serviço é o **cold start**. A interface na Vercel pode estar disponível enquanto a API na Render ainda está iniciando.

## Problema antes da mudança

Ao abrir o site, a primeira chamada à API demorava muito. O mesmo acontecia quando o usuário deixava a aba aberta, passava um período sem usar o aplicativo e depois voltava. O relato também incluía demora para carregar a área do usuário ou retornar ao login.

A landing page já enviava uma chamada a `/api/health` para acordar o backend. Esse ping acontecia apenas ao montar a landing: não havia manutenção periódica da conexão nem uma verificação centralizada ao retornar à aba. Entrar diretamente em uma rota privada também não passava por esse aquecimento.

A revisão encontrou outro problema: algumas consultas transformavam falhas HTTP ou de rede em `null`, listas vazias ou valores zerados. Por exemplo, `getUser()` retornava `null` tanto para uma sessão inválida quanto para uma falha temporária da API. Isso dificultava distinguir indisponibilidade, ausência de dados e problemas de autenticação.

Cold start e expiração de sessão precisam de tratamentos separados. Uma API demorando para responder não comprova que o JWT expirou.

## O que implementamos

### Aquecimento global e retorno à aba

Criamos o `BackendConnectionProvider`, montado em `AppProviders` no layout raiz. O aquecimento agora acompanha páginas públicas e privadas, incluindo login, cadastro e acesso direto à área autenticada.

O provider verifica a API na abertura do site e agenda pings a cada **cinco minutos enquanto a aba estiver visível e houver conexão**. O intervalo deixa margem em relação aos 15 minutos de inatividade da Render.

Ao receber `visibilitychange`, foco, `pageshow` ou retorno da internet, o controle verifica a conexão novamente se o último contato bem-sucedido tiver pelo menos cinco minutos. Perder a internet invalida esse contato, permitindo uma verificação ao reconectar. Eventos próximos compartilham a requisição em andamento; verificações automáticas também têm uma proteção de dez segundos contra tentativas repetidas.

Ao ocultar a aba, o agendamento periódico é interrompido. Ao voltar, a verificação considera o tempo decorrido. Requisições e timers são cancelados quando o provider é desmontado.

### Ping público, leve e sem cache

O caminho do aquecimento é:

```text
Navegador → GET /api/health na Vercel → GET /health na Render
```

Reutilizamos o endpoint público existente no NestJS, que retorna `{ "status": "ok" }` sem consultar dados do usuário. O handler Next.js chama esse endpoint usando `BACKEND_URL`, sem enviar JWT, e devolve uma resposta sem conteúdo:

- `204`: o backend respondeu com sucesso.
- `503`: houve falha HTTP, erro de rede ou timeout.

As chamadas e a resposta do handler usam `no-store`, para que uma resposta em cache não substitua o contato com a API. O health check confirma que o processo responde; não verifica a disponibilidade de todas as dependências, como o banco de dados.

### Espera visível e tentativas limitadas

O controle faz até três tentativas de saúde por rodada, com pausas de dois e cinco segundos antes da segunda e da terceira tentativas.

Se a verificação continuar pendente por 1,5 segundo, a interface mostra “Esperando o servidor…”. Uma falha final oferece “Tentar novamente”. Falta de internet recebe um aviso próprio. A reconexão preserva os dados já exibidos e o cache da conta.

Os textos da interface usam linguagem simples, sem citar backend, API, hospedagem, cold start ou verificações internas. Falhas internas usam a mensagem pública da operação; erros de processamento de exportações recebem uma orientação genérica para tentar novamente. Os detalhes de implementação ficam na documentação técnica.

Quando a API se recupera de uma falha detectada, o provider refaz apenas queries ativas que terminaram em erro e atualiza os Server Components da rota privada. A recuperação não reexecuta gravações financeiras.

### Sessão preservada em falhas temporárias

Timeout, erro de rede e HTTP `502`, `503` ou `504` não apagam o cookie nem acionam logout. O middleware e `requireAuth()` continuam protegendo as páginas quando o token está ausente ou realmente expirado.

`getUser()` agora retorna `null` apenas sem token ou diante de um `401` da API. Outros erros são propagados para a recuperação da página. Em configurações, o componente `SessionExpired` aciona o encerramento da sessão pelo `AuthProvider` somente para esse resultado `null`.

Consultas de metas, despesas fixas, detalhes de transações e resumo mensal também passaram a propagar falhas temporárias, evitando apresentar dados vazios, inexistentes ou zerados por causa de indisponibilidade.

### Consultas com timeout e gravações com envio único

Centralizamos as chamadas das actions em `backendFetch`:

- Leituras `GET` e `HEAD` têm timeout de 15 segundos por tentativa e uma repetição em erro de rede, timeout ou HTTP `502`, `503` e `504`.
- Cancelamentos do chamador e outros status, como `401`, `404` e `429`, não são repetidos automaticamente por esse helper.
- `POST`, `PATCH` e `DELETE` mantêm envio único e o comportamento anterior de timeout. Perder uma resposta não dispara outra gravação automaticamente.

Essa política é do helper server-side. Queries interativas podem ter suas próprias tentativas configuradas no TanStack Query.

Login e cadastro consultam `ensureReady()` antes de enviar o formulário. Se a conexão ainda estiver sendo verificada, aguardam essa rodada; se estiver indisponível, tentam reconectar. A operação de login ou criação da conta só é enviada depois da confirmação de disponibilidade.

### Carregamento progressivo da área privada

Mantivemos `requireAuth()` antes da renderização privada e colocamos o carregamento do catálogo e do shell dentro de `Suspense`. Isso permite mostrar um skeleton e iniciar o aquecimento global enquanto os dados são carregados.

Adicionamos `loading.tsx` para rotas privadas sem um carregamento específico e `error.tsx` com reconexão e nova tentativa de leitura. A tela de erro também reage à recuperação automática da API. Despesas fixas passaram a mostrar erro de atualização com um botão para tentar novamente, mantendo os dados anteriores.

## Intervalos e limites configurados

| Controle | Valor |
| --- | --- |
| Ping periódico com a aba visível | 5 minutos |
| Tentativas de saúde por rodada | Até 3 |
| Pausas entre tentativas de saúde | 2 segundos e 5 segundos |
| Timeout de cada ping no navegador | 22 segundos |
| Timeout da chamada à Render no handler Next.js | 20 segundos |
| Duração máxima declarada para `/api/health` | 30 segundos |
| Timeout por tentativa de leitura em `backendFetch` | 15 segundos |
| Tentativas de leitura em `backendFetch` | Até 2 |
| Duração máxima declarada no layout raiz | 60 segundos |

As durações de 30 e 60 segundos aparecem no manifesto de funções gerado pelo build. Sua aplicação na hospedagem depende do deployment e do plano da Vercel. [Configuração de duração das funções na Vercel](https://vercel.com/docs/functions/configuring-functions/duration).

## Limites da solução

O cold start inicial continua possível, principalmente quando ninguém está com o aplicativo visível. A mudança reduz a chance de a API dormir durante o uso e permite recuperar a interface quando isso acontece; não acelera diretamente a inicialização do processo NestJS na Render.

Uma aba aberta em segundo plano não garante execução de JavaScript: navegadores podem congelar ou descartar páginas para economizar recursos. Celular bloqueado, computador suspenso e navegador fechado também impedem depender de um timer da página. Por isso, o retorno à aba faz parte da solução. [Ciclo de vida das páginas no Chrome](https://developer.chrome.com/docs/web-platform/page-lifecycle-api).

O ping não renova o JWT. Se a sessão realmente expirar durante a inatividade, o retorno ao login continua sendo esperado. Além disso, manter a API ativa aumenta o uso das horas gratuitas da Render. [Limites de uso da Render](https://render.com/docs/free#monthly-usage-limits).

Para manter a API ativa independentemente do navegador, um agendador externo ou uma instância sem suspensão por inatividade são opções futuras. Esta entrega atua no frontend e reutiliza o `/health` existente; não inclui mudança de hospedagem, plano ou agendamento externo.

## Validação e publicação

Na implementação e na revisão dos textos da interface, passaram o build de produção, a verificação separada de TypeScript e **19 testes automatizados**. Os testes cobrem timers, deduplicação, retorno à aba, falhas e recuperação, cancelamento, montagem dupla do React em desenvolvimento, limites de timeout, envio único de gravações, consulta de perfil, proteção por JWT e contrato do proxy de saúde. Também verificam a apresentação de falhas internas e de exportação sem detalhes técnicos e a preservação de mensagens de validação de negócio.

Comandos para repetir as verificações no frontend:

```bash
npm run test:connection
npx tsc --noEmit
npm run build
```

A validação completa no navegador não foi executada porque o ambiente bloqueou a abertura de portas locais. Não foram medidas melhorias de latência em produção. Após publicar o frontend na Vercel, confirmar `BACKEND_URL` e validar os seguintes cenários:

1. Abrir o site com a API suspensa e observar a espera e a recuperação.
2. Entrar diretamente em uma rota privada com sessão válida.
3. Deixar a aba oculta por mais de 15 minutos e retornar.
4. Perder e recuperar a internet sem perder a sessão ou repetir uma gravação.
5. Retornar com JWT realmente expirado e confirmar o redirecionamento para login.

## Arquivos de referência

| Arquivo | Papel |
| --- | --- |
| [backend-connection.ts](../src/lib/backend-connection.ts) | Agendamento, estados, deduplicação, tentativas e cancelamento |
| [backend-connection-provider.tsx](../src/providers/backend-connection-provider.tsx) | Integração global com o navegador e avisos de conexão |
| [backend-fetch.ts](../src/lib/backend-fetch.ts) | Timeout e repetição limitada de leituras no servidor |
| [route.ts de saúde](../src/app/api/health/route.ts) | Encaminhamento do ping público para a Render |
| [layout.tsx privado](../src/app/(private)/layout.tsx) | Proteção da sessão e carregamento com `Suspense` |
| [error.tsx privado](../src/app/(private)/error.tsx) | Recuperação de páginas que falharam ao carregar |
| [session-expired.tsx](../src/components/auth/session-expired.tsx) | Encerramento de sessão inválida na consulta do perfil |
| [tests](../tests/) | Verificações automatizadas do controle de conexão e das chamadas |

Consulte também [Autenticação](authentication.md), [Contrato HTTP](api-routes.md#health) e [Documentação técnica](doc.md#disponibilidade-e-cold-start).
