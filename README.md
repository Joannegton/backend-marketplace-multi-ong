# Guia de Inicialização - Backend Marketplace Multi-ONG

Este documento descreve como iniciar o projeto backend com Docker.

## Pré-Requisitos

Você deve ter instalado:

- **Docker** e **Docker Compose** (versão 1.29+)
- Um terminal/PowerShell aberto na pasta raiz do projeto

## Passos para Iniciar a aplicação com Docker

1. Clone o repositório e entre na pasta:

```powershell
git clone <repositorio-url>
cd backend-marketplace-multi-ong
```

2. Crie os arquivos de ambiente a partir dos exemplos (não comite o `.env`):

```powershell
Copy-Item backend\.env.example backend\.env
Copy-Item frontend\.env.example frontend\.env
```

3. Suba os containers com build (este comando irá construir as imagens):

```powershell
docker-compose up --build
```

4. Verifique os logs (opcional):

```powershell
docker-compose logs -f app frontend
```

5. Acessos padrão / sinais de sucesso:

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

Procure nos logs mensagens de inicialização do NestJS e que o banco esteja pronto.

Observações importantes:

- Não coloque chaves secretas no frontend (`frontend/.env` deve conter apenas variáveis públicas prefixadas com `NEXT_PUBLIC_`).
- Mantenha `backend/.env` e `frontend/.env` no `.gitignore` (já configurado).
- Em ambientes de produção, injete segredos via CI/CD ou secrets manager em vez de arquivos `.env`.
