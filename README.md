# DuoDev

Plataforma web de aprendizado em programação com trilhas, quizzes, progresso individual, gamificacao e painel administrativo para curadoria de conteudo.

## O que tem no projeto

- `Frontend do aluno`: home, trilhas, ranking, perfil, streak, missao e cosméticos.
- `Backend do aluno`: autenticacao, progresso, streak, ranking e snapshot de gamificacao.
- `Admin back`: CRUD e bootstrap dos dados de gamificacao, trilhas, conteudo e temporadas.
- `Admin front`: area administrativa para configurar o produto.
- `Banco compartilhado`: schema, migrações e cliente Drizzle em `packages/db`.

## Funcionalidades principais

- Trilhas com aulas, questoes e desafios.
- Gamificacao com XP, nivel, streak, badges, missao, ranking semanal e temporadas.
- Recompensas cosméticas: titulo, moldura, tema e selo.
- Perfil com itens desbloqueados, itens bloqueados e loadout equipado.
- Ranking com filtro, busca textual e detalhe de usuario.
- Seed de demo com varios usuarios em estados diferentes para apresentacao.

## Stack

- Frontend: React, TypeScript, Tailwind CSS, TanStack Router.
- Backend: NestJS.
- Banco: PostgreSQL.
- ORM: Drizzle.
- Infra: Docker Compose.

## Como rodar

### 1. Subir o ambiente

```bash
npm run dev
```

Esse comando sobe os containers principais definidos no `docker-compose.yaml`.

### 2. Popular a demo

```bash
npm run setup:demo
```

Esse comando:
- sobe `postgres` e `admin-back`
- executa o seed da demo
- faz login no `admin-back`
- aplica o bootstrap de gamificacao
- popula cosmeticos da demo

### 3. Encerrar o ambiente

```bash
npm run dev:down
```

Se quiser remover volumes locais:

```bash
npm run dev:down:v
```

## URLs locais

Quando o `docker compose` estiver rodando, os servicos sobem nestas portas:

- Frontend: `http://localhost:8020`
- Backend: `http://localhost:8010`
- Admin front: `http://localhost:8021`
- Admin back: `http://localhost:8011`
- Postgres: `localhost:8030`

## Contas da demo

### Todos os acessos

| Nome | Email | Senha |
| --- | --- | --- |
| Douglas Martins (admin) | `admin@duodev.com` | `admin123` |
| Lucas Almeida | `aluno@duodev.com` | `aluno123` |
| Douglas Ratts | `douglas.ratts@duodev.com` | `ratts123!` |
| Mariana Costa | `visitante1@duodev.com` | `demo123!` |
| Rafael Santos | `visitante2@duodev.com` | `demo123!` |
| Juliana Lima | `visitante3@duodev.com` | `demo123!` |
| Pedro Rocha | `visitante4@duodev.com` | `demo123!` |
| Camila Ferreira | `vivo01@duodev.com` | `live123!` |
| Bruno Oliveira | `vivo02@duodev.com` | `live123!` |
| Fernanda Alves | `vivo03@duodev.com` | `live123!` |
| Thiago Pereira | `vivo04@duodev.com` | `live123!` |
| Aline Barbosa | `vivo05@duodev.com` | `live123!` |
| Gustavo Martins | `vivo06@duodev.com` | `live123!` |
| Patricia Gomes | `vivo07@duodev.com` | `live123!` |
| Marcos Vinicius | `vivo08@duodev.com` | `live123!` |
| Larissa Souza | `vivo09@duodev.com` | `live123!` |
| Daniel Moreira | `vivo10@duodev.com` | `live123!` |

### Admin

- `Douglas Martins` - `admin@duodev.com` / `admin123`

### Usuario base

- `Lucas Almeida` - `aluno@duodev.com` / `aluno123`

### Usuario completo para demonstracao

- `Douglas Ratts` - `douglas.ratts@duodev.com` / `ratts123!`

### Usuarios limpos

- `Mariana Costa` - `visitante1@duodev.com` / `demo123!`
- `Rafael Santos` - `visitante2@duodev.com` / `demo123!`
- `Juliana Lima` - `visitante3@duodev.com` / `demo123!`
- `Pedro Rocha` - `visitante4@duodev.com` / `demo123!`

### Usuarios ativos

- `Camila Ferreira` - `vivo01@duodev.com` / `live123!`
- `Bruno Oliveira` - `vivo02@duodev.com` / `live123!`
- `Fernanda Alves` - `vivo03@duodev.com` / `live123!`
- `Thiago Pereira` - `vivo04@duodev.com` / `live123!`
- `Aline Barbosa` - `vivo05@duodev.com` / `live123!`
- `Gustavo Martins` - `vivo06@duodev.com` / `live123!`
- `Patricia Gomes` - `vivo07@duodev.com` / `live123!`
- `Marcos Vinicius` - `vivo08@duodev.com` / `live123!`
- `Larissa Souza` - `vivo09@duodev.com` / `live123!`
- `Daniel Moreira` - `vivo10@duodev.com` / `live123!`

## Estrutura do monorepo

```text
/duodev
├── apps
│   ├── frontend
│   ├── backend
│   ├── admin/front
│   └── admin/back
├── packages
│   └── db
├── scripts
└── docker-compose.yaml
```

## Banco de dados

O schema central fica em `packages/db`. Os comandos principais sao:

```bash
npm run build -w @duodev/db
npm run db:generate -w @duodev/db
npm run db:push -w @duodev/db
```

## Observacoes

- O projeto usa Docker para o ambiente local.
- O seed da demo e o bootstrap de gamificacao sao separados do `dev` para evitar sobrescrita acidental de dados.
- O `README` dos subprojetos complementa detalhes de cada app.
