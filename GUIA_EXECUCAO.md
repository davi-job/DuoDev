# Guia de Execucao do DuoDev

Este documento explica o processo completo para executar o DuoDev em ambiente local, preparar a base de demo e validar os principais fluxos da plataforma.

## 1. Visao geral

O DuoDev e um monorepo com:

- `apps/frontend`: aplicacao principal do aluno.
- `apps/backend`: API principal do aluno.
- `apps/admin/admin-front`: interface administrativa.
- `apps/admin/admin-back`: API administrativa.
- `packages/db`: schema compartilhado, cliente Drizzle e migracoes.
- `docker-compose.yaml`: orquestracao dos servicos locais.

O fluxo normal de uso e:

1. instalar dependencias
2. subir os containers
3. aplicar seed da demo
4. acessar os aplicativos

## 2. Requisitos

Antes de rodar o projeto, tenha instalado:

- `Node.js` 20 ou superior
- `npm`
- `Docker`
- `Docker Compose`

Se voce for trabalhar fora do Docker, tambem precisa de um banco PostgreSQL acessivel via `DATABASE_URL`.

## 3. Arquivos de ambiente

O projeto usa variaveis de ambiente na raiz e em alguns apps.

### Raiz

O arquivo `.env` da raiz e lido pelos scripts de setup e pelos servicos em Docker.

### Apps

- `apps/frontend/.env`
- `apps/backend/.env`
- `apps/admin/admin-back/.env`
- `apps/admin/admin-front/.env` quando necessario

Se algum deles nao existir, copie a estrutura esperada do projeto e ajuste as URLs locais.

Variaveis mais importantes:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_BACK_URL`
- `VITE_API_URL`

## 4. Instalar dependencias

Na raiz do projeto:

```bash
npm install
```

Isso instala as dependencias de todos os workspaces.

## 5. Subir o ambiente

### Opcao recomendada

```bash
npm run dev
```

Esse comando sobe os containers definidos no `docker-compose.yaml`.

### Alternativa com rebuild

Se voce alterou Dockerfile, dependencias ou quiser forcar rebuild:

```bash
npm run dev:build
```

### Parar o ambiente

```bash
npm run dev:down
```

Se quiser remover volumes:

```bash
npm run dev:down:v
```

## 6. Preparar a demo

Depois que os containers estiverem ativos, rode:

```bash
npm run setup:demo
```

Esse comando faz, nesta ordem:

1. sobe `postgres` e `admin-back`
2. executa o seed da demo no `admin-back`
3. autentica no `admin-back`
4. executa o bootstrap de gamificacao
5. popula os loadouts cosméticos da demo

Esse passo e essencial para deixar o sistema pronto para apresentacao.

## 7. URLs locais

Depois de subir o ambiente, acesse:

- Frontend do aluno: `http://localhost:8020`
- Backend do aluno: `http://localhost:8010`
- Admin front: `http://localhost:8021`
- Admin back: `http://localhost:8011`
- PostgreSQL: `localhost:8030`

## 8. Sequencia completa recomendada

Se voce quiser subir tudo do zero, siga esta ordem:

```bash
npm install
npm run dev
npm run setup:demo
```

Depois:

1. abra o frontend em `http://localhost:8020`
2. faca login com uma conta da demo
3. valide trilhas, ranking, perfil e cosméticos
4. abra o admin se quiser ajustar conteudo e gamificacao

## 9. Contas da demo

### Admin

- `Douglas Martins`
  - email: `admin@duodev.com`
  - senha: `admin123`

### Usuario base

- `Lucas Almeida`
  - email: `aluno@duodev.com`
  - senha: `aluno123`

### Usuario completo para demonstracao

- `Douglas Ratts`
  - email: `douglas.ratts@duodev.com`
  - senha: `ratts123!`

### Usuarios limpos

- `Mariana Costa`
  - email: `visitante1@duodev.com`
  - senha: `demo123!`
- `Rafael Santos`
  - email: `visitante2@duodev.com`
  - senha: `demo123!`
- `Juliana Lima`
  - email: `visitante3@duodev.com`
  - senha: `demo123!`
- `Pedro Rocha`
  - email: `visitante4@duodev.com`
  - senha: `demo123!`

### Usuarios ativos

- `Camila Ferreira`
  - email: `vivo01@duodev.com`
  - senha: `live123!`
- `Bruno Oliveira`
  - email: `vivo02@duodev.com`
  - senha: `live123!`
- `Fernanda Alves`
  - email: `vivo03@duodev.com`
  - senha: `live123!`
- `Thiago Pereira`
  - email: `vivo04@duodev.com`
  - senha: `live123!`
- `Aline Barbosa`
  - email: `vivo05@duodev.com`
  - senha: `live123!`
- `Gustavo Martins`
  - email: `vivo06@duodev.com`
  - senha: `live123!`
- `Patricia Gomes`
  - email: `vivo07@duodev.com`
  - senha: `live123!`
- `Marcos Vinicius`
  - email: `vivo08@duodev.com`
  - senha: `live123!`
- `Larissa Souza`
  - email: `vivo09@duodev.com`
  - senha: `live123!`
- `Daniel Moreira`
  - email: `vivo10@duodev.com`
  - senha: `live123!`

## 10. O que a demo inclui

### Conteudo

- categorias
- trilhas
- aulas com texto e imagem
- questoes com alternativas
- desafios
- blog

### Gamificacao

- XP
- nivel
- streak
- streak freeze
- badges
- cosméticos
- missões diarias e semanais
- ranking semanal
- temporadas
- historico de recompensas
- notificacoes internas

### Admin

- bootstrap de gamificacao
- CRUD de configuracoes
- CRUD de badges
- CRUD de cosméticos
- CRUD de missoes
- temporadas de ranking
- faixas de recompensa
- regras adaptativas

## 11. Validação

Se quiser conferir se os tipos estao corretos, rode:

```bash
npx tsc -p apps/backend/tsconfig.json --noEmit --incremental false
npx tsc -p apps/frontend/tsconfig.json --noEmit --incremental false
npx tsc -p apps/admin/admin-back/tsconfig.json --noEmit --incremental false
```

## 12. Problemas comuns

### O login nao funciona

Verifique se:

- `npm run dev` esta rodando
- o `setup:demo` foi executado
- as variaveis de ambiente apontam para os hosts corretos
- o banco esta saudavel no Docker

### O ranking ou as recompensas estao vazios

Rode novamente:

```bash
npm run setup:demo
```

### O banco parece desatualizado

Suba apenas o PostgreSQL e refaça a demo:

```bash
docker compose up -d postgres
npm run setup:demo
```

### O build reclama de permissao

Rode o ambiente via Docker e valide com `tsc`. Em alguns ambientes o build completo pode falhar por permissao de escrita em `dist/`.

## 13. Ordem resumida para apresentar o sistema

1. `npm install`
2. `npm run dev`
3. `npm run setup:demo`
4. acessar `http://localhost:8020`
5. logar com `douglas.ratts@duodev.com / ratts123!`
6. mostrar home, trilhas, ranking, perfil e cosméticos

