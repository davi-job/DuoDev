import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    categories,
    trails,
    lessons,
    questions,
    challenges,
    type DB,
} from '@duodev/db';
import { and, asc, eq, inArray } from 'drizzle-orm';

type LearningItem =
    | {
          id: string;
          type: 'lesson';
          order: number;
          title: string;
          status: string;
          elements: typeof lessons.$inferSelect.elements;
      }
    | {
          id: string;
          type: 'question';
          order: number;
          title: string;
          status: string;
          description: string | null;
          alternatives: typeof questions.$inferSelect.alternatives;
          answer: string;
      }
    | {
          id: string;
          type: 'challenge';
          order: number;
          title: string;
          status: string;
          description: string | null;
          instructions: string | null;
      };

@Injectable()
export class LearningService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async listPublishedCategories() {
        const categoryRows = await this.db
            .select()
            .from(categories)
            .where(eq(categories.status, 'publicado'))
            .orderBy(asc(categories.name));

        const categoryIds = categoryRows.map((row) => row.id);
        const trailRows = categoryIds.length
            ? await this.db
                  .select({
                      id: trails.id,
                      categoryId: trails.categoryId,
                  })
                  .from(trails)
                  .where(and(eq(trails.status, 'publicado'), inArray(trails.categoryId, categoryIds)))
            : [];

        const countsByCategory = new Map<string, number>();
        for (const trailRow of trailRows) {
            const current = countsByCategory.get(trailRow.categoryId ?? '') ?? 0;
            countsByCategory.set(trailRow.categoryId ?? '', current + 1);
        }

        return categoryRows.map((row) => ({
            id: row.id,
            name: row.name,
            description: row.description,
            icon: row.icon,
            duration: row.duration,
            totalHours: row.totalHours,
            thumbColor: row.thumbColor,
            trailCount: countsByCategory.get(row.id) ?? 0,
        }));
    }

    async listPublishedTrailsByCategory(categoryId: string) {
        await this.findPublishedCategory(categoryId);

        const trailRows = await this.db
            .select()
            .from(trails)
            .where(and(eq(trails.categoryId, categoryId), eq(trails.status, 'publicado')))
            .orderBy(asc(trails.name));

        const trailIds = trailRows.map((row) => row.id);
        const countsByTrail = await this.countPublishedContentByTrail(trailIds);

        return trailRows.map((row) => ({
            id: row.id,
            categoryId: row.categoryId,
            name: row.name,
            level: row.level,
            description: row.description,
            duration: row.duration,
            totalHours: row.totalHours,
            year: row.year,
            thumbColor: row.thumbColor,
            status: row.status,
            contentCounts: countsByTrail.get(row.id) ?? { lessons: 0, questions: 0, challenges: 0 },
        }));
    }

    async getPublishedTrail(trailId: string) {
        const trailRow = await this.findPublishedTrail(trailId);
        const [categoryRow] = await this.db
            .select()
            .from(categories)
            .where(eq(categories.id, trailRow.categoryId!))
            .limit(1);

        const countsByTrail = await this.countPublishedContentByTrail([trailId]);

        return {
            id: trailRow.id,
            categoryId: trailRow.categoryId,
            category: categoryRow
                ? {
                      id: categoryRow.id,
                      name: categoryRow.name,
                      icon: categoryRow.icon,
                      thumbColor: categoryRow.thumbColor,
                  }
                : null,
            name: trailRow.name,
            level: trailRow.level,
            description: trailRow.description,
            duration: trailRow.duration,
            totalHours: trailRow.totalHours,
            year: trailRow.year,
            thumbColor: trailRow.thumbColor,
            status: trailRow.status,
            contentCounts: countsByTrail.get(trailId) ?? { lessons: 0, questions: 0, challenges: 0 },
        };
    }

    async getPublishedTrailContent(trailId: string) {
        const trailRow = await this.getPublishedTrail(trailId);

        const [lessonRows, questionRows, challengeRows] = await Promise.all([
            this.db
                .select()
                .from(lessons)
                .where(and(eq(lessons.trailId, trailId), eq(lessons.status, 'publicado')))
                .orderBy(asc(lessons.order)),
            this.db
                .select()
                .from(questions)
                .where(and(eq(questions.trailId, trailId), eq(questions.status, 'publicado')))
                .orderBy(asc(questions.order)),
            this.db
                .select()
                .from(challenges)
                .where(and(eq(challenges.trailId, trailId), eq(challenges.status, 'publicado')))
                .orderBy(asc(challenges.order)),
        ]);

        const items: LearningItem[] = [
            ...lessonRows.map((row) => ({
                id: row.id,
                type: 'lesson' as const,
                order: row.order,
                title: row.title,
                status: row.status,
                elements: row.elements,
            })),
            ...questionRows.map((row) => ({
                id: row.id,
                type: 'question' as const,
                order: row.order,
                title: row.title,
                status: row.status,
                description: row.description,
                alternatives: row.alternatives,
                answer: row.answer,
            })),
            ...challengeRows.map((row) => ({
                id: row.id,
                type: 'challenge' as const,
                order: row.order,
                title: row.title,
                status: row.status,
                description: row.description,
                instructions: row.instructions,
            })),
        ].sort((a, b) => a.order - b.order);

        return {
            trail: trailRow,
            items,
        };
    }

    private async findPublishedCategory(categoryId: string) {
        const [row] = await this.db
            .select()
            .from(categories)
            .where(and(eq(categories.id, categoryId), eq(categories.status, 'publicado')))
            .limit(1);

        if (!row) {
            throw new NotFoundException('Categoria publicada não encontrada.');
        }

        return row;
    }

    private async findPublishedTrail(trailId: string) {
        const [row] = await this.db
            .select()
            .from(trails)
            .where(and(eq(trails.id, trailId), eq(trails.status, 'publicado')))
            .limit(1);

        if (!row) {
            throw new NotFoundException('Trilha publicada não encontrada.');
        }

        return row;
    }

    private async countPublishedContentByTrail(trailIds: string[]) {
        const countsByTrail = new Map<string, { lessons: number; questions: number; challenges: number }>();

        if (!trailIds.length) {
            return countsByTrail;
        }

        const [lessonRows, questionRows, challengeRows] = await Promise.all([
            this.db
                .select({ trailId: lessons.trailId })
                .from(lessons)
                .where(and(inArray(lessons.trailId, trailIds), eq(lessons.status, 'publicado'))),
            this.db
                .select({ trailId: questions.trailId })
                .from(questions)
                .where(and(inArray(questions.trailId, trailIds), eq(questions.status, 'publicado'))),
            this.db
                .select({ trailId: challenges.trailId })
                .from(challenges)
                .where(and(inArray(challenges.trailId, trailIds), eq(challenges.status, 'publicado'))),
        ]);

        for (const trailId of trailIds) {
            countsByTrail.set(trailId, { lessons: 0, questions: 0, challenges: 0 });
        }

        for (const row of lessonRows) {
            const current = countsByTrail.get(row.trailId);
            if (current) current.lessons += 1;
        }

        for (const row of questionRows) {
            const current = countsByTrail.get(row.trailId);
            if (current) current.questions += 1;
        }

        for (const row of challengeRows) {
            const current = countsByTrail.get(row.trailId);
            if (current) current.challenges += 1;
        }

        return countsByTrail;
    }
}
