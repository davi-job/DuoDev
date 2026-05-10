import { pgTable, uuid, varchar, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { trails } from './trails';

export type LessonElement = {
    id: string;
    type: 'texto' | 'imagem';
    content: string;
    order: number;
};

export const lessons = pgTable('lessons', {
    id: uuid('id').primaryKey().defaultRandom(),
    trailId: uuid('trail_id').notNull().references(() => trails.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    elements: jsonb('elements').$type<LessonElement[]>().notNull().default([]),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
