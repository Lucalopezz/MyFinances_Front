# Documentação do Front-end

Este índice organiza as referências atuais do MyFinances Front-end. O [README do projeto](../README.md) contém instalação, comandos e visão geral; o [changelog](../CHANGELOG.md) concentra as informações de versão.

## Referências atuais

| Documento | Quando consultar |
| --- | --- |
| [Escopo atual](features.md) | Para conhecer as funcionalidades implementadas e seus limites |
| [Documentação técnica](doc.md) | Para entender estrutura, rotas, integração, cache e interface |
| [Contrato HTTP](api-routes.md) | Para consultar endpoints, entradas e respostas da API |
| [Autenticação](authentication.md) | Para trabalhar com sessão, cookie HTTP-only e proteção de rotas |
| [Calendário financeiro](financial-calendar.md) | Para consultar recorrências, projeção e regras de datas |

## Guias da API

As regras financeiras, o banco e os procedimentos de implantação são documentados no backend:

- [Índice da API](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/README.md).
- [Importação CSV/OFX](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/transaction-imports.md).
- [Exportação PDF/CSV](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/transaction-exports.md).
- [Reservas da wishlist](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/wishlist-reservations.md).
- [Cartões de crédito](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/credit-cards.md).
- [Criptografia financeira](https://github.com/Lucalopezz/MyFinances_API/blob/main/docs/transaction-encryption.md).

Publique a API e sincronize seus índices antes de ativar interfaces que dependam de novos contratos.

## Histórico de planejamento e validação

Estes documentos preservam o contexto e as evidências das rodadas anteriores. Checklists e observações de validação refletem a data de cada registro; o estado funcional atual está em [Escopo atual](features.md).

- [Planejamento original da V2](v2.md).
- [Plano da rodada anterior](implementation-plan.md).
- [Registro de evolução da v2.2.0](next-steps.md).
- [Validação de categorias e regras](delivery-a-validation.md).
- [Validação de importação CSV/OFX](delivery-b-validation.md).
- [Validação de calendário financeiro](delivery-c-validation.md).
