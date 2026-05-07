import { NestFactory } from '@nestjs/core';
import { AppModule } from '../../app.module';
import { UsersService } from '../../users/users.service';
import { TrailService } from '../../trail/trail.service';
import { UserTrailService } from '../../user-trail/user-trail.service';
import { Trail } from '../../trail/trail.entity';
import * as bcrypt from 'bcrypt';

async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);

    const usersService = app.get(UsersService);
    const trailService = app.get(TrailService);
    const userTrailService = app.get(UserTrailService);

    console.log('🌱 Iniciando seeds...\n');

    // ─── 1. Criar usuário admin ───
    const hashedPassword = await bcrypt.hash('admin123', 10);

    let adminUser = await usersService.findOneByEmail('admin@trilhas.com');

    if (!adminUser) {
        adminUser = await usersService.create({
            name: 'Administrador',
            email: 'admin@trilhas.com',
            password: hashedPassword,
        });
        console.log('✅ Usuário admin criado:');
        console.log(`   Email: admin@trilhas.com`);
        console.log(`   Senha: admin123`);
        console.log(`   ID: ${adminUser.id}\n`);
    } else {
        console.log('⚠️  Usuário admin já existe\n');
    }

    // ─── 2. Criar trilhas ───
    const trilhasData = [
        {
            nome: 'JavaScript Fundamentals',
            nivel: 'Iniciante',
            duracao: '40h',
            totalHoras: 40,
            ano: 2024,
            corMiniatura: '#F7DF1E',
        },
        {
            nome: 'React.js Completo',
            nivel: 'Intermediário',
            duracao: '60h',
            totalHoras: 60,
            ano: 2024,
            corMiniatura: '#61DAFB',
        },
        {
            nome: 'Node.js Avançado',
            nivel: 'Avançado',
            duracao: '80h',
            totalHoras: 80,
            ano: 2024,
            corMiniatura: '#339933',
        },
        {
            nome: 'TypeScript Expert',
            nivel: 'Avançado',
            duracao: '50h',
            totalHoras: 50,
            ano: 2024,
            corMiniatura: '#3178C6',
        },
        {
            nome: 'Python',
            nivel: 'Intermediário',
            duracao: '70h',
            totalHoras: 70,
            ano: 2024,
            corMiniatura: '#3776AB',
        },
        {
            nome: 'Banco de Dados SQL',
            nivel: 'Iniciante',
            duracao: '30h',
            totalHoras: 30,
            ano: 2024,
            corMiniatura: '#336791',
        },
        {
            nome: 'Docker & Kubernetes',
            nivel: 'Avançado',
            duracao: '45h',
            totalHoras: 45,
            ano: 2024,
            corMiniatura: '#2496ED',
        },
        {
            nome: 'Git & GitHub',
            nivel: 'Iniciante',
            duracao: '20h',
            totalHoras: 20,
            ano: 2024,
            corMiniatura: '#F05032',
        },
        {
            nome: 'CSS Moderno & Tailwind',
            nivel: 'Intermediário',
            duracao: '35h',
            totalHoras: 35,
            ano: 2024,
            corMiniatura: '#06B6D4',
        },
        {
            nome: 'Testes Automatizados',
            nivel: 'Avançado',
            duracao: '40h',
            totalHoras: 40,
            ano: 2024,
            corMiniatura: '#E33332',
        },
    ];

    // Declarar o tipo explicitamente
    const trilhasCriadas: Trail[] = [];

    for (const trilhaData of trilhasData) {
        // Verificar se já existe
        const existingTrails = await trailService.findAll();
        const exists = existingTrails.find((t) => t.nome === trilhaData.nome);

        if (!exists) {
            const trilha = await trailService.create(trilhaData);
            trilhasCriadas.push(trilha);
            console.log(`✅ Trilha criada: ${trilha.nome} (${trilha.nivel})`);
        } else {
            trilhasCriadas.push(exists);
            console.log(`⚠️  Trilha já existe: ${exists.nome}`);
        }
    }

    console.log(`\n📚 Total de trilhas: ${trilhasCriadas.length}\n`);

    // ─── 3. Associar trilhas ao usuário admin com progressos variados ───
    const progressosUsuario = [
        { nomeTrilha: 'JavaScript Fundamentals', progressoPct: 85 },
        { nomeTrilha: 'React.js Completo', progressoPct: 60 },
        { nomeTrilha: 'Node.js Avançado', progressoPct: 30 },
        { nomeTrilha: 'TypeScript Expert', progressoPct: 100 },
        { nomeTrilha: 'Python', progressoPct: 45 },
        { nomeTrilha: 'Banco de Dados SQL', progressoPct: 100 },
        { nomeTrilha: 'Docker & Kubernetes', progressoPct: 10 },
        { nomeTrilha: 'Git & GitHub', progressoPct: 100 },
        { nomeTrilha: 'CSS Moderno & Tailwind', progressoPct: 75 },
        { nomeTrilha: 'Testes Automatizados', progressoPct: 0 },
    ];

    console.log('📊 Associando trilhas ao usuário admin...\n');

    for (const progresso of progressosUsuario) {
        const trilha = trilhasCriadas.find((t) => t.nome === progresso.nomeTrilha);

        if (trilha && adminUser) {
            try {
                await userTrailService.updateProgresso(adminUser.id, trilha.id, progresso.progressoPct);

                const status =
                    progresso.progressoPct >= 100
                        ? '✅ Concluído'
                        : progresso.progressoPct > 0
                          ? '🔄 Em progresso'
                          : '🆕 Não iniciado';

                console.log(`   ${progresso.nomeTrilha}: ${progresso.progressoPct}% - ${status}`);
            } catch (error: any) {
                console.error(`   ❌ Erro ao associar ${progresso.nomeTrilha}:`, error.message);
            }
        }
    }

    console.log('\n✨ Seeds executados com sucesso!');
    console.log('📧 Login: admin@trilhas.com');
    console.log('🔑 Senha: admin123\n');

    await app.close();
}

bootstrap().catch((error) => {
    console.error('❌ Erro ao executar seeds:', error);
    process.exit(1);
});
