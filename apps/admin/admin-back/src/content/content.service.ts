import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq } from 'drizzle-orm';
import { lessons, questions, challenges } from '@duodev/db';
import type { DB } from '@duodev/db';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';

@Injectable()
export class ContentService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findAllByTrail(trailId: string) {
        const [lessonRows, questionRows, challengeRows] = await Promise.all([
            this.db.select().from(lessons).where(eq(lessons.trailId, trailId)),
            this.db.select().from(questions).where(eq(questions.trailId, trailId)),
            this.db.select().from(challenges).where(eq(challenges.trailId, trailId)),
        ]);

        const all = [
            ...lessonRows.map((r) => ({ ...r, type: 'aula' as const })),
            ...questionRows.map((r) => ({ ...r, type: 'questao' as const })),
            ...challengeRows.map((r) => ({ ...r, type: 'desafio' as const })),
        ];

        return all.sort((a, b) => a.order - b.order);
    }

    // ── Lessons ──────────────────────────────────────────────────────────────

    async createLesson(dto: CreateLessonDto) {
        const [row] = await this.db
            .insert(lessons)
            .values({
                trailId: dto.trailId,
                order: dto.order,
                title: dto.title,
                elements: dto.elements,
                status: dto.status ?? 'rascunho',
            })
            .returning();
        return row;
    }

    async updateLesson(id: string, dto: UpdateLessonDto) {
        await this.findLesson(id);
        const [row] = await this.db
            .update(lessons)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(lessons.id, id))
            .returning();
        return row;
    }

    async removeLesson(id: string) {
        await this.findLesson(id);
        await this.db.delete(lessons).where(eq(lessons.id, id));
    }

    private async findLesson(id: string) {
        const [row] = await this.db.select().from(lessons).where(eq(lessons.id, id)).limit(1);
        if (!row) throw new NotFoundException(`Aula ${id} não encontrada`);
        return row;
    }

    // ── Questions ────────────────────────────────────────────────────────────

    async createQuestion(dto: CreateQuestionDto) {
        const [row] = await this.db
            .insert(questions)
            .values({
                trailId: dto.trailId,
                order: dto.order,
                title: dto.title,
                description: dto.description,
                questionType: dto.questionType,
                codeSnippet: dto.codeSnippet,
                sentence: dto.sentence,
                blanks: dto.blanks ?? [],
                correctOrder: dto.correctOrder ?? [],
                alternatives: dto.alternatives ?? [],
                answer: dto.answer ?? '',
                status: dto.status ?? 'rascunho',
            })
            .returning();
        return row;
    }

    async updateQuestion(id: string, dto: UpdateQuestionDto) {
        await this.findQuestion(id);
        const [row] = await this.db
            .update(questions)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(questions.id, id))
            .returning();
        return row;
    }

    async removeQuestion(id: string) {
        await this.findQuestion(id);
        await this.db.delete(questions).where(eq(questions.id, id));
    }

    private async findQuestion(id: string) {
        const [row] = await this.db.select().from(questions).where(eq(questions.id, id)).limit(1);
        if (!row) throw new NotFoundException(`Questão ${id} não encontrada`);
        return row;
    }

    // ── Challenges ───────────────────────────────────────────────────────────

    async createChallenge(dto: CreateChallengeDto) {
        const [row] = await this.db
            .insert(challenges)
            .values({
                trailId: dto.trailId,
                order: dto.order,
                title: dto.title,
                description: dto.description,
                instructions: dto.instructions,
                status: dto.status ?? 'rascunho',
            })
            .returning();
        return row;
    }

    async updateChallenge(id: string, dto: UpdateChallengeDto) {
        await this.findChallenge(id);
        const [row] = await this.db
            .update(challenges)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(challenges.id, id))
            .returning();
        return row;
    }

    async removeChallenge(id: string) {
        await this.findChallenge(id);
        await this.db.delete(challenges).where(eq(challenges.id, id));
    }

    private async findChallenge(id: string) {
        const [row] = await this.db.select().from(challenges).where(eq(challenges.id, id)).limit(1);
        if (!row) throw new NotFoundException(`Desafio ${id} não encontrado`);
        return row;
    }

    // ── Reorder ──────────────────────────────────────────────────────────────

    async reorder(trailId: string, dto: ReorderContentDto) {
        const lessonItems = dto.items.filter((i) => i.type === 'aula');
        const questionItems = dto.items.filter((i) => i.type === 'questao');
        const challengeItems = dto.items.filter((i) => i.type === 'desafio');

        await Promise.all([
            ...lessonItems.map((item) =>
                this.db
                    .update(lessons)
                    .set({ order: item.order, updatedAt: new Date() })
                    .where(eq(lessons.id, item.id)),
            ),
            ...questionItems.map((item) =>
                this.db
                    .update(questions)
                    .set({ order: item.order, updatedAt: new Date() })
                    .where(eq(questions.id, item.id)),
            ),
            ...challengeItems.map((item) =>
                this.db
                    .update(challenges)
                    .set({ order: item.order, updatedAt: new Date() })
                    .where(eq(challenges.id, item.id)),
            ),
        ]);

        return this.findAllByTrail(trailId);
    }
}
