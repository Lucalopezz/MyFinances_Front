# MyFinances Front-end

Interface de gerenciamento financeiro pessoal do MyFinances, construída com Next.js. Consome a [API MyFinances](https://github.com/Lucalopezz/MyFinances_API) para registrar movimentações, acompanhar compromissos e organizar metas.

Versão de referência: **v2.2.2**. Consulte o [histórico de versões](CHANGELOG.md) para conhecer as mudanças de cada release.

## Funcionalidades

- **Autenticação e usuário:** cadastro, login, sessão via cookie HTTP-only, perfil e senha.
- **Landing page:** apresentação pública dos recursos e demonstrações da interface.
- **Transações:** receitas e despesas, edição, remoção, duplicação pelo formulário, navegação mensal e busca.
- **Categorias e regras:** catálogo personalizado e sugestões de classificação por descrição.
- **Importação e exportação:** CSV/OFX com revisão antes de confirmar; relatórios em PDF/CSV.
- **Dashboard e comparativos:** saldo total, resumo mensal, indicadores e análise de receitas, despesas e saldo.
- **Orçamentos:** limites mensais e acompanhamento de gastos por categoria.
- **Calendário financeiro:** agenda, receitas recorrentes e projeção diária de saldo.
- **Wishlist:** metas com aportes, retiradas, histórico e conclusão de compras.
- **Cartões de crédito:** limite, compras parceladas, faturas, pagamento integral e remoção de cartões quitados.
- **Despesas fixas e notificações:** gestão de recorrências, marcação de pagamento e leitura individual ou em lote de alertas.
- **Interface responsiva:** navegação para desktop e celular, com temas claro e escuro.

O [escopo atual](docs/features.md) reúne os comportamentos disponíveis e seus limites.

## Documentação

Comece pelo [índice da documentação](docs/README.md). As referências principais são:

| Referência | Conteúdo |
| --- | --- |
| [Escopo atual](docs/features.md) | Funcionalidades implementadas e regras gerais |
| [Documentação técnica](docs/doc.md) | Estrutura, rotas, integrações e cache |
| [Contrato HTTP](docs/api-routes.md) | Endpoints consumidos pelo frontend |
| [Autenticação](docs/authentication.md) | Sessão, cookie HTTP-only e proteção de rotas |
| [Histórico de versões](CHANGELOG.md) | Mudanças por release |

Os guias de domínio e os registros históricos estão organizados no índice.

## Tecnologias

- Next.js 15 com App Router, React 19 e TypeScript.
- Server Components, Server Actions e `fetch` para comunicação autenticada.
- TanStack Query para consultas e cache interativo.
- React Hook Form e Zod para formulários.
- Tailwind CSS 4, componentes estilo shadcn/ui e Radix UI.
- Recharts para gráficos e `next-themes` para temas.

## Instalação e execução

Pré-requisitos: Node.js com npm e a API MyFinances configurada.

1. Clone o repositório e instale as dependências:

   ```bash
   git clone https://github.com/Lucalopezz/MyFinances_Front.git
   cd MyFinances_Front
   npm install
   ```

2. Copie o exemplo de configuração:

   ```bash
   cp env.exemple .env
   ```

   Configure a URL da API no servidor Next.js:

   ```env
   BACKEND_URL=http://localhost:3001
   ```

3. Inicie o frontend:

   ```bash
   npm run dev
   ```

   A URL local padrão é `http://localhost:3000`. As chamadas autenticadas leem o cookie `mf_token` no servidor; o JWT permanece HTTP-only.

## Comandos

| Comando | Uso |
| --- | --- |
| `npm run dev` | Desenvolvimento |
| `npm run build` | Build de produção |
| `npm run start` | Execução da build |
| `npx tsc --noEmit` | Verificação de tipos |

O script legado `npm run lint` usa `next lint` e não possui configuração funcional para execução não interativa. Veja os detalhes na [documentação técnica](docs/doc.md#scripts).

## Estrutura

```text
├── docs/                 # Referências técnicas, guias e histórico
├── public/               # Assets públicos
├── src/
│   ├── actions/          # Server Actions e acesso autenticado à API
│   ├── app/              # Rotas públicas, privadas e handlers Next.js
│   ├── components/       # Componentes de domínio, layout e UI
│   ├── constants/        # Constantes de domínio
│   ├── hooks/            # Queries, query keys e hooks compartilhados
│   ├── lib/              # Autenticação, backend e utilitários
│   ├── models/           # Tipos e modelos de domínio
│   ├── providers/        # Providers da aplicação
│   ├── schemas/          # Schemas Zod
│   └── utils/            # Formatadores e utilitários
├── env.exemple
└── package.json
```
