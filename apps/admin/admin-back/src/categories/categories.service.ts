import { Injectable, Inject, NotFoundException } from '@nestjs/common';
import { eq, sql } from 'drizzle-orm';
import { categories, trails, lessons, questions, challenges } from '@duodev/db';
import type { DB } from '@duodev/db';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoriesService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async findAll() {
        const rows = await this.db
            .select({
                id: categories.id,
                name: categories.name,
                description: categories.description,
                status: categories.status,
                icon: categories.icon,
                thumbColor: categories.thumbColor,
                duration: categories.duration,
                totalHours: categories.totalHours,
                createdAt: categories.createdAt,
                updatedAt: categories.updatedAt,
                totalTrails: sql<number>`(
                    select count(*) from "trails"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
                totalLessons: sql<number>`(
                    select count(*) from "lessons"
                    inner join "trails" on "lessons"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
                totalQuestions: sql<number>`(
                    select count(*) from "questions"
                    inner join "trails" on "questions"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
                totalChallenges: sql<number>`(
                    select count(*) from "challenges"
                    inner join "trails" on "challenges"."trail_id" = "trails"."id"
                    where "trails"."category_id" = "categories"."id"
                )`.mapWith(Number),
            })
            .from(categories)
            .orderBy(categories.createdAt);

        return rows;
    }

    async findOne(id: string) {
        const [row] = await this.db
            .select()
            .from(categories)
            .where(eq(categories.id, id))
            .limit(1);

        if (!row) throw new NotFoundException(`Categoria ${id} não encontrada`);
        return row;
    }

    async create(dto: CreateCategoryDto) {
        const [row] = await this.db
            .insert(categories)
            .values({
                name: dto.name,
                description: dto.description,
                status: dto.status ?? 'rascunho',
                icon: dto.icon,
                thumbColor: dto.thumbColor,
                duration: dto.duration,
                totalHours: dto.totalHours,
            })
            .returning();

        return row;
    }

    async update(id: string, dto: UpdateCategoryDto) {
        await this.findOne(id);

        const [row] = await this.db
            .update(categories)
            .set({ ...dto, updatedAt: new Date() })
            .where(eq(categories.id, id))
            .returning();

        return row;
    }

    async remove(id: string) {
        await this.findOne(id);

        await this.db.delete(categories).where(eq(categories.id, id));
    }
}
