/**
 * Seed de demonstração para o monorepo.
 * Cria:
 * - usuário admin no schema novo (`users`)
 * - usuário final no schema legado (`user`)
 * - categoria/trilha publicadas
 * - aulas, questões e desafio publicados
 * - um post de blog
 * - streak inicial
 * - progresso inicial do usuário na trilha
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
import { and, eq } from 'drizzle-orm';

const adminEmail = process.env.SEED_ADMIN_EMAIL ?? 'admin@duodev.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
const adminName = process.env.SEED_ADMIN_NAME ?? 'Administrador';

const studentEmail = process.env.SEED_USER_EMAIL ?? 'aluno@duodev.com';
const studentPassword = process.env.SEED_USER_PASSWORD ?? 'aluno123';
const studentName = process.env.SEED_USER_NAME ?? 'Aluno Demo';

async function upsertAdmin() {
    const hash = await bcrypt.hash(adminPassword, 10);
    const [existing] = await db.select().from(users).where(eq(users.email, adminEmail)).limit(1);

    if (existing) {
        const [updated] = await db
            .update(users)
            .set({
                name: adminName,
                password: hash,
                role: 'admin',
                updatedAt: new Date(),
            })
            .where(eq(users.id, existing.id))
            .returning();
        return updated;
    }

    const [created] = await db
        .insert(users)
        .values({
            name: adminName,
            email: adminEmail,
            password: hash,
            role: 'admin',
        })
        .returning();

    return created;
}

async function upsertStudent() {
    const hash = await bcrypt.hash(studentPassword, 10);
    const [existing] = await db
        .select()
        .from(legacyUsers)
        .where(eq(legacyUsers.email, studentEmail))
        .limit(1);

    if (existing) {
        const [updated] = await db
            .update(legacyUsers)
            .set({
                name: studentName,
                password: hash,
                language: 'javascript',
                interests: 'frontend,backend',
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
            interests: 'frontend,backend',
            interestReason: 'Conseguir uma vaga como dev full stack',
            onboardingCompleted: true,
        })
        .returning();

    return created;
}

async function upsertCategory() {
    const [existing] = await db.select().from(categories).where(eq(categories.name, 'Desenvolvimento Web')).limit(1);

    if (existing) {
        const [updated] = await db
            .update(categories)
            .set({
                description: 'Base para quem quer aprender front-end e lógica web.',
                icon: 'code',
                duration: '4 semanas',
                totalHours: 24,
                thumbColor: '#9eea6c',
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
            name: 'Desenvolvimento Web',
            description: 'Base para quem quer aprender front-end e lógica web.',
            icon: 'code',
            duration: '4 semanas',
            totalHours: 24,
            thumbColor: '#9eea6c',
            status: 'publicado',
        })
        .returning();

    return created;
}

async function upsertTrail(categoryId: string) {
    const [existing] = await db
        .select()
        .from(trails)
        .where(and(eq(trails.categoryId, categoryId), eq(trails.name, 'HTML, CSS e JavaScript')))
        .limit(1);

    if (existing) {
        const [updated] = await db
            .update(trails)
            .set({
                level: 'iniciante',
                description: 'Trilha introdutória com aula, quiz e desafio para o aluno testar o fluxo completo.',
                duration: '2 semanas',
                totalHours: 12,
                year: new Date().getFullYear(),
                thumbColor: '#9eea6c',
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
            name: 'HTML, CSS e JavaScript',
            level: 'iniciante',
            description: 'Trilha introdutória com aula, quiz e desafio para o aluno testar o fluxo completo.',
            duration: '2 semanas',
            totalHours: 12,
            year: new Date().getFullYear(),
            thumbColor: '#9eea6c',
            status: 'publicado',
        })
        .returning();

    return created;
}

async function upsertLesson(trailId: string, order: number, title: string, elements: typeof lessons.$inferInsert.elements) {
    const [existing] = await db
        .select()
        .from(lessons)
        .where(and(eq(lessons.trailId, trailId), eq(lessons.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(lessons)
            .set({ title, elements, status: 'publicado', updatedAt: new Date() })
            .where(eq(lessons.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(lessons)
        .values({ trailId, order, title, elements, status: 'publicado' })
        .returning();

    return created.id;
}

async function upsertQuestion(
    trailId: string,
    order: number,
    data: Omit<typeof questions.$inferInsert, 'trailId' | 'order' | 'status'>,
) {
    const [existing] = await db
        .select()
        .from(questions)
        .where(and(eq(questions.trailId, trailId), eq(questions.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(questions)
            .set({ ...data, status: 'publicado', updatedAt: new Date() })
            .where(eq(questions.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(questions)
        .values({ trailId, order, ...data, status: 'publicado' })
        .returning();

    return created.id;
}

async function upsertChallenge(trailId: string, order: number, title: string, description: string, instructions: string) {
    const [existing] = await db
        .select()
        .from(challenges)
        .where(and(eq(challenges.trailId, trailId), eq(challenges.order, order)))
        .limit(1);

    if (existing) {
        await db
            .update(challenges)
            .set({ title, description, instructions, status: 'publicado', updatedAt: new Date() })
            .where(eq(challenges.id, existing.id));
        return existing.id;
    }

    const [created] = await db
        .insert(challenges)
        .values({ trailId, order, title, description, instructions, status: 'publicado' })
        .returning();

    return created.id;
}

async function upsertBlogPost(authorId: string) {
    const [existing] = await db
        .select()
        .from(blogPosts)
        .where(eq(blogPosts.title, 'Como manter consistência estudando programação'))
        .limit(1);

    if (existing) {
        await db
            .update(blogPosts)
            .set({
                authorId,
                tag: 'Back-end',
                description: 'Estruture sessões curtas, registre streaks e evolua uma trilha por vez.',
                thumbColor: '#9eea6c',
                publishedAt: new Date(),
            })
            .where(eq(blogPosts.id, existing.id));
        return;
    }

    await db.insert(blogPosts).values({
        authorId,
        tag: 'Back-end',
        title: 'Como manter consistência estudando programação',
        description: 'Estruture sessões curtas, registre streaks e evolua uma trilha por vez.',
        thumbColor: '#9eea6c',
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
        await db
            .update(streakLogs)
            .set({ completed })
            .where(eq(streakLogs.id, existing.id));
        return;
    }

    await db.insert(streakLogs).values({ userId, logDate, completed });
}

async function upsertProgress(userId: string, trailId: string, completedItemIds: string[]) {
    const [existing] = await db
        .select()
        .from(userTrails)
        .where(and(eq(userTrails.userId, userId), eq(userTrails.trailId, trailId)))
        .limit(1);

    const progressPct = 40;

    if (existing) {
        await db
            .update(userTrails)
            .set({
                progressPct,
                completedItemIds,
                correctAnswers: 1,
                incorrectAnswers: 0,
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
        correctAnswers: 1,
        incorrectAnswers: 0,
    });
}

async function run() {
    console.log('🌱 Seed demo: iniciando...');

    const admin = await upsertAdmin();
    const student = await upsertStudent();
    const category = await upsertCategory();
    const trail = await upsertTrail(category.id);

    const lessonOneId = await upsertLesson(trail.id, 0, 'Boas-vindas à trilha', [
        {
            id: 'lesson-1-text-1',
            type: 'texto',
            content: 'Nesta aula você vai entender a estrutura básica de uma página web e o papel de HTML, CSS e JavaScript.',
            order: 0,
        },
        {
            id: 'lesson-1-text-2',
            type: 'texto',
            content: 'HTML estrutura, CSS estiliza e JavaScript dá interatividade. Esse trio forma a base do front-end.',
            order: 1,
        },
    ]);

    await upsertLesson(trail.id, 1, 'Primeiros elementos HTML', [
        {
            id: 'lesson-2-text-1',
            type: 'texto',
            content: 'Os elementos mais comuns de uma página são títulos, parágrafos, links, listas e botões.',
            order: 0,
        },
        {
            id: 'lesson-2-img-1',
            type: 'imagem',
            content: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=1200&q=80',
            order: 1,
        },
    ]);

    await upsertQuestion(trail.id, 2, {
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
    });

    await upsertQuestion(trail.id, 3, {
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
    });

    await upsertQuestion(trail.id, 4, {
        title: 'Complete a frase',
        description: 'Monte a sintaxe correta do laço.',
        questionType: 'fill-blank',
        codeSnippet: null,
        sentence: '___ (let i = 0; i < 3; i++) { }',
        blanks: ['for', 'while', 'const'],
        correctOrder: ['for'],
        alternatives: [],
        answer: '',
    });

    await upsertChallenge(
        trail.id,
        5,
        'Monte sua primeira página',
        'Crie uma página simples com título, parágrafo e botão.',
        'Use HTML para a estrutura e CSS para destacar o botão. Depois compare com o que aprendeu na trilha.',
    );

    await upsertBlogPost(student.id);

    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(today.getDate() - 1);
    const todayIso = today.toISOString().split('T')[0];
    const yesterdayIso = yesterday.toISOString().split('T')[0];

    await upsertStreakLog(student.id, yesterdayIso, true);
    await upsertStreakLog(student.id, todayIso, true);
    await upsertProgress(student.id, trail.id, [lessonOneId]);

    console.log('✓ Seed demo concluído.');
    console.log(`  Admin: ${adminEmail} / ${adminPassword}`);
    console.log(`  User:  ${studentEmail} / ${studentPassword}`);
}

run().catch((error) => {
    console.error('Erro ao executar seed demo:', error);
    process.exit(1);
});
