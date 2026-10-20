# Documentação do Front-end

Este índice organiza as referências atuais do MyFinances Front-end. O [README do projeto](../README.md) contém instalação, comandos e visão geral; o [changelog](../CHANGELOG.md) concentra as informações de versão.

## Referências atuais

| Documento | Quando consultar |
| --- | --- |
| [Escopo atual](features.md) | Para conhecer as funcionalidades implementadas e seus limites |
| [Documentação técnica](doc.md) | Para entender estrutura, rotas, integração, cache e interface |
| [Contrato HTTP](api-routes.md) | Para consultar endpoints, entradas e respostas da API |
| [Autenticação](authentication.md) | Para trabalhar com sessão, cookie HTTP-only e proteção de rotas |
| [Cold start da API](api-cold-start.md) | Para entender a hospedagem na Vercel/Render, o problema de inatividade e as melhorias de conexão |
| [Calendário financeiro](financial-calendar.md) | Para consultar recorrências, projeção e regras de datas |
| [Testes automatizados](testing.md) | Para executar unitários, integrações, E2E e consultar limites de cobertura |

## Guias da API

As regras financeiras, o banco e os procedimentos de implantação estão no backend deste monorepositório:

- [Índice da API](../../api/docs/README.md).
- [Importação CSV/OFX](../../api/docs/transaction-imports.md).
- [Exportação PDF/CSV/XLSX](../../api/docs/transaction-exports.md).
- [Ambiente local de teste](../../api/docs/local-development.md): Docker, `.env` e conta com dados de exemplo.
- [Reservas da wishlist](../../api/docs/wishlist-reservations.md).
- [Cartões de crédito](../../api/docs/credit-cards.md).
- [Criptografia financeira](../../api/docs/transaction-encryption.md).

Prepare eventuais mudanças de schema e publique os dois serviços no mesmo deployment antes de ativar interfaces que dependam de novos contratos.

## Histórico de planejamento e validação

Estes documentos preservam o contexto e as evidências das rodadas anteriores. Checklists e observações de validação refletem a data de cada registro; o estado funcional atual está em [Escopo atual](features.md).

- [Planejamento original da V2](v2.md).
- [Plano da rodada anterior](implementation-plan.md).
- [Registro de evolução da v2.2.0](next-steps.md).
- [Validação de categorias e regras](delivery-a-validation.md).
- [Validação de importação CSV/OFX](delivery-b-validation.md).
- [Validação de calendário financeiro](delivery-c-validation.md).
