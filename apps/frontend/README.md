# Frontend DuoDev

Aplicacao React do aluno. Consome a API principal e exibe home, trilhas, ranking, perfil, streak, missões e cosméticos.

## O que tem

- Home institucional da plataforma
- Lista de trilhas
- Ranking semanal e histórico sazonal
- Perfil com XP, level, streak, badges e cosméticos
- Missões diárias e semanais
- Feed de notificações da gamificação

## Como rodar

O frontend depende do backend principal, do banco e do seed da demo.

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

Se quiser rodar fora do Docker, configure o `.env` desta pasta:

```bash
VITE_API_URL=http://localhost:8010
```

Depois instale dependencias e inicie:

```bash
npm install
npm run dev
```

## URLs locais

- Frontend: `http://localhost:8020`
- API principal: `http://localhost:8010`

## Fluxo recomendado para demo

1. Suba o ambiente com `npm run dev`
2. Rode `npm run setup:demo`
3. Acesse o frontend e faca login com uma conta da demo

## Contas utiles

- `Douglas Ratts` - `douglas.ratts@duodev.com` / `ratts123!`
- `Camila Ferreira` - `vivo01@duodev.com` / `live123!`
- `Mariana Costa` - `visitante1@duodev.com` / `demo123!`

## Validação

```bash
npx tsc -p tsconfig.json --noEmit --incremental false
```
