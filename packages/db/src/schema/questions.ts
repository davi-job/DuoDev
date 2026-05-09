import { pgTable, uuid, varchar, integer, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { trails } from './trails';

export type Alternative = {
    id: string;
    text: string;
};

export const questions = pgTable('questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    trailId: uuid('trail_id').notNull().references(() => trails.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    alternatives: jsonb('alternatives').$type<Alternative[]>().notNull().default([]),
    answer: varchar('answer', { length: 255 }).notNull(),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
