**Arquitetura & Fluxos Principais — Marketplace Multi-ONG (resumo)**

1. Autenticação e Multi-Tenancy

- Fluxo: usuário realiza `POST /auth/login` → backend valida credenciais e emite JWT com `organization_id` embutido.
- Decisão: `organization_id` nunca é confiado do client; é derivado do token JWT e aplicado por guards/middleware (`jwt-auth.guard.ts`, `organization.middleware.ts`).
- Consequência: todas as queries/updates de recursos org-restritos filtram por `organization_id` no repositório.

2. CRUD de Produtos (Área da ONG)

- Fluxo: ONG cria/edita/exclui produto via endpoints restritos; backend grava `organization_id` automaticamente.
- Decisão: verificar `organization_id` ao nível de repositório (defesa em profundidade). Registrar autor e timestamps.

3. Portal Público — Catálogo e Busca

- Fluxo: cliente consulta `GET /products` (paginado). Pode usar busca em linguagem natural.
- Decisão AI: implementar adapter para LLM que transforma texto natural em filtros (category, price_max, keywords). Variáveis: `OPENAI_API_KEY`, `AI_TIMEOUT_MS`.
- Fallback crítico: se chamada LLM falhar/timeout (ex.: >1500–2000ms), executar busca por texto simples (nome/descrição) usando ILIKE/Full-Text Search.
- Exibição: retornar também a interpretação aplicada ao usuário (string resumida).

4. Carrinho e Checkout (sincronia inicial)

- Fluxo: usuário monta carrinho; `POST /orders` inicia o checkout.
- Decisão transacional: criação de pedido realiza validação e reserva/baixa de estoque dentro de uma transação DB.
- Mecanismo: usar row-level locks/SELECT ... FOR UPDATE para garantir que `stock_qty` não fique negativo sob concorrência.
- Erro: se qualquer item estiver sem estoque suficiente, rollback e resposta com detalhe do item indisponível.

5. Processamento Assíncrono (jobs/queues)

- Fluxo: após confirmação atômica do pedido, publicar jobs em fila (ex.: Redis queue / Bull / Bee-Queue).
- Jobs: simulação de pagamento (delay + probabilidade de falha), envio de notificações (logs), emissão de recibo/email (simulado).
- Decisão: não bloquear resposta ao usuário; usar worker(s) para pós-processamento.
- Resiliência: implementar retries exponenciais, idempotência por `order_id` e dead-letter/alert quando ultrapassar tentativas.

6. Idempotência e Retries

- Decisão: handlers de job verificam estado atual antes de aplicar efeito (ex.: se pagamento já processado, ignorar). Usar chaves únicas e marcações de estado no DB (`order.status`).
- Retries: backoff exponencial (ex.: 1000ms \* 2^n), limite de tentativas configurável, enviar logs/alarme se falhar persistentemente.

7. Caching (Opção B — Redis)

- Decisão: cachear listagens públicas (`GET /products`) para reduzir latência. Chave composta com versão (`products:v{ver}:page:{p}:cat:{c}:q:{q}`).
- Invalidação: duas opções:
  - Incrementar `products:version` global ao criar/atualizar/deletar produto (simples e segura).
  - Ou manter set de chaves e remover somente as chaves afetadas (mais granular).
- TTLs: curto para buscas dinâmicas (30s–2min), maior para páginas estáticas (5–10min).
- Atenção: nunca cachear dados privados sem scoping por `organization_id`.

8. Consistência e Concorrência

- Decisão: operações críticas (baixa de estoque) devem ser transacionais no banco relacional; evitar soluções apenas em cache para consistência forte.
- Recomenda-se testes de carga para validar ausência de overselling e ajustar isolamento/transações conforme necessário.

9. Observabilidade e Operações

- Logs: registrar operações críticas (reservas, rollback, falhas de pagamento) em `backend/logs/` e usar nível de log apropriado.
- Métricas: tempo de resposta de AI, taxa de falhas de jobs, latência de checkout, contagem de retries.
- Alerta: criação de alertas para falhas repetidas no worker/queue.

10. Segurança & Boas práticas

- Separar segredos e não commitar `.env` reais. Usar secret manager em produção.
- Timeouts e circuit-breakers para chamadas externas (LLM e gateway pagamento).
- Limitar dados retornados em APIs públicas e validar todo input no backend.

Resumo final

- Arquitetura híbrida: sincronia para garantia forte (transações) + assincronia para resiliência e escalabilidade (fila/workers).
- Cache para performance com invalidação segura; LLM para conveniência de busca com fallback confiável.

---

Documento sucinto. Posso expandir com diagramas, exemplos de payloads e sugestão de bibliotecas (BullMQ, pg-transactions, typeorm/best-practices) se quiser.
