/**
 * Cria um usuário admin no banco.
 * Uso: npx ts-node -r tsconfig-paths/register scripts/seed-admin.ts
 *
 * Variáveis de ambiente necessárias (via .env na raiz do monorepo):
 *   DATABASE_URL, SEED_ADMIN_EMAIL, SEED_ADMIN_PASSWORD, SEED_ADMIN_NAME
 */
import { config } from 'dotenv';
import path from 'path';
config({ path: path.resolve(__dirname, '../../../.env') });
import * as bcrypt from 'bcrypt';
import { db, users } from '@duodev/db';
import { eq } from 'drizzle-orm';

const email = process.env.SEED_ADMIN_EMAIL ?? 'admin@duodev.com';
const password = process.env.SEED_ADMIN_PASSWORD ?? 'admin123';
const name = process.env.SEED_ADMIN_NAME ?? 'Administrador';

async function run() {
    const [existing] = await db.select().from(users).where(eq(users.email, email)).limit(1);

    if (existing) {
        if (existing.role === 'admin') {
            console.log(`✓ Usuário admin "${email}" já existe.`);
        } else {
            await db.update(users).set({ role: 'admin' }).where(eq(users.email, email));
            console.log(`✓ Usuário "${email}" promovido a admin.`);
        }
        process.exit(0);
    }

    const hash = await bcrypt.hash(password, 10);
    await db.insert(users).values({ name, email, password: hash, role: 'admin' });
    console.log(`✓ Usuário admin "${email}" criado com senha "${password}".`);
    console.log('  Lembre de trocar a senha em produção!');
    process.exit(0);
}

run().catch((err) => {
    console.error('Erro ao criar admin:', err);
    process.exit(1);
});
