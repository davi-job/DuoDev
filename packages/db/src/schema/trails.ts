import { pgTable, uuid, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';
import { categories } from './categories';

export const trails = pgTable('trails', {
    id: uuid('id').primaryKey().defaultRandom(),
    categoryId: uuid('category_id').references(() => categories.id, { onDelete: 'cascade' }),
    name: varchar('name', { length: 255 }).notNull(),
    level: varchar('level', { length: 100 }).notNull(),
    description: text('description').notNull(),
    duration: varchar('duration', { length: 100 }),
    totalHours: integer('total_hours'),
    year: integer('year'),
    thumbColor: varchar('thumb_color', { length: 50 }).notNull(),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
