import { spawnSync } from 'child_process';
import { Client } from 'pg';
import { config } from 'dotenv';
import path from 'path';

config();

const ROOT = process.cwd();

function run(cmd: string, args: string[], cwd = ROOT, env?: NodeJS.ProcessEnv): void {
    console.log(`  > ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, {
        stdio: 'inherit',
        shell: true,
        cwd,
        env: { ...process.env, ...env },
    });
    if (result.status !== 0) {
        console.error(`Falhou com código ${result.status ?? 1}`);
        process.exit(result.status ?? 1);
    }
}

async function waitForDb(retries = 30, intervalMs = 2000): Promise<void> {
    for (let i = 1; i <= retries; i++) {
        const client = new Client({ connectionString: process.env.LOCAL_DATABASE_URL });
        try {
            await client.connect();
            await client.end();
            return;
        } catch {
            process.stdout.write(`\r  Tentativa ${i}/${retries}...`);
            await new Promise((r) => setTimeout(r, intervalMs));
        }
    }
    throw new Error('Banco de dados não ficou disponível no tempo esperado.');
}

async function main(): Promise<void> {
    console.log('\n[1/5] Compilando @duodev/db...');
    run('npm', ['run', 'build', '--workspace=packages/db']);

    console.log('\n[2/5] Reconstruindo imagens e subindo containers...');
    run('docker', ['compose', 'up', '--build', '-d']);

    console.log('\n[3/5] Aguardando banco de dados...');
    await waitForDb();
    console.log('\n  Banco pronto.');

    console.log('\n[4/5] Aplicando schema (db:migrate)...');
    run('npx', ['drizzle-kit', 'migrate'], path.join(ROOT, 'packages/db'), { DATABASE_URL: process.env.LOCAL_DATABASE_URL });

    console.log('\n[5/5] Criando dados de demonstração (seed)...');
    run(
        'npx',
        ['ts-node', '-r', 'tsconfig-paths/register', 'scripts/seed-demo.ts'],
        path.join(ROOT, 'apps/admin/admin-back'),
        { DATABASE_URL: process.env.LOCAL_DATABASE_URL },
    );

    console.log('\nAmbiente pronto. Exibindo logs (Ctrl+C para encerrar)...\n');
    run('docker', ['compose', 'logs', '-f', '--tail=100']);
}

main().catch((err: Error) => {
    console.error('\nErro no setup:', err.message);
    process.exit(1);
});
