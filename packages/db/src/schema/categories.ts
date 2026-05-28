import { pgTable, uuid, varchar, integer, timestamp, text } from 'drizzle-orm/pg-core';

export const categories = pgTable('categories', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    description: text('description'),
    status: varchar('status', { length: 15 }).notNull().default('rascunho'),
    icon: varchar('icon', { length: 100 }),
    duration: varchar('duration', { length: 100 }),
    totalHours: integer('total_hours'),
    thumbColor: varchar('thumb_color', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
