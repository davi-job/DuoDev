import { pgTable, uuid, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { trails } from './trails';

export const challenges = pgTable('challenges', {
    id: uuid('id').primaryKey().defaultRandom(),
    trailId: uuid('trail_id').notNull().references(() => trails.id, { onDelete: 'cascade' }),
    order: integer('order').notNull(),
    title: varchar('title', { length: 255 }).notNull(),
    description: text('description'),
    instructions: text('instructions'),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
