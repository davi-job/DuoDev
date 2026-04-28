# Duodev

## Sobre o Projeto

O Duodev é uma plataforma web responsiva projetada para atuar como uma ferramenta centralizada de aprendizado sobre programação, voltada para estudantes e universitários. O sistema consolida trilhas de estudo, gamificação e oferece um painel administrativo seguro para a curadoria de conteúdo.

## Principais Funcionalidades

- **Trilhas de Aprendizado:** O sistema lista e detalha trilhas de conhecimento, exibindo o progresso individual de conclusão do usuário.
- **Quizzes e Gamificação:** Interface interativa de perguntas com feedback instantâneo, onde o usuário acumula pontos de experiência (XP) e participa de um ranking.
- **Gestão de Conteúdo (Admin):** Painel administrativo com controle de acesso para realizar o CRUD (Criar, Ler, Atualizar, Deletar) de trilhas, categorias e aulas.
- **Interação do Usuário:** Funcionalidade que permite aos usuários logados avaliar o conteúdo com notas (estrelas) e deixar comentários.
- **Calendário de Boots:** Interface para que o usuário navegue e visualize os dias em que assistiu aos cursos.
- **Segurança e Autenticação:** Sistema de login e cadastro com senhas armazenadas com hash forte, além de proteção em formulários utilizando o Cloudflare Turnstile.

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

## Docker

Todos os serviços são orquestrados via Docker Compose a partir da raiz do projeto.

### Pré-requisitos

- [Docker](https://docs.docker.com/get-docker/) instalado
- Arquivo `.env` na raiz (dev) e `.env.prod` (prod) com as variáveis de ambiente

### Desenvolvimento

| Comando             | Descrição                                |
| ------------------- | ---------------------------------------- |
| `npm run dev`       | Sobe todos os serviços em modo dev       |
| `npm run dev:build` | Reconstrói as imagens e sobe em modo dev |
| `npm run dev:down`  | Derruba todos os containers              |

```bash
# Primeira vez ou após mudanças no Dockerfile / dependências
npm run dev:build

# Uso cotidiano
npm run dev

# Encerrar
npm run dev:down
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
