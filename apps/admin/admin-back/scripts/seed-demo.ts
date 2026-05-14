/**
 * Seed de demonstração para o monorepo.
 * Cria:
 * - usuário admin no schema novo (`users`)
 * - usuário final no schema legado (`user`)
 * - múltiplas categorias e trilhas publicadas
 * - aulas, questões e desafios publicados
 * - posts de blog
 * - streak inicial
 * - progresso variado do usuário final
 */
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../../.env') });

import * as bcrypt from 'bcrypt';
import {
    blogPosts,
    categories,
    challenges,
    db,
    lessons,
    legacyUsers,
    questions,
    streakLogs,
    trails,
    userTrails,
    users,
} from '@duodev/db';
import { and, eq, sql } from 'drizzle-orm';

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@duodev.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrador';

const studentEmail = process.env.SEED_USER_EMAIL ?? 'aluno@duodev.com';
const studentPassword = process.env.SEED_USER_PASSWORD ?? 'aluno123';
const studentName = process.env.SEED_USER_NAME ?? 'Aluno Demo';

type LessonSeed = {
    title: string;
    elements: typeof lessons.$inferInsert.elements;
};

type QuestionSeed = Omit<typeof questions.$inferInsert, 'trailId' | 'order' | 'status'>;
type ChallengeSeed = {
    title: string;
    description: string;
    instructions: string;
};

type TrailSeed = {
    name: string;
    level: string;
    description: string;
    duration: string;
    totalHours: number;
    year: number;
    thumbColor: string;
    lessons: LessonSeed[];
    questions: QuestionSeed[];
    challenges: ChallengeSeed[];
};

type CategorySeed = {
    name: string;
    description: string;
    icon: string;
    duration: string;
    totalHours: number;
    thumbColor: string;
    trails: TrailSeed[];
};

const DEMO_CATEGORIES: CategorySeed[] = [
    {
        name: 'Desenvolvimento Web',
        description: 'Base para quem quer aprender front-end e construir interfaces modernas.',
        icon: 'code',
        duration: '6 semanas',
        totalHours: 40,
        thumbColor: '#9eea6c',
        trails: [
            {
                name: 'HTML, CSS e JavaScript',
                level: 'iniciante',
                description: 'Trilha introdutória com aula, quiz e desafio para o aluno testar o fluxo completo.',
                duration: '2 semanas',
                totalHours: 12,
                year: new Date().getFullYear(),
                thumbColor: '#9eea6c',
                lessons: [
                    {
                        title: 'Boas-vindas à trilha',
                        elements: [
                            {
                                id: 'html-js-intro-1',
                                type: 'texto',
                                content: 'HTML estrutura, CSS estiliza e JavaScript traz interatividade para a página. Quando você entende o papel de cada uma dessas tecnologias, fica mais fácil decidir onde criar um título, como aplicar um layout e em que momento adicionar comportamento à interface.',
                                order: 0,
                            },
                            {
                                id: 'html-js-intro-2',
                                type: 'texto',
                                content: 'Essa combinação é a base do desenvolvimento front-end moderno. Em projetos reais, você quase sempre começa pela estrutura semântica em HTML, adiciona clareza visual com CSS e só depois evolui a experiência com JavaScript.',
                                order: 1,
                            },
                            {
                                id: 'html-js-intro-3',
                                type: 'texto',
                                content: 'Ao longo desta trilha, a ideia é sair do conceito solto e enxergar uma sequência prática: montar a página, estilizar com intenção e validar se o comportamento final realmente ajuda quem vai usar a interface.',
                                order: 2,
                            },
                        ],
                    },
                    {
                        title: 'Primeiros elementos HTML',
                        elements: [
                            {
                                id: 'html-basics-1',
                                type: 'texto',
                                content: 'Títulos, parágrafos, links e listas são elementos centrais de qualquer página web. Eles ajudam a organizar a leitura e também comunicam para navegadores e leitores de tela qual é a hierarquia da informação.',
                                order: 0,
                            },
                            {
                                id: 'html-basics-1b',
                                type: 'texto',
                                content: 'Na prática, escolher o elemento certo importa mais do que parece: um botão não deve ser usado como link e um título não deve ser só um texto maior. Semântica correta melhora acessibilidade, SEO e manutenção do código.',
                                order: 1,
                            },
                            {
                                id: 'html-basics-2',
                                type: 'imagem',
                                content: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
                                order: 2,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'Qual tecnologia estrutura a página?',
                        description: 'Escolha a alternativa correta.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'alt-html', text: 'HTML' },
                            { id: 'alt-css', text: 'CSS' },
                            { id: 'alt-js', text: 'JavaScript' },
                        ],
                        answer: 'alt-html',
                    },
                    {
                        title: 'Leia o código e identifique o resultado',
                        description: 'O que esse trecho imprime no console?',
                        questionType: 'code-reading',
                        codeSnippet: "const nome = 'DuoDev';\nconsole.log(nome.toUpperCase());",
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'alt-1', text: 'duodev' },
                            { id: 'alt-2', text: 'DUODEV' },
                            { id: 'alt-3', text: 'undefined' },
                        ],
                        answer: 'alt-2',
                    },
                    {
                        title: 'Complete a frase',
                        description: 'Monte a sintaxe correta do laço.',
                        questionType: 'fill-blank',
                        codeSnippet: null,
                        sentence: '___ (let i = 0; i < 3; i++) { }',
                        blanks: ['for', 'while', 'const'],
                        correctOrder: ['for'],
                        alternatives: [],
                        answer: '',
                    },
                ],
                challenges: [
                    {
                        title: 'Monte sua primeira página',
                        description: 'Crie uma página simples com título, parágrafo e botão.',
                        instructions: 'Use HTML para a estrutura e CSS para destacar o botão.',
                    },
                ],
            },
            {
                name: 'React na Prática',
                level: 'intermediário',
                description: 'Componentes, props, estado e composição de interfaces.',
                duration: '2 semanas',
                totalHours: 14,
                year: new Date().getFullYear(),
                thumbColor: '#85B7EB',
                lessons: [
                    {
                        title: 'Componentes e props',
                        elements: [
                            {
                                id: 'react-1',
                                type: 'texto',
                                content: 'Componentes permitem quebrar interfaces em partes pequenas e reutilizáveis. Em vez de repetir o mesmo HTML várias vezes, você encapsula uma ideia visual e reaproveita essa estrutura com pequenas variações.',
                                order: 0,
                            },
                            {
                                id: 'react-1b',
                                type: 'texto',
                                content: 'Props entram justamente para isso: elas permitem passar dados e configurar comportamento sem duplicar código. Um mesmo card pode mostrar usuários, trilhas ou produtos mudando apenas o conteúdo recebido.',
                                order: 1,
                            },
                        ],
                    },
                    {
                        title: 'Estado e eventos',
                        elements: [
                            {
                                id: 'react-2',
                                type: 'texto',
                                content: 'Hooks como useState permitem gerenciar dados que mudam com interação do usuário. Isso inclui abrir um menu, atualizar um campo de formulário ou trocar o conteúdo exibido depois de um clique.',
                                order: 0,
                            },
                            {
                                id: 'react-2b',
                                type: 'texto',
                                content: 'O ponto importante é perceber a relação entre evento e renderização: o usuário interage, o estado muda e o componente renderiza novamente. Esse ciclo é o coração da maior parte das interfaces feitas com React.',
                                order: 1,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'Qual hook controla estado local?',
                        description: 'Escolha o hook correto.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'react-a', text: 'useState' },
                            { id: 'react-b', text: 'useRouter' },
                            { id: 'react-c', text: 'useServer' },
                        ],
                        answer: 'react-a',
                    },
                    {
                        title: 'Leia o JSX',
                        description: 'O que esse componente renderiza?',
                        questionType: 'code-reading',
                        codeSnippet: "function Ola() {\n  return <h1>Olá, mundo!</h1>\n}",
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'react-x', text: 'Um parágrafo com texto' },
                            { id: 'react-y', text: 'Um h1 com “Olá, mundo!”' },
                            { id: 'react-z', text: 'Nada' },
                        ],
                        answer: 'react-y',
                    },
                ],
                challenges: [
                    {
                        title: 'Card de perfil',
                        description: 'Crie um card simples com nome, bio e botão.',
                        instructions: 'Separe o card em componentes pequenos e use props para os dados.',
                    },
                ],
            },
            {
                name: 'Node.js e APIs REST',
                level: 'intermediário',
                description: 'Criação de APIs, rotas, controllers e integração com banco.',
                duration: '2 semanas',
                totalHours: 16,
                year: new Date().getFullYear(),
                thumbColor: '#97C459',
                lessons: [
                    {
                        title: 'Rotas e controllers',
                        elements: [
                            {
                                id: 'node-1',
                                type: 'texto',
                                content: 'Uma API REST organiza entrada e saída por rotas e handlers bem definidos. Cada endpoint deve ter uma responsabilidade clara, receber dados previsíveis e devolver respostas consistentes.',
                                order: 0,
                            },
                            {
                                id: 'node-1b',
                                type: 'texto',
                                content: 'Separar rotas, controllers e serviços ajuda a manter a API legível. A rota define o caminho, o controller trata a requisição e o serviço concentra a regra de negócio, o que deixa testes e manutenção muito mais simples.',
                                order: 1,
                            },
                        ],
                    },
                    {
                        title: 'Persistindo dados',
                        elements: [
                            {
                                id: 'node-2',
                                type: 'texto',
                                content: 'Depois de validar a entrada, a API pode persistir dados num banco relacional. Esse passo exige cuidado com tipos, relacionamentos e mensagens de erro para não gravar informação inconsistente.',
                                order: 0,
                            },
                            {
                                id: 'node-2b',
                                type: 'texto',
                                content: 'Também é importante pensar no retorno da operação: depois de criar ou atualizar um recurso, a API deve responder com dados úteis para o frontend, evitando consultas desnecessárias logo em seguida.',
                                order: 1,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'Qual verbo HTTP costuma criar recurso?',
                        description: 'Escolha o verbo mais adequado.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'node-post', text: 'POST' },
                            { id: 'node-get', text: 'GET' },
                            { id: 'node-trace', text: 'TRACE' },
                        ],
                        answer: 'node-post',
                    },
                ],
                challenges: [
                    {
                        title: 'API de tarefas',
                        description: 'Modele uma API simples de tarefas com CRUD básico.',
                        instructions: 'Liste endpoints, payloads e respostas esperadas antes de implementar.',
                    },
                ],
            },
        ],
    },
    {
        name: 'Python e Dados',
        description: 'Lógica, automação e leitura de dados com Python.',
        icon: 'database',
        duration: '5 semanas',
        totalHours: 32,
        thumbColor: '#FAC775',
        trails: [
            {
                name: 'Python para Automação',
                level: 'iniciante',
                description: 'Automatize tarefas repetitivas com scripts simples.',
                duration: '10 dias',
                totalHours: 10,
                year: new Date().getFullYear(),
                thumbColor: '#FAC775',
                lessons: [
                    {
                        title: 'Variáveis e arquivos',
                        elements: [
                            {
                                id: 'python-1',
                                type: 'texto',
                                content: 'Scripts de automação normalmente leem arquivos, processam texto e gravam saídas. Em muitos casos, o ganho vem justamente de tirar uma tarefa repetitiva da mão humana e transformar em um fluxo executável em segundos.',
                                order: 0,
                            },
                            {
                                id: 'python-1b',
                                type: 'texto',
                                content: 'Antes de automatizar, vale mapear bem a entrada e a saída esperada. Saber quais arquivos serão lidos, como os dados chegam e o que precisa ser salvo reduz muito o risco de criar scripts frágeis.',
                                order: 1,
                            },
                        ],
                    },
                    {
                        title: 'Loops úteis',
                        elements: [
                            {
                                id: 'python-2',
                                type: 'texto',
                                content: 'Laços ajudam a iterar sobre listas de arquivos, linhas ou registros. Eles aparecem o tempo todo em automação porque quase sempre existe uma coleção de itens que precisa ser tratada da mesma forma.',
                                order: 0,
                            },
                            {
                                id: 'python-2b',
                                type: 'texto',
                                content: 'O cuidado principal aqui é manter o corpo do loop claro e previsível: ler, transformar, registrar erro quando necessário e seguir. Quando esse padrão está bem definido, o script fica mais fácil de confiar.',
                                order: 1,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'Qual função abre um arquivo em Python?',
                        description: 'Escolha a alternativa correta.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'py-a', text: 'open()' },
                            { id: 'py-b', text: 'file()' },
                            { id: 'py-c', text: 'read()' },
                        ],
                        answer: 'py-a',
                    },
                ],
                challenges: [
                    {
                        title: 'Renomeador de arquivos',
                        description: 'Monte um script para renomear arquivos em lote.',
                        instructions: 'Defina a entrada, a regra de renomeação e trate erros de arquivos ausentes.',
                    },
                ],
            },
            {
                name: 'Fundamentos de SQL',
                level: 'iniciante',
                description: 'Consultas básicas, filtros, ordenação e joins.',
                duration: '8 dias',
                totalHours: 8,
                year: new Date().getFullYear(),
                thumbColor: '#BA7517',
                lessons: [
                    {
                        title: 'SELECT e WHERE',
                        elements: [
                            {
                                id: 'sql-1',
                                type: 'texto',
                                content: 'SELECT escolhe colunas e WHERE filtra linhas com base em critérios. Juntas, essas duas cláusulas já resolvem grande parte das consultas que você faz no dia a dia.',
                                order: 0,
                            },
                            {
                                id: 'sql-1b',
                                type: 'texto',
                                content: 'Uma boa consulta começa entendendo a pergunta de negócio: quais dados você quer enxergar e quais registros devem ficar de fora. Quando isso fica claro, escrever a query deixa de ser um chute e vira tradução de regra.',
                                order: 1,
                            },
                        ],
                    },
                    {
                        title: 'JOINs na prática',
                        elements: [
                            {
                                id: 'sql-2',
                                type: 'texto',
                                content: 'JOIN conecta tabelas relacionadas e amplia a visão dos dados. Em vez de consultar informações isoladas, você passa a cruzar entidades como clientes, pedidos, produtos e pagamentos.',
                                order: 0,
                            },
                            {
                                id: 'sql-2b',
                                type: 'texto',
                                content: 'O segredo é entender a chave que relaciona as tabelas. Quando o vínculo entre elas está claro, o JOIN deixa de ser uma mágica confusa e vira um passo natural para montar relatórios e dashboards.',
                                order: 1,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'Qual cláusula filtra resultados?',
                        description: 'Escolha a alternativa correta.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'sql-a', text: 'WHERE' },
                            { id: 'sql-b', text: 'ORDER BY' },
                            { id: 'sql-c', text: 'GROUP' },
                        ],
                        answer: 'sql-a',
                    },
                ],
                challenges: [
                    {
                        title: 'Consulta de relatórios',
                        description: 'Escreva uma consulta que liste pedidos e clientes.',
                        instructions: 'Use JOIN e ordene o resultado pela data mais recente.',
                    },
                ],
            },
        ],
    },
    {
        name: 'Infra e Deploy',
        description: 'Contêineres, deploy e fundamentos de entrega contínua.',
        icon: 'server',
        duration: '4 semanas',
        totalHours: 24,
        thumbColor: '#ED93B1',
        trails: [
            {
                name: 'Docker Essencial',
                level: 'iniciante',
                description: 'Entenda imagens, contêineres, volumes e compose.',
                duration: '7 dias',
                totalHours: 9,
                year: new Date().getFullYear(),
                thumbColor: '#85B7EB',
                lessons: [
                    {
                        title: 'Imagens e contêineres',
                        elements: [
                            {
                                id: 'docker-1',
                                type: 'texto',
                                content: 'Imagens são moldes imutáveis; contêineres são instâncias em execução dessas imagens. Pensar assim ajuda a entender por que o mesmo projeto pode subir de forma parecida em máquinas diferentes.',
                                order: 0,
                            },
                            {
                                id: 'docker-1b',
                                type: 'texto',
                                content: 'Na prática, a imagem descreve o ambiente e o contêiner vive o ciclo de execução. Quando algo quebra, essa separação facilita reconstruir o serviço sem ter que reconfigurar tudo manualmente.',
                                order: 1,
                            },
                        ],
                    },
                    {
                        title: 'Compose e orquestração local',
                        elements: [
                            {
                                id: 'docker-2',
                                type: 'texto',
                                content: 'Docker Compose facilita subir múltiplos serviços juntos no ambiente de desenvolvimento. Isso evita depender de comandos soltos e reduz a diferença entre a máquina de cada pessoa da equipe.',
                                order: 0,
                            },
                            {
                                id: 'docker-2b',
                                type: 'texto',
                                content: 'Quando você descreve app, banco e dependências em um único arquivo, o onboarding fica mais rápido e o projeto tende a ser mais previsível. Esse ganho de consistência é um dos maiores motivos para usar Compose no dia a dia.',
                                order: 1,
                            },
                        ],
                    },
                ],
                questions: [
                    {
                        title: 'O que o Docker Compose facilita?',
                        description: 'Escolha a alternativa correta.',
                        questionType: 'multiple-choice',
                        codeSnippet: null,
                        sentence: null,
                        blanks: [],
                        correctOrder: [],
                        alternatives: [
                            { id: 'dock-a', text: 'Subir vários serviços juntos' },
                            { id: 'dock-b', text: 'Editar imagens em tempo real' },
                            { id: 'dock-c', text: 'Substituir banco de dados' },
                        ],
                        answer: 'dock-a',
                    },
                ],
                challenges: [
                    {
                        title: 'Suba app + banco',
                        description: 'Escreva um compose mínimo com app e Postgres.',
                        instructions: 'Defina volumes, rede e variáveis de ambiente principais.',
                    },
                ],
            },
        ],
    },
];

const BLOG_SEEDS = [
    {
        tag: 'Back-end',
        title: 'Como manter consistência estudando programação',
        description: 'Estruture sessões curtas, registre streaks e evolua uma trilha por vez.',
        thumbColor: '#9eea6c',
    },
    {
        tag: 'Segurança',
        title: 'Boas práticas básicas de autenticação',
        description: 'Proteja senhas, tokens e valide entradas desde o começo do projeto.',
        thumbColor: '#85B7EB',
    },
    {
        tag: 'Mobile',
        title: 'Como estudar por trilhas sem se perder',
        description: 'Organize módulos por objetivo e evite alternar contexto cedo demais.',
        thumbColor: '#ED93B1',
    },
];

async function upsertAdmin() {
    const hash = await bcrypt.hash(adminPassword, 10);
    const [existing] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existing) {
        const [updated] = await db
            .update(users)
            .set({ name: adminName, password: hash, role: 'admin', updatedAt: new Date() })
            .where(eq(users.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(users)
        .values({ name: adminName, email: adminEmail, password: hash, role: 'admin' })
        .returning();

    return created;
}

async function upsertStudent() {
    const hash = await bcrypt.hash(studentPassword, 10);
    const [existing] = await db.select().from(legacyUsers).where(eq(legacyUsers.email, studentEmail)).limit(1);

    if (existing) {
        const [updated] = await db
            .update(legacyUsers)
            .set({
                name: studentName,
                password: hash,
                language: 'javascript',
                interests: 'frontend,backend,sql',
                interestReason: 'Conseguir uma vaga como dev full stack',
                onboardingCompleted: true,
                updatedAt: new Date(),
            })
            .where(eq(legacyUsers.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(legacyUsers)
        .values({
            name: studentName,
            email: studentEmail,
            password: hash,
            language: 'javascript',
            interests: 'frontend,backend,sql',
            interestReason: 'Conseguir uma vaga como dev full stack',
            onboardingCompleted: true,
        })
        .returning();

    return created;
}

async function upsertCategory(seed: CategorySeed) {
    const [existing] = await db.select().from(categories).where(eq(categories.name, seed.name)).limit(1);

    if (existing) {
        const [updated] = await db
            .update(categories)
            .set({
                description: seed.description,
                icon: seed.icon,
                duration: seed.duration,
                totalHours: seed.totalHours,
                thumbColor: seed.thumbColor,
                status: 'publicado',
                updatedAt: new Date(),
            })
            .where(eq(categories.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(categories)
        .values({
            name: seed.name,
            description: seed.description,
            icon: seed.icon,
            duration: seed.duration,
            totalHours: seed.totalHours,
            thumbColor: seed.thumbColor,
            status: 'publicado',
        })
        .returning();

    return created;
}

async function upsertTrail(categoryId: string, seed: TrailSeed) {
    const [existing] = await db
        .select()
        .from(trails)
        .where(and(eq(trails.categoryId, categoryId), eq(trails.name, seed.name)))
        .limit(1);

    if (existing) {
        const [updated] = await db
            .update(trails)
            .set({
                level: seed.level,
                description: seed.description,
                duration: seed.duration,
                totalHours: seed.totalHours,
                year: seed.year,
                thumbColor: seed.thumbColor,
                status: 'publicado',
                updatedAt: new Date(),
            })
            .where(eq(trails.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(trails)
        .values({
            categoryId,
            name: seed.name,
            level: seed.level,
            description: seed.description,
            duration: seed.duration,
            totalHours: seed.totalHours,
            year: seed.year,
            thumbColor: seed.thumbColor,
            status: 'publicado',
        })
        .returning();

    return created;
}

async function upsertLesson(trailId: string, order: number, lesson: LessonSeed) {
    const [existing] = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(lessons)
            .set({ title: lesson.title, elements: lesson.elements, status: 'publicado', updatedAt: new Date() })
            .where(eq(lessons.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(lessons)
        .values({ trailId, order, title: lesson.title, elements: lesson.elements, status: 'publicado' })
        .returning();

    return created.id;
}

async function upsertQuestion(trailId: string, order: number, question: QuestionSeed) {
    const [existing] = await db
        .select()
        .from(questions)
        .where(and(eq(questions.trailId, trailId), eq(questions.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(questions)
            .set({ ...question, status: 'publicado', updatedAt: new Date() })
            .where(eq(questions.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(questions)
        .values({ trailId, order, ...question, status: 'publicado' })
        .returning();

    return created.id;
}

async function upsertChallenge(trailId: string, order: number, challenge: ChallengeSeed) {
    const [existing] = await db
        .select()
        .from(challenges)
        .where(and(eq(challenges.trailId, trailId), eq(challenges.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(challenges)
            .set({
                title: challenge.title,
                description: challenge.description,
                instructions: challenge.instructions,
                status: 'publicado',
                updatedAt: new Date(),
            })
            .where(eq(challenges.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(challenges)
        .values({
            trailId,
            order,
            title: challenge.title,
            description: challenge.description,
            instructions: challenge.instructions,
            status: 'publicado',
        })
        .returning();

    return created.id;
}

async function upsertBlogPost(authorId: string, seed: (typeof BLOG_SEEDS)[number]) {
    const [existing] = await db.select().from(blogPosts).where(eq(blogPosts.title, seed.title)).limit(1);

    if (existing) {
        await db
            .update(blogPosts)
            .set({
                authorId,
                tag: seed.tag,
                description: seed.description,
                thumbColor: seed.thumbColor,
                publishedAt: new Date(),
            })
            .where(eq(blogPosts.id, existing.id));
        return;
    }

    await db.insert(blogPosts).values({
        authorId,
        tag: seed.tag,
        title: seed.title,
        description: seed.description,
        thumbColor: seed.thumbColor,
        publishedAt: new Date(),
    });
}

async function upsertStreakLog(userId: string, logDate: string, completed: boolean) {
    const [existing] = await db
        .select()
        .from(streakLogs)
        .where(and(eq(streakLogs.userId, userId), eq(streakLogs.logDate, logDate)))
        .limit(1);

    if (existing) {
        await db.update(streakLogs).set({ completed }).where(eq(streakLogs.id, existing.id));
        return;
    }

    await db.insert(streakLogs).values({ userId, logDate, completed });
}

async function supportsExtendedProgress() {
    const result = await db.execute(sql`
        select column_name
        from information_schema.columns
        where table_schema = 'public'
          and table_name = 'user_trail'
          and column_name in ('completed_item_ids', 'correct_answers', 'incorrect_answers')
    `);

    const columns = new Set(result.rows.map((row) => String(row.column_name)));
    return (
        columns.has('completed_item_ids') &&
        columns.has('correct_answers') &&
        columns.has('incorrect_answers')
    );
}

async function upsertProgress(userId: string, trailId: string, progressPct: number, completedItemIds: string[] = []) {
    const extended = await supportsExtendedProgress();

    if (extended) {
        const [existing] = await db
            .select()
            .from(userTrails)
            .where(and(eq(userTrails.userId, userId), eq(userTrails.trailId, trailId)))
            .limit(1);

        if (existing) {
            await db
                .update(userTrails)
                .set({
                    progressPct,
                    completedItemIds,
                    correctAnswers: Math.max(1, Math.round(progressPct / 15)),
                    incorrectAnswers: progressPct >= 100 ? 0 : Math.max(0, Math.round(progressPct / 35)),
                    updatedAt: new Date(),
                })
                .where(eq(userTrails.id, existing.id));
            return;
        }

        await db.insert(userTrails).values({
            userId,
            trailId,
            progressPct,
            completedItemIds,
            correctAnswers: Math.max(1, Math.round(progressPct / 15)),
            incorrectAnswers: progressPct >= 100 ? 0 : Math.max(0, Math.round(progressPct / 35)),
        });
        return;
    }

    const existing = await db.execute(sql`
        select "id"
        from "user_trail"
        where "idUsuario" = ${userId} and "idTrilha" = ${trailId}
        limit 1
    `);

    if (existing.rows.length > 0) {
        await db.execute(sql`
            update "user_trail"
            set "progressoPct" = ${progressPct}, "atualizadoEm" = now()
            where "id" = ${String(existing.rows[0].id)}
        `);
        return;
    }

    await db.execute(sql`
        insert into "user_trail" ("id", "idUsuario", "idTrilha", "progressoPct", "iniciadoEm", "atualizadoEm")
        values (gen_random_uuid(), ${userId}, ${trailId}, ${progressPct}, now(), now())
    `);
}

async function run() {
    console.log('🌱 Seed demo: iniciando...');

    await upsertAdmin();
    const student = await upsertStudent();

    const trailProgress = new Map<string, { progressPct: number; completedItemIds: string[] }>();
    let trailIndex = 0;

    for (const categorySeed of DEMO_CATEGORIES) {
        const category = await upsertCategory(categorySeed);

        for (const trailSeed of categorySeed.trails) {
            const trail = await upsertTrail(category.id, trailSeed);
            const completedItemIds: string[] = [];

            for (const [index, lesson] of trailSeed.lessons.entries()) {
                const id = await upsertLesson(trail.id, index, lesson);
                completedItemIds.push(id);
            }

            for (const [index, question] of trailSeed.questions.entries()) {
                const id = await upsertQuestion(trail.id, trailSeed.lessons.length + index, question);
                completedItemIds.push(id);
            }

            for (const [index, challenge] of trailSeed.challenges.entries()) {
                const id = await upsertChallenge(
                    trail.id,
                    trailSeed.lessons.length + trailSeed.questions.length + index,
                    challenge,
                );
                completedItemIds.push(id);
            }

            if (trailIndex === 0) {
                trailProgress.set(trail.id, { progressPct: 100, completedItemIds });
            } else if (trailIndex === 1) {
                trailProgress.set(trail.id, {
                    progressPct: 67,
                    completedItemIds: completedItemIds.slice(0, Math.max(2, Math.ceil(completedItemIds.length * 0.67))),
                });
            } else if (trailIndex === 2) {
                trailProgress.set(trail.id, {
                    progressPct: 34,
                    completedItemIds: completedItemIds.slice(0, 1),
                });
            } else if (trailIndex === 3) {
                trailProgress.set(trail.id, {
                    progressPct: 0,
                    completedItemIds: [],
                });
            }

            trailIndex += 1;
        }
    }

    for (const seed of BLOG_SEEDS) {
        await upsertBlogPost(student.id, seed);
    }

    const today = new Date();
    const yesterday = new Date(today);
    const twoDaysAgo = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    twoDaysAgo.setDate(today.getDate() - 2);

    await upsertStreakLog(student.id, twoDaysAgo.toISOString().split('T')[0], true);
    await upsertStreakLog(student.id, yesterday.toISOString().split('T')[0], true);
    await upsertStreakLog(student.id, today.toISOString().split('T')[0], true);

    for (const [trailId, state] of trailProgress.entries()) {
        await upsertProgress(student.id, trailId, state.progressPct, state.completedItemIds);
    }

    console.log('✓ Seed demo concluído.');
    console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`  User:  ${studentEmail} / ${studentPassword}`);
    console.log(`  Trilhas criadas: ${trailIndex}`);
}

run().catch((error) => {
    console.error('Erro ao executar seed demo:', error);
    process.exit(1);
});
