**Desafio Full Stack — Marketplace Multi-ONG**

**Visão Geral:**

- **Objetivo:** Plataforma onde ONGs gerenciam catálogos próprios e vendem ao público.
- **Stack:** Backend: NestJS (`backend/`). Frontend: Next.js (`frontend/`). Redis usado para caching/filas (configuração em `backend/src/config/redis.config.ts`).

**API — Resumo dos recursos:**

- **Autenticação:** `POST /auth/login` → retorna `access_token` (JWT).
- **Produtos (público):** `GET /products` (paginado, filtros), `GET /products/:id`.
- **Produtos (ONG - restrito):** `POST /products`, `PUT /products/:id`, `DELETE /products/:id`.
- **Carrinho:** `POST /cart` (adicionar/atualizar), `GET /cart`.
- **Pedidos:** `POST /orders` → valida/baixa estoque e retorna confirmação.

**Segurança & Multi-Tenancy:**

- `organization_id` é sempre derivado do usuário autenticado no backend (não confiar no client).
- Middlewares/guards em `backend/src/common/` forçam restrição por organização nas operações CRUD.

**Busca Inteligente (AI) e Fallback:**

- Usuário entra com texto natural; backend chama API de LLM (configurável via env) para obter filtros (ex.: `category`, `price_max`, `keywords`).
- Exibir interpretação aplicada para o usuário (ex.: “Resultados para: Categoria=Doces; Preço ≤ 50”).
- **Fallback crítico:** definir `AI_TIMEOUT_MS` (ex.: 1500–2000 ms). Se falhar/timeout, usar busca textual simples por `name` e `description` (ILIKE/FTS).

**Pedidos, Estoque e Concorrência:**

- Criação de pedido usa transação DB: validar estoque e aplicar `stock_qty` atomically.
- Usar locks/row-level locks (`SELECT ... FOR UPDATE`) para evitar overselling; em falha, rollback e resposta de erro ao usuário.

**Processamento Assíncrono:**

- Após confirmar pedido, enfileirar jobs (simular pagamento com delay/possível falha; notificações — logs).
- Jobs devem ser idempotentes; implementar retries exponenciais e dead-letter/logging para falhas persistentes.

**Caching (Opção B — Redis):**

- Cachear listagens públicas de `GET /products` com chaves compostas (ex.: `products:v{version}:page:{p}:cat:{c}`) e TTL (30s–5min).
- Invalidação: incrementar `products:version` ou remover chaves afetadas ao criar/atualizar/deletar produto.
- ## Incluir `organization` apenas quando cachear dados restritos — preferir cache para listagens públicas.
