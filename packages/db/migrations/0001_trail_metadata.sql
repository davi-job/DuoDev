ALTER TABLE "trails"
ADD COLUMN "metadata" jsonb DEFAULT '{}'::jsonb NOT NULL;
