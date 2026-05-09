import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const trails = pgTable('trails', {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id').references(() => categories.id),
    name: varchar('name', { length: 255 }).notNull(),
    level: varchar('level', { length: 100 }).notNull(),
    description: varchar('description', { length: 255 }).notNull(),
    duration: varchar('duration', { length: 100 }).notNull(),
    totalHours: integer('total_hours').notNull(),
    year: integer('year').notNull(),
    thumbColor: varchar('thumb_color', { length: 50 }).notNull(),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
