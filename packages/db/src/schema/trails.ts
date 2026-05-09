import { pgTable, uuid, varchar, integer, timestamp } from 'drizzle-orm/pg-core';

export const trails = pgTable('trails', {
    id: uuid('id').primaryKey().defaultRandom(),
    name: varchar('name', { length: 255 }).notNull(),
    level: varchar('level', { length: 100 }).notNull(),
    duration: varchar('duration', { length: 100 }).notNull(),
    totalHours: integer('total_hours').notNull(),
    year: integer('year').notNull(),
    thumbColor: varchar('thumb_color', { length: 50 }).notNull(),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
