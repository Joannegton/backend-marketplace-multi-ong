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

3. Suba os containers com build (demora um pouco):

```powershell
docker-compose up --build
```

4. Acessos padrão / sinais de sucesso:

- Backend: http://localhost:3000
- Frontend: http://localhost:3001

- **Credenciais de teste (seed):** o script de seed insere 3 usuários administrativos. Use essas contas para login/testes:

  - `admin@educacao.org` — senha: `Senha@123`
  - `admin@vida.org` — senha: `Segura#456`
  - `admin@criativa.org` — senha: `Admin!789`

## Importante

- **Upload de imagens:** o projeto não implementa upload de arquivos no backend. O cadastro/edição de produtos aceita apenas uma URL no campo `imageUrl`, por conta de serviços e tempo.
- **Placeholder:** se `imageUrl` não for informada, o frontend usa `public/placeholder.svg` como imagem padrão.
- **custos:** considerar custos de armazenamento/bandwidth.
