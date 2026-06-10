import {
    boolean,
    integer,
    jsonb,
    pgEnum,
    pgTable,
    text,
    timestamp,
    uuid,
    varchar,
} from 'drizzle-orm/pg-core';
import { legacyUsers } from './legacy-user';

export const gamificationRarityEnum = pgEnum('gamification_rarity', [
    'comum',
    'incomum',
    'raro',
    'epico',
    'lendario',
]);

export const cosmeticTypeEnum = pgEnum('cosmetic_type', ['titulo', 'moldura', 'tema', 'selo']);
export const missionPeriodEnum = pgEnum('mission_period', ['diaria', 'semanal', 'sazonal']);
export const missionStatusEnum = pgEnum('mission_status', ['pendente', 'concluida', 'resgatada', 'expirada']);
export const leaderboardSeasonStatusEnum = pgEnum('leaderboard_season_status', [
    'rascunho',
    'agendada',
    'ativa',
    'encerrada',
    'arquivada',
]);
export const rewardDeliveryStatusEnum = pgEnum('reward_delivery_status', [
    'pendente',
    'entregue',
    'falhou',
]);
export const notificationTypeEnum = pgEnum('notification_type', [
    'nivel',
    'badge',
    'missao',
    'ranking',
    'recompensa',
    'streak',
    'sistema',
]);

export const gamificationConfigs = pgTable('gamification_configs', {
    id: uuid('id').primaryKey().defaultRandom(),
    key: varchar('key', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    value: jsonb('value').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const xpRules = pgTable('xp_rules', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    points: integer('points').notNull(),
    active: boolean('active').notNull().default(true),
    metadata: jsonb('metadata').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const achievementDefinitions = pgTable('achievement_definitions', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }).notNull().default('🏅'),
    rarity: gamificationRarityEnum('rarity').notNull().default('comum'),
    active: boolean('active').notNull().default(true),
    criteria: jsonb('criteria').notNull().default({}),
    rewardPayload: jsonb('reward_payload').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const cosmeticItems = pgTable('cosmetic_items', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    type: cosmeticTypeEnum('type').notNull(),
    rarity: gamificationRarityEnum('rarity').notNull().default('comum'),
    active: boolean('active').notNull().default(true),
    preview: jsonb('preview').notNull().default({}),
    unlockCondition: jsonb('unlock_condition').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const missionDefinitions = pgTable('mission_definitions', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    icon: varchar('icon', { length: 50 }).notNull().default('🎯'),
    period: missionPeriodEnum('period').notNull(),
    targetType: varchar('target_type', { length: 100 }).notNull(),
    targetValue: integer('target_value').notNull().default(1),
    active: boolean('active').notNull().default(true),
    criteria: jsonb('criteria').notNull().default({}),
    rewardPayload: jsonb('reward_payload').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const leaderboardSeasons = pgTable('leaderboard_seasons', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    period: missionPeriodEnum('period').notNull().default('semanal'),
    status: leaderboardSeasonStatusEnum('status').notNull().default('rascunho'),
    startsAt: timestamp('starts_at').notNull(),
    endsAt: timestamp('ends_at').notNull(),
    scoringRules: jsonb('scoring_rules').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const rewardTiers = pgTable('reward_tiers', {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id').references(() => leaderboardSeasons.id, { onDelete: 'cascade' }),
    label: varchar('label', { length: 255 }).notNull(),
    placementFrom: integer('placement_from').notNull(),
    placementTo: integer('placement_to').notNull(),
    rewardPayload: jsonb('reward_payload').notNull().default({}),
    cosmeticItemId: uuid('cosmetic_item_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const adaptiveReviewRules = pgTable('adaptive_review_rules', {
    id: uuid('id').primaryKey().defaultRandom(),
    code: varchar('code', { length: 100 }).notNull().unique(),
    label: varchar('label', { length: 255 }).notNull(),
    description: text('description'),
    active: boolean('active').notNull().default(true),
    criteria: jsonb('criteria').notNull().default({}),
    recommendationPayload: jsonb('recommendation_payload').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userAchievements = pgTable('user_achievements', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    definitionId: uuid('definition_id')
        .notNull()
        .references(() => achievementDefinitions.id, { onDelete: 'cascade' }),
    rewardSnapshot: jsonb('reward_snapshot').notNull().default({}),
    unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
    claimedAt: timestamp('claimed_at'),
});

export const userCosmetics = pgTable('user_cosmetics', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    cosmeticItemId: uuid('cosmetic_item_id')
        .notNull()
        .references(() => cosmeticItems.id, { onDelete: 'cascade' }),
    source: varchar('source', { length: 100 }).notNull().default('manual'),
    metadata: jsonb('metadata').notNull().default({}),
    unlockedAt: timestamp('unlocked_at').notNull().defaultNow(),
});

export const userEquippedCosmetics = pgTable('user_equipped_cosmetics', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' })
        .unique(),
    titleItemId: uuid('title_item_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
    frameItemId: uuid('frame_item_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
    themeItemId: uuid('theme_item_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
    badgeItemId: uuid('badge_item_id').references(() => cosmeticItems.id, { onDelete: 'set null' }),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const userMissions = pgTable('user_missions', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    missionDefinitionId: uuid('mission_definition_id')
        .notNull()
        .references(() => missionDefinitions.id, { onDelete: 'cascade' }),
    periodStart: timestamp('period_start').notNull(),
    periodEnd: timestamp('period_end').notNull(),
    progress: integer('progress').notNull().default(0),
    target: integer('target').notNull().default(1),
    status: missionStatusEnum('status').notNull().default('pendente'),
    rewardSnapshot: jsonb('reward_snapshot').notNull().default({}),
    claimedAt: timestamp('claimed_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
    updatedAt: timestamp('updated_at').notNull().defaultNow(),
});

export const leaderboardSnapshots = pgTable('leaderboard_snapshots', {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
        .notNull()
        .references(() => leaderboardSeasons.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    rank: integer('rank').notNull(),
    score: integer('score').notNull(),
    rewardSnapshot: jsonb('reward_snapshot').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const weeklyRewards = pgTable('weekly_rewards', {
    id: uuid('id').primaryKey().defaultRandom(),
    seasonId: uuid('season_id')
        .notNull()
        .references(() => leaderboardSeasons.id, { onDelete: 'cascade' }),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    rewardPayload: jsonb('reward_payload').notNull().default({}),
    deliveryStatus: rewardDeliveryStatusEnum('delivery_status').notNull().default('pendente'),
    deliveredAt: timestamp('delivered_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const streakFreezes = pgTable('streak_freezes', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    delta: integer('delta').notNull().default(1),
    source: varchar('source', { length: 100 }).notNull().default('sistema'),
    reason: text('reason'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const inAppNotifications = pgTable('in_app_notifications', {
    id: uuid('id').primaryKey().defaultRandom(),
    userId: uuid('user_id')
        .notNull()
        .references(() => legacyUsers.id, { onDelete: 'cascade' }),
    type: notificationTypeEnum('type').notNull().default('sistema'),
    title: varchar('title', { length: 255 }).notNull(),
    body: text('body').notNull(),
    payload: jsonb('payload').notNull().default({}),
    readAt: timestamp('read_at'),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});

export const gamificationAuditLog = pgTable('gamification_audit_log', {
    id: uuid('id').primaryKey().defaultRandom(),
    adminUserId: uuid('admin_user_id'),
    action: varchar('action', { length: 100 }).notNull(),
    entityType: varchar('entity_type', { length: 100 }).notNull(),
    entityId: uuid('entity_id'),
    payload: jsonb('payload').notNull().default({}),
    createdAt: timestamp('created_at').notNull().defaultNow(),
});
