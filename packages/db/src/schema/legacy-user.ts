import { boolean, integer, pgTable, text, timestamp, uuid, varchar } from 'drizzle-orm/pg-core';

// Preserve the legacy auth table used by the original user-facing backend.
export const legacyUsers = pgTable('user', {
    id: uuid('id').primaryKey().defaultRandom(),
    email: varchar('email', { length: 255 }).notNull(),
    name: varchar('name', { length: 255 }),
    password: varchar('password', { length: 255 }),
    avatarUrl: varchar('avatarUrl', { length: 255 }),
    xp: integer('xp').notNull().default(0),
    streakCurrent: integer('streakCurrent').notNull().default(0),
    streakBest: integer('streakBest').notNull().default(0),
    language: varchar('language', { length: 255 }).notNull().default('en'),
    interests: text('interests'),
    interestReason: text('interestReason'),
    onboardingCompleted: boolean('onboardingCompleted').notNull().default(false),
    createdAt: timestamp('createdAt').notNull().defaultNow(),
    updatedAt: timestamp('updatedAt').notNull().defaultNow(),
});
