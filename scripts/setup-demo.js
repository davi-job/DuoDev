const { config } = require('dotenv');
const { execSync } = require('node:child_process');
const path = require('node:path');
const { eq, inArray } = require('drizzle-orm');
const {
    db,
    legacyUsers,
    cosmeticItems,
    userCosmetics,
    userEquippedCosmetics,
} = require('@duodev/db');

config({ path: path.resolve(__dirname, '../.env') });

const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@duodev.com';
const adminPassword = process.env.SEED_ADMIN_PASSWORD || 'admin123';
const adminBackUrl = process.env.ADMIN_BACK_URL || 'http://localhost:8011/api';

function run(command) {
    execSync(command, { stdio: 'inherit' });
}

function sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

async function loginAndBootstrap() {
    const loginUrl = `${adminBackUrl}/auth/login`;
    const bootstrapUrl = `${adminBackUrl}/gamification/bootstrap`;
    let token = '';
    let lastError = null;

    for (let attempt = 1; attempt <= 20; attempt += 1) {
        try {
            const response = await fetch(loginUrl, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email: adminEmail, password: adminPassword }),
            });

            if (!response.ok) {
                throw new Error(`login failed with status ${response.status}`);
            }

            const data = await response.json();
            token = data.access_token || '';
            if (!token) {
                throw new Error('login response missing access_token');
            }

            break;
        } catch (error) {
            lastError = error;
            process.stdout.write(`\rAguardando admin-back ficar pronto... tentativa ${attempt}/20   `);
            await sleep(1500);
        }
    }

    process.stdout.write('\n');

    if (!token) {
        throw lastError || new Error('Não foi possível autenticar no admin-back.');
    }

    const bootstrapResponse = await fetch(bootstrapUrl, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({}),
    });

    if (!bootstrapResponse.ok) {
        const body = await bootstrapResponse.text();
        throw new Error(`bootstrap failed with status ${bootstrapResponse.status}: ${body}`);
    }

    const payload = await bootstrapResponse.json();
    console.log('Bootstrap de gamificação concluído.');
    console.log(JSON.stringify(payload, null, 2));
}

async function seedDemoCosmeticLoadouts() {
    const specs = [
        {
            email: 'douglas.ratts@duodev.com',
            equip: true,
            items: [
                'title_explorer',
                'title_builder',
                'title_mentor',
                'title_architect',
                'frame_flame',
                'frame_emerald',
                'frame_orbit',
                'theme_forest',
                'theme_night',
                'theme_dawn',
                'badge_comet',
                'badge_guardian',
            ],
            equipped: {
                title: 'title_architect',
                frame: 'frame_orbit',
                theme: 'theme_dawn',
                badge: 'badge_guardian',
            },
        },
        {
            email: 'vivo01@duodev.com',
            equip: true,
            items: ['title_explorer', 'frame_flame', 'theme_forest'],
        },
        {
            email: 'vivo02@duodev.com',
            equip: true,
            items: ['title_explorer', 'frame_flame', 'theme_forest'],
        },
        {
            email: 'vivo03@duodev.com',
            equip: true,
            items: ['title_explorer', 'frame_flame'],
        },
        {
            email: 'vivo04@duodev.com',
            equip: true,
            items: ['title_explorer'],
        },
        {
            email: 'vivo05@duodev.com',
            equip: true,
            items: ['title_explorer', 'theme_forest'],
        },
        {
            email: 'vivo06@duodev.com',
            equip: false,
            items: ['title_explorer', 'frame_flame', 'theme_forest'],
        },
        {
            email: 'vivo07@duodev.com',
            equip: false,
            items: ['title_explorer', 'frame_flame', 'theme_forest'],
        },
    ];

    for (const spec of specs) {
        const [user] = await db.select().from(legacyUsers).where(eq(legacyUsers.email, spec.email)).limit(1);
        if (!user) continue;

        await db.delete(userCosmetics).where(eq(userCosmetics.userId, user.id));
        await db.delete(userEquippedCosmetics).where(eq(userEquippedCosmetics.userId, user.id));

        const items = await db
            .select()
            .from(cosmeticItems)
            .where(inArray(cosmeticItems.code, spec.items));

        const byCode = new Map(items.map((item) => [item.code, item]));
        const inserted = [];

        for (const code of spec.items) {
            const item = byCode.get(code);
            if (!item) continue;
            inserted.push(item);
            await db.insert(userCosmetics).values({
                userId: user.id,
                cosmeticItemId: item.id,
                source: 'demo_seed',
                metadata: { demo: true },
            });
        }

        if (spec.equip) {
            const findItem = (code) => inserted.find((item) => item.code === code) ?? byCode.get(code);
            const equipped = spec.equipped || {};
            await db.insert(userEquippedCosmetics).values({
                userId: user.id,
                titleItemId: findItem(equipped.title || 'title-explorer')?.id ?? null,
                frameItemId: findItem(equipped.frame || 'frame-flame')?.id ?? null,
                themeItemId: findItem(equipped.theme || 'theme-forest')?.id ?? null,
                badgeItemId: findItem(equipped.badge || 'badge_comet')?.id ?? null,
            });
        }
    }

    console.log('Cosméticos de demo ajustados.');
}

async function main() {
    console.log('Iniciando setup da demo...');
    run('docker compose up -d postgres admin-back');
    run('npm run seed:demo --workspace=admin-back');
    await loginAndBootstrap();
    await seedDemoCosmeticLoadouts();
    console.log('Setup da demo concluído.');
}

main().catch((error) => {
    console.error(error);
    process.exit(1);
});
