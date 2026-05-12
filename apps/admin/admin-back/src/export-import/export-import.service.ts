import { Injectable, Inject } from '@nestjs/common';
import { categories, trails, lessons, questions, challenges } from '@duodev/db';
import type { DB } from '@duodev/db';
import { ImportContentDto } from './dto/import-content.dto';

@Injectable()
export class ExportImportService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async exportContent() {
        const [allCategories, allTrails, allLessons, allQuestions, allChallenges] =
            await Promise.all([
                this.db.select().from(categories),
                this.db.select().from(trails),
                this.db.select().from(lessons),
                this.db.select().from(questions),
                this.db.select().from(challenges),
            ]);

        return {
            version: 1,
            exportedAt: new Date().toISOString(),
            categories: allCategories.map((cat) => ({
                name: cat.name,
                description: cat.description,
                status: cat.status,
                icon: cat.icon,
                thumbColor: cat.thumbColor,
                duration: cat.duration,
                totalHours: cat.totalHours,
                trails: allTrails
                    .filter((t) => t.categoryId === cat.id)
                    .sort((a, b) => a.createdAt.getTime() - b.createdAt.getTime())
                    .map((trail) => ({
                        name: trail.name,
                        level: trail.level,
                        description: trail.description,
                        thumbColor: trail.thumbColor,
                        duration: trail.duration,
                        totalHours: trail.totalHours,
                        year: trail.year,
                        status: trail.status,
                        lessons: allLessons
                            .filter((l) => l.trailId === trail.id)
                            .sort((a, b) => a.order - b.order)
                            .map((l) => ({
                                order: l.order,
                                title: l.title,
                                status: l.status,
                                elements: l.elements,
                            })),
                        questions: allQuestions
                            .filter((q) => q.trailId === trail.id)
                            .sort((a, b) => a.order - b.order)
                            .map((q) => ({
                                order: q.order,
                                title: q.title,
                                description: q.description,
                                alternatives: q.alternatives,
                                answer: q.answer,
                                status: q.status,
                            })),
                        challenges: allChallenges
                            .filter((c) => c.trailId === trail.id)
                            .sort((a, b) => a.order - b.order)
                            .map((c) => ({
                                order: c.order,
                                title: c.title,
                                description: c.description,
                                instructions: c.instructions,
                                status: c.status,
                            })),
                    })),
            })),
        };
    }

    async importContent(dto: ImportContentDto) {
        const existingCats = await this.db.select({ name: categories.name }).from(categories);
        const existingNames = new Set(existingCats.map((c) => c.name));

        const resultado = {
            criados: { categorias: 0, trilhas: 0, aulas: 0, questoes: 0, desafios: 0 },
            pulados: { categorias: 0 },
        };

        for (const catDto of dto.categories) {
            if (existingNames.has(catDto.name)) {
                resultado.pulados.categorias++;
                continue;
            }

            const [newCat] = await this.db
                .insert(categories)
                .values({
                    name: catDto.name,
                    description: catDto.description,
                    status: catDto.status ?? 'rascunho',
                    icon: catDto.icon,
                    thumbColor: catDto.thumbColor,
                    duration: catDto.duration,
                    totalHours: catDto.totalHours,
                })
                .returning();

            resultado.criados.categorias++;

            for (const trailDto of catDto.trails ?? []) {
                const [newTrail] = await this.db
                    .insert(trails)
                    .values({
                        categoryId: newCat.id,
                        name: trailDto.name,
                        level: trailDto.level,
                        description: trailDto.description,
                        thumbColor: trailDto.thumbColor,
                        duration: trailDto.duration,
                        totalHours: trailDto.totalHours,
                        year: trailDto.year,
                        status: trailDto.status ?? 'rascunho',
                    })
                    .returning();

                resultado.criados.trilhas++;

                for (let i = 0; i < (trailDto.lessons ?? []).length; i++) {
                    const l = trailDto.lessons[i];
                    await this.db.insert(lessons).values({
                        trailId: newTrail.id,
                        order: l.order ?? i + 1,
                        title: l.title,
                        elements: l.elements ?? [],
                        status: l.status ?? 'rascunho',
                    });
                    resultado.criados.aulas++;
                }

                for (let i = 0; i < (trailDto.questions ?? []).length; i++) {
                    const q = trailDto.questions[i];
                    await this.db.insert(questions).values({
                        trailId: newTrail.id,
                        order: q.order ?? i + 1,
                        title: q.title,
                        description: q.description,
                        alternatives: q.alternatives ?? [],
                        answer: q.answer,
                        status: q.status ?? 'rascunho',
                    });
                    resultado.criados.questoes++;
                }

                for (let i = 0; i < (trailDto.challenges ?? []).length; i++) {
                    const c = trailDto.challenges[i];
                    await this.db.insert(challenges).values({
                        trailId: newTrail.id,
                        order: c.order ?? i + 1,
                        title: c.title,
                        description: c.description,
                        instructions: c.instructions,
                        status: c.status ?? 'rascunho',
                    });
                    resultado.criados.desafios++;
                }
            }
        }

        return resultado;
    }
}
