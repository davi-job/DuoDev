import { drizzle } from 'drizzle-orm/node-postgres';
import { Pool } from 'pg';
import * as schema from './schema';

const connectionString =
    process.env.LOCAL_DATABASE_URL ??
    process.env.DATABASE_URL ??
    'postgres://postgres:postgres@localhost:8030/database';

const pool = new Pool({
    connectionString,
});

export const db = drizzle(pool, { schema });
export type DB = typeof db;
