# MyFinances Front-end

Front-end Next.js para gerenciamento financeiro pessoal. A aplicação consome uma API externa para autenticação, transações, wishlist, despesas fixas, dashboard e comparativos financeiros.

---

## Funcionalidades

- **Autenticação:** Login, cadastro, sessão via cookie HTTP-only e proteção de rotas privadas.
- **Transações:** Criação, atualização, listagem e remoção de transações.
- **Dashboard:** Resumo financeiro, indicadores e gráficos.
- **Wishlist:** Gestão de itens desejados, com acompanhamento do progresso de economia.
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
- **Axios** e `fetch` para comunicação HTTP.

---

## Documentação

A documentação técnica do front-end está em [docs/doc.md](docs/doc.md).

Planejamento da próxima versão do front está em [docs/v2.md](docs/v2.md).

---

## Estrutura do Projeto

```plaintext
├── docs/                 # Documentação técnica e planejamento
├── public/               # Assets públicos
├── src/
│   ├── actions/          # Server Actions
│   ├── app/              # Rotas do App Router
│   ├── components/       # Componentes de tela, layout e UI
│   ├── hooks/            # Hooks e query client
│   ├── interfaces/       # Tipos de domínio
│   ├── lib/              # Autenticação, backend e helpers
│   ├── providers/        # Providers globais
│   ├── schemas/          # Schemas Zod
│   ├── services/         # Acesso server-side à API
│   └── utils/            # Axios e formatadores
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
   NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
   BACKEND_URL=http://localhost:3001
   ```

4. Inicie o servidor:

   ```bash
   npm run dev
   ```
