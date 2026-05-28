import { config } from 'dotenv';
import path from 'path';
import { defineConfig } from 'drizzle-kit';

config({ path: path.resolve(__dirname, '../../.env') });

export default defineConfig({
    schema: './src/schema/index.ts',
    out: './migrations',
    dialect: 'postgresql',
    dbCredentials: {
        url: (process.env.LOCAL_DATABASE_URL ?? process.env.DATABASE_URL)!,
    },
});
