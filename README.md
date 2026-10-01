# MyFinances Front-end

Front-end Next.js para gerenciamento financeiro pessoal. A v2.2.0 reúne as entregas A–E do plano de evolução e cartões de crédito. O simulador de compras (item F) ficou fora desta versão.

---

## Funcionalidades

- **Autenticação:** Login, cadastro, sessão via cookie HTTP-only e proteção de rotas privadas.
- **Landing page:** Apresentação pública dos recursos, com demonstrações visuais da interface.
- **Transações:** Criação, atualização, busca, importação CSV/OFX e exportação PDF/CSV.
- **Categorias:** Catálogo personalizado e regras de sugestão automática.
- **Dashboard:** Resumo financeiro, indicadores e gráficos.
- **Calendário:** Receitas recorrentes, despesas previstas, agenda mensal e projeção diária.
- **Wishlist:** Metas com aportes e retiradas individuais, conclusão de compras e histórico.
- **Cartões de crédito:** Cadastro, compras parceladas, limite e pagamento integral de faturas.
- **Despesas Fixas:** Cadastro, edição, remoção e marcação de pagamento.
- **Comparativo:** Visualização comparativa de receitas, despesas e saldo.
- **Configurações:** Atualização de dados do usuário e senha.

---

## Tecnologias Utilizadas

- **Next.js 15** com App Router.
- **React 19**.
- **TypeScript**.
- **TanStack Query** para cache client-side.
- **React Hook Form** e **Zod** para formulários e validação.
- **Tailwind CSS**, **Shadcn/UI** e **Radix UI** para interface.
- **Recharts** para gráficos.
- **Server Actions** e `fetch` para comunicação HTTP autenticada.

---

## Documentação

A documentação técnica do front-end está em [docs/doc.md](docs/doc.md).

O fluxo de autenticação está descrito em [docs/authentication.md](docs/authentication.md).

O [escopo da v2.2.0](docs/next-steps.md) registra as entregas, validações e a exclusão do simulador. O [contrato HTTP](docs/api-routes.md) e a [documentação técnica](docs/doc.md) descrevem as integrações atuais.

O [planejamento V2](docs/v2.md) e o [plano de implementação anterior](docs/implementation-plan.md) preservam o histórico das rodadas anteriores.

---

## Estrutura do Projeto

```plaintext
├── docs/                 # Documentação técnica e planejamento
├── public/               # Assets públicos
├── src/
│   ├── actions/          # Server Actions
│   ├── app/              # Rotas do App Router, separadas em (public) e (private)
│   ├── components/       # Componentes de tela, layout e UI
│   ├── hooks/            # Hooks e query client
│   ├── interfaces/       # Tipos de domínio
│   ├── lib/              # Autenticação, backend e helpers
│   ├── providers/        # Providers globais
│   ├── schemas/          # Schemas Zod
│   ├── services/         # Acesso server-side à API
│   └── utils/            # Formatadores e utilitários
├── env.exemple
└── package.json
```

## Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/Lucalopezz/MyFinances_Front.git
   cd MyFinances_Front
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure a API no `.env`:

   ```env
   BACKEND_URL=http://localhost:3001
   ```

4. Inicie o servidor:

   ```bash
   npm run dev
   ```
