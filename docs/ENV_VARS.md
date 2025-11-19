**Variáveis de Ambiente — Marketplace Multi-ONG**

Este arquivo lista as variáveis de ambiente usadas pelo projeto (backend e frontend) com breve descrição e valores sugeridos.

**Backend (`backend/.env`)**

- `POSTGRES_HOST`: Host do Postgres (ex.: `db`).
- `POSTGRES_PORT`: Porta do Postgres (ex.: `5432`).
- `POSTGRES_USER`: Usuário do banco (ex.: `marketplace_user`).
- `POSTGRES_PASSWORD`: Senha do banco (ex.: `secure_password`).
- `POSTGRES_DB`: Nome do banco (ex.: `marketplace_db`).

- `JWT_SECRET`: Chave secreta para assinar JWTs (mantenha confidencial).
- `JWT_EXPIRES_IN`: Tempo de expiração do token JWT (ex.: `7d`).

- `REDIS_HOST`: Host do Redis (ex.: `redis`).
- `REDIS_PORT`: Porta do Redis (ex.: `6379`).
- `REDIS_URL`: URL completa do Redis (ex.: `redis://redis:6379`).
- `CACHE_TTL_MINUTES`: TTL padrão de cache em minutos (ex.: `20`).
- `CATALOG_CACHE_TTL_MINUTES`: TTL para catálogo público (ex.: `20`).
- `SEARCH_CACHE_TTL_MINUTES`: TTL para resultados de busca (ex.: `10`).
- `ORG_PRODUCTS_CACHE_TTL_MINUTES`: TTL para produtos/ONG (ex.: `15`).
- `CART_TTL_MINUTES`: Tempo de vida do carrinho (ex.: `20`).

- `FRONTEND_URL`: URL do frontend (ex.: `http://localhost:3001`).

- `PORT`: Porta em que o backend roda (ex.: `3000`).
- `NODE_ENV`: Ambiente (`development` / `production`).
- `LOW_STOCK_THRESHOLD`: Limite para considerar estoque baixo (ex.: `5`).

- `OPENAI_API_KEY`: Chave da API (LLM) usada para busca inteligente (if aplicável).
 - `AI_TIMEOUT_MS`: Timeout em milissegundos para chamadas à API de LLM (ex.: `5000`).

**Frontend (`frontend/.env`)**

- `NEXT_PUBLIC_BACKEND_URL`: URL pública para o backend (ex.: `http://localhost:3000/api`).

---

Coloque estas variáveis em `backend/.env` e `frontend/.env` antes de iniciar a aplicação.
