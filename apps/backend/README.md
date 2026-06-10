# Backend DuoDev

API NestJS do aluno. Responsavel por autenticacao, perfil, progresso, streak, ranking e snapshot de gamificacao.

## Modulos principais

- `auth`: login, cadastro, reset de senha e `GET /auth/me`
- `learning`: trilhas, categorias e conteudo publicado
- `user-trail`: progresso por trilha e conclusao de aulas, desafios e quizzes
- `streak-log`: registro diario de estudo e calculo de streak
- `gamification`: XP, nivel, badges, cosméticos, missões e ranking
- `users`: perfil, preferencias, notificacoes e loadout de cosméticos

## Dependencias

O backend depende de:

- PostgreSQL
- `packages/db` compilado
- variaveis de ambiente da raiz do projeto

## Como rodar

### Ambiente completo

Na raiz do projeto:

```bash
npm run dev
```

### Popular a demo

Na raiz do projeto:

```bash
npm run setup:demo
```

### Rodar isolado

```bash
npm install
npm run build -w @duodev/db
npm run start:dev
```

## Variaveis de ambiente importantes

Estas variaveis precisam apontar para o ambiente correto:

- `DATABASE_URL`
- `JWT_SECRET`
- `FRONTEND_URL`
- `ADMIN_BACK_URL`

Se estiver usando Docker Compose, o `setup:demo` ja usa a configuracao do repositorio e faz o bootstrap automaticamente.

## Endpoints principais

- `POST /auth/login`
- `GET /auth/me`
- `GET /users/leaderboard/weekly`
- `GET /users/leaderboard/seasons`
- `GET /users/rewards/weekly`
- `GET /users/cosmetics`
- `GET /users/missions`
- `GET /users/notifications`

## Validacao

```bash
npx tsc -p tsconfig.json --noEmit --incremental false
```

## Observacao

Se o build falhar por permissao de escrita em `dist/`, rode com o ambiente Docker ativo e valide novamente. O typecheck costuma ser suficiente para confirmar a integridade do codigo.
