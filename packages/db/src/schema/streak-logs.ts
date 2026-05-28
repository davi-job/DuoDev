import { pgTable, uuid, date, boolean } from 'drizzle-orm/pg-core';
import { legacyUsers } from './legacy-user';

export const streakLogs = pgTable('streak_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('idUsuario')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    logDate: date('dataRegistro').notNull(),
    completed: boolean('concluido').notNull().default(false),
});
