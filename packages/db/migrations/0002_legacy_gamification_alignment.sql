CREATE SCHEMA IF NOT EXISTS "drizzle";

CREATE TABLE IF NOT EXISTS "drizzle"."__drizzle_migrations" (
    "id" SERIAL PRIMARY KEY,
    "hash" text NOT NULL,
    "created_at" bigint
);

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "xp" integer DEFAULT 0 NOT NULL;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "streakCurrent" integer DEFAULT 0 NOT NULL;

ALTER TABLE "user"
ADD COLUMN IF NOT EXISTS "streakBest" integer DEFAULT 0 NOT NULL;

ALTER TABLE "trails"
ADD COLUMN IF NOT EXISTS "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;

DO $$
BEGIN
    CREATE TYPE "gamification_rarity" AS ENUM ('comum', 'incomum', 'raro', 'epico', 'lendario');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "cosmetic_type" AS ENUM ('titulo', 'moldura', 'tema', 'selo');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "mission_period" AS ENUM ('diaria', 'semanal', 'sazonal');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "mission_status" AS ENUM ('pendente', 'concluida', 'resgatada', 'expirada');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "leaderboard_season_status" AS ENUM ('rascunho', 'agendada', 'ativa', 'encerrada', 'arquivada');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "reward_delivery_status" AS ENUM ('pendente', 'entregue', 'falhou');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

DO $$
BEGIN
    CREATE TYPE "notification_type" AS ENUM ('nivel', 'badge', 'missao', 'ranking', 'recompensa', 'streak', 'sistema');
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "gamification_configs" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "key" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "value" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "gamification_configs_key_unique"
ON "gamification_configs" ("key");

CREATE TABLE IF NOT EXISTS "xp_rules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "points" integer NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "xp_rules_code_unique"
ON "xp_rules" ("code");

CREATE TABLE IF NOT EXISTS "achievement_definitions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "icon" varchar(50) DEFAULT '🏅' NOT NULL,
    "rarity" "gamification_rarity" DEFAULT 'comum' NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "reward_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "achievement_definitions_code_unique"
ON "achievement_definitions" ("code");

CREATE TABLE IF NOT EXISTS "cosmetic_items" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "type" "cosmetic_type" NOT NULL,
    "rarity" "gamification_rarity" DEFAULT 'comum' NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "preview" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "unlock_condition" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "cosmetic_items_code_unique"
ON "cosmetic_items" ("code");

CREATE TABLE IF NOT EXISTS "mission_definitions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "icon" varchar(50) DEFAULT '🎯' NOT NULL,
    "period" "mission_period" NOT NULL,
    "target_type" varchar(100) NOT NULL,
    "target_value" integer DEFAULT 1 NOT NULL,
    "active" boolean DEFAULT true NOT NULL,
    "criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "reward_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "mission_definitions_code_unique"
ON "mission_definitions" ("code");

CREATE TABLE IF NOT EXISTS "leaderboard_seasons" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "period" "mission_period" DEFAULT 'semanal' NOT NULL,
    "status" "leaderboard_season_status" DEFAULT 'rascunho' NOT NULL,
    "starts_at" timestamp NOT NULL,
    "ends_at" timestamp NOT NULL,
    "scoring_rules" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "leaderboard_seasons_code_unique"
ON "leaderboard_seasons" ("code");

CREATE TABLE IF NOT EXISTS "reward_tiers" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "season_id" uuid REFERENCES "leaderboard_seasons"("id") ON DELETE cascade,
    "label" varchar(255) NOT NULL,
    "placement_from" integer NOT NULL,
    "placement_to" integer NOT NULL,
    "reward_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "cosmetic_item_id" uuid REFERENCES "cosmetic_items"("id") ON DELETE set null,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "adaptive_review_rules" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "code" varchar(100) NOT NULL,
    "label" varchar(255) NOT NULL,
    "description" text,
    "active" boolean DEFAULT true NOT NULL,
    "criteria" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "recommendation_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "adaptive_review_rules_code_unique"
ON "adaptive_review_rules" ("code");

CREATE TABLE IF NOT EXISTS "user_achievements" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "definition_id" uuid NOT NULL REFERENCES "achievement_definitions"("id") ON DELETE cascade,
    "reward_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "unlocked_at" timestamp DEFAULT now() NOT NULL,
    "claimed_at" timestamp
);

CREATE TABLE IF NOT EXISTS "user_cosmetics" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "cosmetic_item_id" uuid NOT NULL REFERENCES "cosmetic_items"("id") ON DELETE cascade,
    "source" varchar(100) DEFAULT 'manual' NOT NULL,
    "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "unlocked_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "user_equipped_cosmetics" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "title_item_id" uuid REFERENCES "cosmetic_items"("id") ON DELETE set null,
    "frame_item_id" uuid REFERENCES "cosmetic_items"("id") ON DELETE set null,
    "theme_item_id" uuid REFERENCES "cosmetic_items"("id") ON DELETE set null,
    "badge_item_id" uuid REFERENCES "cosmetic_items"("id") ON DELETE set null,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE UNIQUE INDEX IF NOT EXISTS "user_equipped_cosmetics_user_id_unique"
ON "user_equipped_cosmetics" ("user_id");

CREATE TABLE IF NOT EXISTS "user_missions" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "mission_definition_id" uuid NOT NULL REFERENCES "mission_definitions"("id") ON DELETE cascade,
    "period_start" timestamp NOT NULL,
    "period_end" timestamp NOT NULL,
    "progress" integer DEFAULT 0 NOT NULL,
    "target" integer DEFAULT 1 NOT NULL,
    "status" "mission_status" DEFAULT 'pendente' NOT NULL,
    "reward_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "claimed_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL,
    "updated_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "leaderboard_snapshots" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "season_id" uuid NOT NULL REFERENCES "leaderboard_seasons"("id") ON DELETE cascade,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "rank" integer NOT NULL,
    "score" integer NOT NULL,
    "reward_snapshot" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "weekly_rewards" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "season_id" uuid NOT NULL REFERENCES "leaderboard_seasons"("id") ON DELETE cascade,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "reward_payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "delivery_status" "reward_delivery_status" DEFAULT 'pendente' NOT NULL,
    "delivered_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "streak_freezes" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "delta" integer DEFAULT 1 NOT NULL,
    "source" varchar(100) DEFAULT 'sistema' NOT NULL,
    "reason" text,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "in_app_notifications" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "user_id" uuid NOT NULL REFERENCES "user"("id") ON DELETE cascade,
    "type" "notification_type" DEFAULT 'sistema' NOT NULL,
    "title" varchar(255) NOT NULL,
    "body" text NOT NULL,
    "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "read_at" timestamp,
    "created_at" timestamp DEFAULT now() NOT NULL
);

CREATE TABLE IF NOT EXISTS "gamification_audit_log" (
    "id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
    "admin_user_id" uuid,
    "action" varchar(100) NOT NULL,
    "entity_type" varchar(100) NOT NULL,
    "entity_id" uuid,
    "payload" jsonb DEFAULT '{}'::jsonb NOT NULL,
    "created_at" timestamp DEFAULT now() NOT NULL
);
