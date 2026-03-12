# Duodev

## Sobre o Projeto
O Duodev é uma plataforma web responsiva projetada para atuar como uma ferramenta centralizada de aprendizado sobre programação, voltada para estudantes e universitários. O sistema consolida trilhas de estudo, gamificação e oferece um painel administrativo seguro para a curadoria de conteúdo. 

## Principais Funcionalidades
* **Trilhas de Aprendizado:** O sistema lista e detalha trilhas de conhecimento, exibindo o progresso individual de conclusão do usuário.
* **Quizzes e Gamificação:** Interface interativa de perguntas com feedback instantâneo, onde o usuário acumula pontos de experiência (XP) e participa de um ranking.
* **Gestão de Conteúdo (Admin):** Painel administrativo com controle de acesso para realizar o CRUD (Criar, Ler, Atualizar, Deletar) de trilhas, categorias e aulas.
* **Interação do Usuário:** Funcionalidade que permite aos usuários logados avaliar o conteúdo com notas (estrelas) e deixar comentários.
* **Calendário de Boots:** Interface para que o usuário navegue e visualize os dias em que assistiu aos cursos.
* **Segurança e Autenticação:** Sistema de login e cadastro com senhas armazenadas com hash forte, além de proteção em formulários utilizando o Cloudflare Turnstile.

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
* **Frontend:** React 19, Typescript, Tailwind CSS V4, Tanstack Router e React Hook Form.
* **Backend:** NestJS para a comunicação entre front e back.
* **Banco de Dados:** PostgreSQL hospedado em infraestrutura conteinerizada com Docker.
* **ORM e Gestão de Dados:** Drizzle ORM (Pacote local).
* **Controle de Versão:** Git.

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
* O código-fonte deve seguir os padrões de codificação PSR-12 e conter comentários claros para manutenção futura.
* O sistema implementa HTTPS (SSL/TLS) para todas as comunicações entre o cliente e o servidor.