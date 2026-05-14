import { pgTable, uuid, varchar, integer, timestamp, text, jsonb } from 'drizzle-orm/pg-core';
import { trails } from './trails';

export type Alternative = {
    id: string;
    text: string;
};

export type QuestionType = 'multiple-choice' | 'code-reading' | 'fill-blank';

export const questions = pgTable('questions', {
    id: uuid('id').primaryKey().defaultRandom(),
    trailId: uuid('trail_id').notNull().references(() => trails.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    questionType: varchar('question_type', { length: 30 }).notNull().default('multiple-choice'),
    codeSnippet: text('code_snippet'),
    sentence: text('sentence'),
    blanks: jsonb('blanks').$type<string[]>().notNull().default([]),
    correctOrder: jsonb('correct_order').$type<string[]>().notNull().default([]),
    alternatives: jsonb('alternatives').$type<Alternative[]>().notNull().default([]),
    answer: text('answer').notNull().default(''),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
