# Escopo atual do MyFinances

Atualizado em 08/10/2026. As funcionalidades previstas no escopo aprovado estão implementadas na API e no frontend. Este documento descreve o produto disponível; os registros de planejamento e validação anteriores estão no [índice da documentação](README.md#histórico-de-planejamento-e-validação). As mudanças por versão estão no [changelog](../CHANGELOG.md).

## Funcionalidades implementadas

| Domínio | Comportamento disponível | Interface |
| --- | --- | --- |
| Autenticação e usuário | Cadastro, login, sessão HTTP-only, perfil e senha | `/register`, `/login`, `/config` |
| Landing page | Apresentação pública e demonstrações da interface | `/` |
| Transações | Receitas e despesas, edição, remoção, duplicação pelo formulário, navegação mensal, filtros e totais | `/transactions`, `/transactions/[id]` |
| Categorias e regras | Categorias personalizadas, arquivamento/restauração, prioridades, teste e sugestão por descrição | `/config` e formulários financeiros |
| Importação | CSV/OFX com mapeamento, prévia, revisão de categorias/duplicatas e confirmação | `/transactions` |
| Exportação | PDF/CSV assíncronos, acompanhamento e download autenticado | `/transactions` |
| Dashboard e comparativos | Resumo mensal, indicadores, comparação de períodos e despesas por categoria | `/dashboard`, `/comparative` |
| Orçamentos | Limites mensais por categoria, gasto realizado e valor restante | `/dashboard` |
| Calendário | Agenda, receitas mensais/anuais, edição/pausa, confirmação de recebimento e projeção diária | `/calendar` e projeção no dashboard |
| Wishlist | Reserva individual, aportes, retiradas, sugestão mensal, histórico e conclusão com despesa vinculada | `/wishlist`, `/wishlist/edit/[id]` |
| Cartões | Cadastro, limite, parcelas, faturas, pagamento integral e remoção de cartões quitados | `/cards` e formulário de nova despesa |
| Despesas fixas | Recorrências, edição, pagamentos/desmarcações e avanço de ciclos | `/fixed-expenses` |
| Notificações | Alertas de vencimento, consulta, exclusão e leitura individual ou em lote | Cabeçalho da área autenticada |
| Interface | Layout responsivo, temas claro/escuro e estados de carregamento, vazio, erro e sucesso | Páginas públicas e privadas |
| Disponibilidade da API | Aquecimento periódico com a aba visível, reconexão ao retornar e tentativa novamente sem encerrar a sessão por falha de rede | Páginas públicas e privadas |

## Regras gerais

- O saldo registrado é calculado a partir das transações realizadas no aplicativo. A projeção considera os compromissos cadastrados e explicita suas premissas.
- A dashboard e a listagem de transações destacam o saldo total de todo o histórico, independente do mês e dos filtros. O resultado mensal aparece separado e considera os filtros aplicados à listagem. Indicadores secundários da dashboard ficam em uma seção expansível.
- Uma previsão de receita ou despesa não cria uma transação por si só. Confirmar recebimentos e pagamentos substitui a previsão pelo realizado.
- Aportes reservam dinheiro para uma meta e retiradas liberam essa reserva. A conclusão de uma compra cria uma única despesa e preserva o histórico.
- Compras no cartão comprometem limite; as despesas realizadas são criadas no pagamento da fatura.
- Dados financeiros sensíveis são criptografados no backend. O frontend usa sessão em cookie HTTP-only e chamadas autenticadas no servidor.

## Limites de escopo

O simulador de compras foi retirado do planejamento anterior. Open Finance, contas bancárias/carteiras, OCR, categorização por IA e compartilhamento familiar não integram o escopo aprovado. Cartões têm pagamento integral; pagamento parcial, estorno, edição de cartão/compra, juros e conciliação de extrato não estão disponíveis. A conclusão de compras da wishlist e recebimentos recorrentes não possuem fluxo específico de estorno.

Os contratos estão em [Rotas da API](api-routes.md), e os guias de domínio estão no [índice da documentação](README.md#guias-da-api).
