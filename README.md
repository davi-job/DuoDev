# Duodev

## Sobre o Projeto

O Duodev é uma plataforma web responsiva projetada para atuar como uma ferramenta centralizada de aprendizado sobre programação, voltada para estudantes e universitários. O sistema consolida trilhas de estudo, gamificação e oferece um painel administrativo seguro para a curadoria de conteúdo.

## Principais Funcionalidades

- **Trilhas de Aprendizado:** O sistema lista e detalha trilhas de conhecimento, exibindo o progresso individual de conclusão do usuário.
- **Quizzes e Gamificação:** Interface interativa de perguntas com feedback instantâneo, onde o usuário acumula pontos de experiência (XP), níveis, streaks, badges e recompensas cosméticas.
- **Gestão de Conteúdo (Admin):** Painel administrativo com controle de acesso para realizar o CRUD (Criar, Ler, Atualizar, Deletar) de trilhas, categorias e aulas.
- **Interação do Usuário:** Funcionalidade que permite aos usuários logados avaliar o conteúdo com notas (estrelas) e deixar comentários.
- **Calendário de Boots:** Interface para que o usuário navegue e visualize os dias em que assistiu aos cursos.
- **Segurança e Autenticação:** Sistema de login e cadastro com senhas armazenadas com hash forte, além de proteção em formulários utilizando o Cloudflare Turnstile.

## Gamificação

O loop de gamificação do DuoDev foi desenhado para reforçar o hábito de estudo sem competir com a experiência pedagógica principal. Em vez de criar um jogo isolado, o sistema premia ações que já fazem parte da jornada de aprendizagem.

### Loop principal

1. O usuário inicia uma trilha ou conclui uma aula/desafio.
2. O sistema registra progresso real e concede XP.
3. A streak diária é atualizada conforme a consistência de estudo.
4. O perfil recalcula nível, badges e recompensas cosméticas desbloqueadas.
5. A interface passa a exibir esse progresso no topo da navegação, no perfil e nas telas de entrada.

### Fase 1 implementada

- **XP por ação:** iniciar trilha, concluir aula, concluir desafio, registrar streak e finalizar quiz.
- **Níveis progressivos:** calculados automaticamente a partir do XP acumulado.
- **Streak persistida:** a sequência atual e a melhor sequência passam a ser sincronizadas com o usuário.
- **Badges derivados:** conquistas como primeiros 100 XP, streak de 3/7 dias, trilha concluída e alta taxa de acerto.
- **Recompensas cosméticas:** títulos, molduras e temas liberados sem dar vantagem funcional.
- **Perfil enriquecido:** o endpoint `GET /auth/me` agora retorna um snapshot de gamificação pronto para consumo no frontend.

### Fase 2 inicial implementada

- **Missões diárias:** metas de curto prazo como registrar estudo no dia, avançar em uma trilha e proteger streak.
- **Missões semanais:** metas derivadas de atividade real, como estudar em 3 dias, iniciar nova trilha e movimentar mais de uma trilha.
- **Widget de missões na home:** a coluna lateral agora exibe objetivos ativos com progresso visual e status concluído/pendente.

### Próximas fases sugeridas

- **Ranking semanal:** competição curta e saudável entre usuários.
- **Desafios adaptativos:** foco automático em tópicos com maior taxa de erro.
- **Loja cosmética interna:** itens desbloqueados com moeda ganha estudando.

## Arquitetura do Repositório (Monorepo)

Este projeto utiliza uma estrutura de monorepo com workspaces para separar as responsabilidades, facilitando a manutenção e a modularidade da arquitetura.

```text
/duodev
├── /apps
│   ├── /frontend     (Aplicação web para o usuário final e admin)
│   └── /backend      (API para comunicação e regras de negócio)
├── /packages
│   └── /db           (Esquemas do banco de dados, migrações e cliente ORM)
├── package.json      (Configuração raiz dos workspaces)
└── docker-compose.yml(Infraestrutura conteinerizada)
```

## Stack Tecnológica

O desenvolvimento obedece a restrições tecnológicas específicas definidas no escopo:

- **Frontend:** React 19, Typescript, Tailwind CSS V4, Tanstack Router e React Hook Form.
- **Backend:** NestJS para a comunicação entre front e back.
- **Banco de Dados:** PostgreSQL hospedado em infraestrutura conteinerizada com Docker.
- **ORM e Gestão de Dados:** Drizzle ORM (Pacote local).
- **Controle de Versão:** Git.

## Pré-requisitos e Instalação

O processo de instalação segue o padrão definido na documentação técnica:

1. Clone o repositório Git:
    ```bash
    git clone <url-do-repositorio>
    cd duodev
    ```
2. Configure as variáveis de ambiente baseadas no arquivo de exemplo:
    ```bash
    cp .env.example .env
    ```
3. Instale as dependências de todos os módulos simultaneamente a partir da raiz do projeto:
    ```bash
    # O documento menciona pnpm, mas utilize npm se foi o gerenciador configurado nos workspaces.
    pnpm install
    ```
4. Suba o banco de dados PostgreSQL utilizando o Docker:
    ```bash
    docker-compose up -d
    ```
5. Execute as migrações do banco de dados:
    ```bash
    # Comando executado dentro do pacote /packages/db
    pnpm run db:migrate
    ```
6. Inicie as aplicações de desenvolvimento:
    ```bash
    # Em terminais separados
    pnpm run dev --filter frontend
    pnpm run dev --filter backend
    ```

## Documentação e Padrões

- O código-fonte deve seguir os padrões de codificação PSR-12 e conter comentários claros para manutenção futura.
- O sistema implementa HTTPS (SSL/TLS) para todas as comunicações entre o cliente e o servidor.

---

## Pacote de Banco de Dados (`@duodev/db`)

O pacote `packages/db` centraliza toda a camada de dados do projeto: esquemas, relações e o cliente Drizzle conectado ao PostgreSQL. Todos os apps do monorepo importam daqui.

### Estrutura

```text
packages/db/
├── drizzle.config.ts        ← configuração do drizzle-kit (lê DATABASE_URL)
├── tsconfig.json
└── src/
    ├── index.ts             ← ponto de entrada (re-exporta tudo)
    ├── client.ts            ← pool Postgres + instância do Drizzle
    └── schema/
        ├── users.ts
        ├── user-interests.ts
        ├── user-languages.ts
        ├── trails.ts
        ├── user-trails.ts
        ├── streak-logs.ts
        ├── blog-posts.ts
        ├── relations.ts     ← todas as relações definidas aqui
        └── index.ts
```

### Scripts disponíveis

Execute os comandos abaixo a partir da raiz do projeto (os scripts rodam no contexto do workspace `@duodev/db`):

| Comando                             | Descrição                                                     |
| ----------------------------------- | ------------------------------------------------------------- |
| `npm run build -w @duodev/db`       | Compila o pacote TS → `dist/`                                 |
| `npm run db:generate -w @duodev/db` | Gera arquivos SQL de migração a partir das mudanças no schema |
| `npm run db:push -w @duodev/db`     | Aplica o schema diretamente no banco                          |
| `npm run db:studio -w @duodev/db`   | Abre o Drizzle Studio no browser para inspecionar os dados    |

### Fluxo de trabalho recomendado

**Desenvolvimento (iteração rápida):**

```bash
# 1. Compile o pacote após qualquer mudança no schema
npm run build -w @duodev/db

# 2. Aplique direto no banco local (sem gerar arquivo de migração)
npm run db:push -w @duodev/db
```

**Preparando uma migration para subir ao repositório:**

```bash
# Gera um arquivo SQL versionado em packages/db/migrations/
npm run db:generate -w @duodev/db

# Inspecione o SQL gerado antes de commitar
```

### Como importar nos apps

```ts
import { db, users, trails, blogPosts } from '@duodev/db';

// Buscar todos os usuários
const allUsers = await db.select().from(users);

// Buscar trilhas com os usuários que as iniciaram (usando relações)
const result = await db.query.trails.findMany({
    with: { userTrails: { with: { user: true } } },
});
```

> **Atenção:** o pacote precisa ser compilado (`npm run build -w @duodev/db`) antes de o backend conseguir importá-lo. Em produção, o Dockerfile do backend já executa o build automaticamente.

### Campos de gamificação já previstos

O schema de `users` já contempla parte da base de gamificação:

- `xp`: experiência acumulada do aluno.
- `streak_current`: sequência atual de estudo.
- `streak_best`: melhor sequência registrada.

O backend complementa esses dados com métricas derivadas no perfil autenticado, como:

- nível atual;
- progresso até o próximo nível;
- badges desbloqueados;
- recompensas cosméticas liberadas.

---

## Docker

Todos os serviços são orquestrados via Docker Compose a partir da raiz do projeto.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- Arquivo `.env` na raiz (dev) e `.env.prod` (prod) com as variáveis de ambiente

### Desenvolvimento

| Comando              | Descrição                                |
| -------------------- | ---------------------------------------- |
| `npm run dev`        | Sobe todos os serviços em modo dev       |
| `npm run dev:build`  | Reconstrói as imagens e sobe em modo dev |
| `npm run dev:down`   | Derruba todos os containers              |
| `npm run dev:down:v` | Derruba todos os containers e volumes    |

```bash
# Primeira vez ou após mudanças no Dockerfile / dependências
npm run dev:build

# Uso cotidiano
npm run dev

# Encerrar
npm run dev:down

# Encerrar e deletar volumes
npm run dev:down:v
```

Serviços disponíveis em dev:

| Serviço     | URL                   |
| ----------- | --------------------- |
| frontend    | http://localhost:8020 |
| backend     | http://localhost:8010 |
| admin-front | http://localhost:8021 |
| admin-back  | http://localhost:8011 |
| postgres    | localhost:8030        |

> Em dev, o `docker-compose.override.yaml` é aplicado automaticamente. Ele ativa o stage `dev` de cada Dockerfile (hot-reload) e monta os arquivos locais como volumes, refletindo alterações no código sem necessidade de rebuild.

### Produção

| Comando              | Descrição                                          |
| -------------------- | -------------------------------------------------- |
| `npm run prod`       | Sobe todos os serviços em modo produção (detached) |
| `npm run prod:build` | Reconstrói as imagens e sobe em produção           |
| `npm run prod:down`  | Derruba todos os containers de produção            |

```bash
# Primeira vez ou após mudanças no código
npm run prod:build

# Reiniciar sem rebuild
npm run prod

# Encerrar
npm run prod:down
```

> Em prod, o `docker-compose.prod.yaml` é combinado com o `docker-compose.yaml`. As imagens são construídas completamente até o stage `runner` (sem volumes locais).

### Como funciona o build por ambiente

Cada app tem um Dockerfile multi-stage com 4 estágios:

| Stage     | Usado em        | O que faz                                                    |
| --------- | --------------- | ------------------------------------------------------------ |
| `base`    | ambos           | Instala dependências npm                                     |
| `dev`     | desenvolvimento | Inicia com hot-reload (`nest start --watch` / `vite --host`) |
| `builder` | produção        | Compila o código (`nest build` / `vite build`)               |
| `runner`  | produção        | Imagem final enxuta (Node.js ou Nginx)                       |




#  Guia de Inicialização do Backend

Este documento descreve os passos necessários para configurar o ambiente local e inicializar o servidor do backend com sucesso.

##  Pré-requisitos

Antes de começar, certifique-se de ter instalado em sua máquina:
* [Node.js](https://nodejs.org/)
* [PostgreSQL](https://www.postgresql.org/)

---

##  Configuração do Ambiente (.env)


O backend depende de variáveis de ambiente para se conectar ao banco de dados e ao serviço de e-mail. Siga os passos abaixo para configurar o seu arquivo `.env`.

1. Na raiz do projeto, crie um arquivo chamado `.env` (ou renomeie o `.env.example`).
2. Copie e cole as informações abaixo:


# Configurações do Banco de Dados
DB_HOST=localhost
DB_PORT=5432
DB_USER=seu_usuario_aqui
DB_PASSWORD=sua_senha_aqui
DB_DB=duodev

# Configurações de E-mail (SMTP)
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USER=seu-email@gmail.com
MAIL_PASS=sua_chave_de_app_aqui



## Detalhes das Credenciais 

1. Banco de Dados (PostgreSQL)
Você deve substituir os campos DB_USER e DB_PASSWORD pelos dados que você configurou na instalação local do seu PostgreSQL.

DB_USER: Geralmente o padrão é postgres.

DB_PASSWORD: A senha definida por você ao instalar o banco.

2. Serviço de E-mail (Gmail)
Para que o sistema envie e-mails, siga este processo:

MAIL_USER: Insira o endereço de e-mail que deseja utilizar.

MAIL_PASS (Senha de App): 1. Acesse as configurações da sua conta Google.
2. Ative a Verificação em Duas Etapas.
3. Procure por "Senhas de App" (App Passwords).
4. Gere uma nova senha para o nosso projeto e copie o código de 16 dígitos.
5. Cole esse código no campo MAIL_PASS (não utilize a sua senha comum do e-mail).
