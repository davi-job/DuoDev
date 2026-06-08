import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, eq, inArray, sql } from 'drizzle-orm';
import { challenges, lessons, questions, trails, type DB, userTrails } from '@duodev/db';
import { UsersService } from '../users/users.service';
import { XP_REWARDS } from '../users/gamification.util';

@Injectable()
export class UserTrailService {
    private userTrailSupportsExtendedProgress?: boolean;

    constructor(
        @Inject('DB') private readonly db: DB,
        private readonly usersService: UsersService,
    ) {}

    async findByUsuario(userId: string) {
        const progressRows = await this.listProgressRows(userId);

        const trailIds = progressRows.map((row) => row.trailId);
        if (!trailIds.length) return [];

        const trailRows = await this.db
            .select()
            .from(trails)
            .where(and(inArray(trails.id, trailIds), eq(trails.status, 'publicado')));

        const trailsById = new Map(trailRows.map((row) => [row.id, row]));

        return progressRows
            .map((row) => {
                const trail = trailsById.get(row.trailId);
                if (!trail) return null;

                return {
                    id: row.id,
                    progressoPct: row.progressPct,
                    acertos: row.correctAnswers ?? 0,
                    erros: row.incorrectAnswers ?? 0,
                    trail: {
                        id: trail.id,
                        nome: trail.name,
                        nivel: trail.level,
                        duracao: trail.duration ?? undefined,
                        totalHoras: trail.totalHours ?? 0,
                        ano: trail.year ?? 0,
                    },
                };
            })
            .filter((item): item is NonNullable<typeof item> => item !== null);
    }

    async completeLesson(userId: string, trailId: string, lessonId: string) {
        const item = await this.findPublishedLesson(trailId, lessonId);
        const previous = await this.findProgressRow(userId, trailId);
        const progress = await this.upsertProgress({
            userId,
            trailId,
            completedItemIds: [item.id],
        });
        await this.rewardProgress(userId, previous, progress, XP_REWARDS.lessonCompleted);
        return progress;
    }

    async startTrail(userId: string, trailId: string) {
        const trail = await this.findPublishedTrail(trailId);

        const [existing] = await this.listProgressRows(userId).then((rows) =>
            rows.filter((row) => row.trailId === trail.id).slice(0, 1),
        );

        if (existing) {
            return existing;
        }

        const progress = await this.updateProgresso(userId, trail.id, 0);
        await this.usersService.incrementXp(userId, XP_REWARDS.trailStarted);
        return progress;
    }

    async completeChallenge(userId: string, trailId: string, challengeId: string) {
        const item = await this.findPublishedChallenge(trailId, challengeId);
        const previous = await this.findProgressRow(userId, trailId);
        const progress = await this.upsertProgress({
            userId,
            trailId,
            completedItemIds: [item.id],
        });
        await this.rewardProgress(userId, previous, progress, XP_REWARDS.challengeCompleted);
        return progress;
    }

    async submitQuiz(
        userId: string,
        trailId: string,
        payload: { questionIds: string[]; correctAnswers: number; incorrectAnswers: number },
    ) {
        const previous = await this.findProgressRow(userId, trailId);
        const publishedQuestions = await this.db
            .select({ id: questions.id })
            .from(questions)
            .where(and(eq(questions.trailId, trailId), eq(questions.status, 'publicado')));

        const publishedIds = new Set(publishedQuestions.map((item) => item.id));
        const validQuestionIds = payload.questionIds.filter((id) => publishedIds.has(id));

        if (!validQuestionIds.length && publishedQuestions.length) {
            throw new BadRequestException('Nenhuma questão válida foi enviada para esta trilha.');
        }

        const progress = await this.upsertProgress({
            userId,
            trailId,
            completedItemIds: validQuestionIds,
            correctAnswers: payload.correctAnswers,
            incorrectAnswers: payload.incorrectAnswers,
        });
        await this.rewardQuiz(userId, previous, progress, payload);
        return progress;
    }

    async updateProgresso(userId: string, trailId: string, progressoPct: number) {
        const trail = await this.findPublishedTrail(trailId);
        const supportsExtendedProgress = await this.supportsExtendedProgress();

        const [existing] = await this.db
            .select()
            .from(userTrails)
            .where(and(eq(userTrails.userId, userId), eq(userTrails.trailId, trail.id)))
            .limit(1);

        if (existing) {
            if (supportsExtendedProgress) {
                const [updated] = await this.db
                    .update(userTrails)
                    .set({
                        progressPct: progressoPct,
                        updatedAt: new Date(),
                    })
                    .where(eq(userTrails.id, existing.id))
                    .returning();
                return updated;
            }

            await this.db.execute(sql`
                update "user_trail"
                set "progressoPct" = ${progressoPct}, "atualizadoEm" = now()
                where "id" = ${existing.id}
            `);

            return {
                ...existing,
                progressPct: progressoPct,
                updatedAt: new Date(),
            };
        }

        if (supportsExtendedProgress) {
            const [created] = await this.db
                .insert(userTrails)
                .values({
                    userId,
                    trailId: trail.id,
                    progressPct: progressoPct,
                })
                .returning();

            return created;
        }

        await this.db.execute(sql`
            insert into "user_trail" ("id", "idUsuario", "idTrilha", "progressoPct", "iniciadoEm", "atualizadoEm")
            values (gen_random_uuid(), ${userId}, ${trail.id}, ${progressoPct}, now(), now())
        `);

        const [created] = await this.listProgressRows(userId);
        return created;
    }

    private async upsertProgress(params: {
        userId: string;
        trailId: string;
        completedItemIds?: string[];
        correctAnswers?: number;
        incorrectAnswers?: number;
    }) {
        const trail = await this.findPublishedTrail(params.trailId);
        const supportsExtendedProgress = await this.supportsExtendedProgress();

        if (!supportsExtendedProgress) {
            const totalItems = await this.countPublishedItems(trail.id);
            const existingRows = await this.listProgressRows(params.userId);
            const existing = existingRows.find((row) => row.trailId === trail.id);
            const incrementCount = Math.max(1, params.completedItemIds?.length ?? 1);
            const incrementPct =
                totalItems === 0 ? 0 : Math.max(1, Math.ceil((incrementCount / totalItems) * 100));
            const nextPct = Math.min(100, (existing?.progressPct ?? 0) + incrementPct);
            return this.updateProgresso(params.userId, trail.id, nextPct);
        }

        const totalItems = await this.countPublishedItems(trail.id);

        const [existing] = await this.db
            .select()
            .from(userTrails)
            .where(and(eq(userTrails.userId, params.userId), eq(userTrails.trailId, trail.id)))
            .limit(1);

        const completedItemIds = Array.from(
            new Set([...(existing?.completedItemIds ?? []), ...(params.completedItemIds ?? [])]),
        );
        const progressPct =
            totalItems === 0 ? 0 : Math.round((completedItemIds.length / totalItems) * 100);

        if (existing) {
            const [updated] = await this.db
                .update(userTrails)
                .set({
                    completedItemIds,
                    correctAnswers: params.correctAnswers ?? existing.correctAnswers,
                    incorrectAnswers: params.incorrectAnswers ?? existing.incorrectAnswers,
                    progressPct,
                    updatedAt: new Date(),
                })
                .where(eq(userTrails.id, existing.id))
                .returning();
            return updated;
        }

        const [created] = await this.db
            .insert(userTrails)
            .values({
                userId: params.userId,
                trailId: trail.id,
                completedItemIds,
                correctAnswers: params.correctAnswers ?? 0,
                incorrectAnswers: params.incorrectAnswers ?? 0,
                progressPct,
            })
            .returning();

        return created;
    }

    private async listProgressRows(userId: string) {
        const supportsExtendedProgress = await this.supportsExtendedProgress();

        if (supportsExtendedProgress) {
            return this.db
                .select()
                .from(userTrails)
                .where(eq(userTrails.userId, userId))
                .orderBy(asc(userTrails.startedAt));
        }

        const result = await this.db.execute(sql`
            select
                "id",
                "idUsuario",
                "idTrilha",
                "progressoPct",
                "iniciadoEm",
                "atualizadoEm"
            from "user_trail"
            where "idUsuario" = ${userId}
            order by "iniciadoEm" asc
        `);

        return result.rows.map((row) => ({
            id: String(row.id),
            userId: String(row.idUsuario),
            trailId: String(row.idTrilha),
            progressPct: Number(row.progressoPct ?? 0),
            completedItemIds: [] as string[],
            correctAnswers: 0,
            incorrectAnswers: 0,
            startedAt: row.iniciadoEm instanceof Date ? row.iniciadoEm : new Date(String(row.iniciadoEm)),
            updatedAt: row.atualizadoEm instanceof Date ? row.atualizadoEm : new Date(String(row.atualizadoEm)),
        }));
    }

    private async findProgressRow(userId: string, trailId: string) {
        const rows = await this.listProgressRows(userId);
        return rows.find((row) => row.trailId === trailId);
    }

    private async rewardProgress(
        userId: string,
        previous:
            | {
                  progressPct: number;
              }
            | undefined,
        current: {
            progressPct: number;
        },
        baseXp: number,
    ) {
        const previousProgress = previous?.progressPct ?? 0;
        const currentProgress = current.progressPct ?? 0;

        if (currentProgress <= previousProgress) {
            return;
        }

        let xp = baseXp;
        if (previousProgress < 100 && currentProgress >= 100) {
            xp += XP_REWARDS.trailCompleted;
        }

        await this.usersService.incrementXp(userId, xp);
    }

    private async rewardQuiz(
        userId: string,
        previous:
            | {
                  progressPct: number;
                  correctAnswers?: number;
                  incorrectAnswers?: number;
              }
            | undefined,
        current: {
            progressPct: number;
        },
        payload: { correctAnswers: number; incorrectAnswers: number },
    ) {
        const previousAttempts = (previous?.correctAnswers ?? 0) + (previous?.incorrectAnswers ?? 0);
        const currentAttempts = Math.max(0, payload.correctAnswers) + Math.max(0, payload.incorrectAnswers);
        const hasNewQuizResult = currentAttempts > previousAttempts || current.progressPct > (previous?.progressPct ?? 0);

        await this.rewardProgress(userId, previous, current, hasNewQuizResult ? XP_REWARDS.quizCompleted : 0);

        if (previousAttempts === 0 && payload.incorrectAnswers === 0 && payload.correctAnswers > 0) {
            await this.usersService.incrementXp(userId, XP_REWARDS.quizPerfectBonus);
        }
    }

    private async supportsExtendedProgress() {
        if (this.userTrailSupportsExtendedProgress !== undefined) {
            return this.userTrailSupportsExtendedProgress;
        }

        const result = await this.db.execute(sql`
            select column_name
            from information_schema.columns
            where table_schema = 'public'
              and table_name = 'user_trail'
              and column_name in ('completed_item_ids', 'correct_answers', 'incorrect_answers')
        `);

        const columns = new Set(result.rows.map((row) => String(row.column_name)));
        this.userTrailSupportsExtendedProgress =
            columns.has('completed_item_ids') &&
            columns.has('correct_answers') &&
            columns.has('incorrect_answers');

        return this.userTrailSupportsExtendedProgress;
    }

    private async countPublishedItems(trailId: string) {
        const [lessonRows, questionRows, challengeRows] = await Promise.all([
            this.db
                .select({ id: lessons.id })
                .from(lessons)
                .where(and(eq(lessons.trailId, trailId), eq(lessons.status, 'publicado'))),
            this.db
                .select({ id: questions.id })
                .from(questions)
                .where(and(eq(questions.trailId, trailId), eq(questions.status, 'publicado'))),
            this.db
                .select({ id: challenges.id })
                .from(challenges)
                .where(and(eq(challenges.trailId, trailId), eq(challenges.status, 'publicado'))),
        ]);

        return lessonRows.length + questionRows.length + challengeRows.length;
    }

    private async findPublishedTrail(trailId: string) {
        const [trail] = await this.db
            .select()
            .from(trails)
            .where(and(eq(trails.id, trailId), eq(trails.status, 'publicado')))
            .limit(1);

        if (!trail) {
            throw new NotFoundException('Trilha publicada não encontrada.');
        }

        return trail;
    }

    private async findPublishedLesson(trailId: string, lessonId: string) {
        const [lesson] = await this.db
            .select()
            .from(lessons)
            .where(and(eq(lessons.id, lessonId), eq(lessons.trailId, trailId), eq(lessons.status, 'publicado')))
            .limit(1);

        if (!lesson) {
            throw new NotFoundException('Aula publicada não encontrada.');
        }

        return lesson;
    }

    private async findPublishedChallenge(trailId: string, challengeId: string) {
        const [challenge] = await this.db
            .select()
            .from(challenges)
            .where(
                and(
                    eq(challenges.id, challengeId),
                    eq(challenges.trailId, trailId),
                    eq(challenges.status, 'publicado'),
                ),
            )
            .limit(1);

        if (!challenge) {
            throw new NotFoundException('Desafio publicado não encontrado.');
        }

        return challenge;
    }
}
