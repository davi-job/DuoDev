import { pgTable, uuid, integer, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';
import { trails } from './trails';

export const userTrails = pgTable('user_trail', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    trailId: uuid('trail_id')
        .notNull()
        .references(() => trails.id, { onDelete: 'cascade' }),
    progressPct: integer('progress_pct').notNull().default(0),
    startedAt: timestamp('started_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});
