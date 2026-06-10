import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { trails, lessons, questions, challenges } from '@duodev/db';
import type { DB } from '@duodev/db';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';

@Injectable()
export class TrailsService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findAllByCategory(categoryId: string) {
        const rows = await this.db
            .select({
                id: trails.id,
                categoryId: trails.categoryId,
                name: trails.name,
                level: trails.level,
                description: trails.description,
                thumbColor: trails.thumbColor,
                duration: trails.duration,
                totalHours: trails.totalHours,
                year: trails.year,
                metadata: trails.metadata,
                status: trails.status,
                createdAt: trails.createdAt,
                updatedAt: trails.updatedAt,
                totalLessons: sql<number>`(
                    select count(*) from "lessons"
                    where "lessons"."trail_id" = "trails"."id"
                )`.mapWith(Number),
                totalQuestions: sql<number>`(
                    select count(*) from "questions"
                    where "questions"."trail_id" = "trails"."id"
                )`.mapWith(Number),
                totalChallenges: sql<number>`(
                    select count(*) from "challenges"
                    where "challenges"."trail_id" = "trails"."id"
                )`.mapWith(Number),
            })
            .from(trails)
            .where(eq(trails.categoryId, categoryId))
            .orderBy(trails.createdAt);

        return rows;
    }

    async findOne(id: string) {
        const [row] = await this.db
            .select()
            .from(trails)
            .where(eq(trails.id, id))
            .limit(1);

        if (!row) throw new NotFoundException(`Trilha ${id} não encontrada`);
        return row;
    }

    async create(dto: CreateTrailDto) {
        const [row] = await this.db
            .insert(trails)
            .values({
                categoryId: dto.categoryId,
                name: dto.name,
                level: dto.level,
                description: dto.description,
                thumbColor: dto.thumbColor,
                duration: dto.duration,
                totalHours: dto.totalHours,
                year: dto.year,
                metadata: dto.metadata ?? {},
                status: dto.status ?? 'rascunho',
            })
            .returning();

        return row;
    }

    async update(id: string, dto: UpdateTrailDto) {
        await this.findOne(id);

        const [row] = await this.db
            .update(trails)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(trails.id, id))
            .returning();

        return row;
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.db.delete(trails).where(eq(trails.id, id));
    }
}
