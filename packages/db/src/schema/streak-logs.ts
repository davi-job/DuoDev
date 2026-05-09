import { pgTable, uuid, date, boolean, timestamp } from 'drizzle-orm/pg-core';
import { users } from './users';

export const streakLogs = pgTable('streak_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => users.id, { onDelete: 'cascade' }),
    logDate: date('log_date').notNull(),
    completed: boolean('completed').notNull().default(false),
});
