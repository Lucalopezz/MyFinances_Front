# Histórico de versões

Este arquivo concentra as mudanças por release. O [escopo atual](docs/features.md) e o [índice da documentação](docs/README.md) descrevem a aplicação e suas integrações.

## Não lançado

- Fundo de carregamento, skeleton, mensagens e aviso de conexão alinhados às cores dos temas claro e escuro da aplicação, inclusive antes da montagem do layout privado.

## [v2.3.0](https://github.com/Lucalopezz/MyFinances_Front/tree/v2.3.0) — 08/10/2026

### Disponibilidade e sessão

- Aquecimento global da API na abertura do site e a cada cinco minutos com a aba visível, incluindo páginas públicas e acesso direto à área privada.
- Reconexão ao retornar à aba ou recuperar a internet, com chamadas deduplicadas, cancelamento e até três tentativas de saúde por rodada.
- Leituras server-side com timeout de 15 segundos por tentativa e uma repetição em falhas transitórias; gravações mantêm envio único.
- Login e cadastro aguardam disponibilidade antes de enviar o formulário. Falhas de rede preservam a sessão; o ping não renova o JWT.
- Carregamento progressivo da área privada, tela de erro com tentativa novamente e recuperação de consultas após restabelecer a conexão.
- Falhas no perfil, resumo mensal, metas e despesas não são interpretadas como usuário ausente, dados vazios ou saldo zero.

### Interface e compatibilidade

- Espera apresentada como “Esperando o servidor…” e mensagens públicas sem explicações de infraestrutura ou detalhes de falhas internas e exportações.
- Atualização do `react-day-picker` para a versão 9 compatível com React 19 e adaptação do calendário à nova API de estilos e ícones.

### Documentação e validação

- Guia de cold start com contexto da hospedagem na Vercel/Render, solução implementada, intervalos, limites e cenários de validação após o deploy.
- Referências técnicas, autenticação, contrato HTTP e escopo atualizados; comentários detalhados explicam conexão, transporte, recuperação de páginas, sessão e testes.
- Comando `npm run test:connection` com 19 testes automatizados. Verificação separada de TypeScript e build de produção validados localmente.

Esta versão reutiliza o endpoint público `GET /health` existente na API. O cold start inicial e a suspensão de abas em segundo plano continuam possíveis; o deploy e a validação no navegador estão descritos em [Cold start da API](docs/api-cold-start.md#validação-e-publicação).

## [v2.2.2](https://github.com/Lucalopezz/MyFinances_Front/tree/v2.2.2) — 03/10/2026

- Saldo total em destaque na dashboard e na listagem mensal de transações, independente do mês e dos filtros.
- Resultado, entradas e saídas do mês reunidos em um resumo compacto e responsivo; filtros ativos têm rótulos específicos para seus resultados.
- Economia e maior gasto da dashboard disponíveis em uma seção expansível de indicadores, reduzindo a quantidade de cards na tela.
- Consulta autenticada do saldo com carregamento, erro, tentativa novamente e atualização após alterações nas transações.
- Dashboard usa o mês de São Paulo de forma consistente no resumo e nos orçamentos.

Requer a API v2.2.2 com `GET /transactions/balance`.

## [v2.2.1](https://github.com/Lucalopezz/MyFinances_Front/tree/v2.2.1) — 03/10/2026

### Documentação

- README reorganizado em visão geral, funcionalidades, referências técnicas e execução.
- Índice da documentação e referência de escopo atual adicionados.
- Planejamentos e relatórios de validação anteriores identificados como históricos.
- Referências de versão centralizadas neste changelog; guias atuais organizados por domínio.
- Estrutura, rotas, stack e descrição das integrações alinhadas ao código existente.

### Ajustes incluídos desde v2.2.0

- Transações organizadas por mês, com filtros na URL e totais independentes da paginação.
- Remoção de cartões quitados com confirmação e atualização dos seletores.
- Ajustes de layout e navegação em telas pequenas, dashboard e estados de carregamento.
- Consulta de disponibilidade da API a partir da landing page.

Esta atualização documental não altera o código da aplicação. Os ajustes funcionais acima já estavam em `main` antes da revisão da documentação.

## [v2.2.0](https://github.com/Lucalopezz/MyFinances_Front/tree/v2.2.0) — 01/10/2026

- Gestão de categorias personalizadas e regras de classificação.
- Fluxo de importação CSV/OFX com mapeamento, revisão e confirmação.
- Calendário financeiro, receitas recorrentes e projeção diária.
- Wishlist com reservas individuais, histórico e conclusão de compras.
- Telas de cartões, compras parceladas, limite e pagamento integral de faturas.

O planejamento e as evidências dessa rodada estão no [histórico da documentação](docs/README.md#histórico-de-planejamento-e-validação).

## Versões anteriores

Consulte as [tags do repositório](https://github.com/Lucalopezz/MyFinances_Front/tags) para os marcos anteriores.
