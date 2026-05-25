import { pgTable, uuid, integer, timestamp, jsonb } from 'drizzle-orm/pg-core';
import { legacyUsers } from './legacy-user';
import { trails } from './trails';

export const userTrails = pgTable('user_trail', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('idUsuario')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    trailId: uuid('idTrilha')
        .notNull()
        .references(() => trails.id, { onDelete: 'cascade' }),
    progressPct: integer('progressoPct').notNull().default(0),
    completedItemIds: jsonb('completed_item_ids').$type<string[]>().notNull().default([]),
    correctAnswers: integer('correct_answers').notNull().default(0),
    incorrectAnswers: integer('incorrect_answers').notNull().default(0),
    startedAt: timestamp('iniciadoEm').notNull().defaultNow(),
    updatedAt: timestamp('atualizadoEm').notNull().defaultNow(),
});
