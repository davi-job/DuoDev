export const XP_REWARDS = {
    trailStarted: 10,
    lessonCompleted: 20,
    challengeCompleted: 35,
    quizCompleted: 50,
    quizPerfectBonus: 25,
    streakLogged: 15,
    trailCompleted: 100,
} as const;

const LEVEL_TITLES = [
    'Aprendiz',
    'Explorador',
    'Builder',
    'Solver',
    'Mentor',
    'Arquiteto',
    'Lenda DuoDev',
] as const;

export type GamificationBadge = {
    id: string;
    label: string;
    description: string;
    icon: string;
    tone: 'green' | 'blue' | 'amber' | 'orange';
};

export type CosmeticReward = {
    id: string;
    label: string;
    description: string;
    type: 'title' | 'frame' | 'theme';
};

export type GamificationMission = {
    id: string;
    label: string;
    description: string;
    icon: string;
    period: 'daily' | 'weekly';
    progress: number;
    target: number;
    status: 'pending' | 'completed';
};

export type GamificationMissionSnapshot = {
    daily: GamificationMission[];
    weekly: GamificationMission[];
};

export type GamificationSnapshot = {
    xp: number;
    level: number;
    title: string;
    currentLevelXp: number;
    nextLevelXp: number;
    xpIntoLevel: number;
    xpForNextLevel: number;
    progressPct: number;
    unlockedBadges: GamificationBadge[];
    unlockedCosmetics: CosmeticReward[];
    missions: GamificationMissionSnapshot;
};

function xpRequiredForLevel(level: number): number {
    if (level <= 1) {
        return 0;
    }

    let total = 0;
    for (let currentLevel = 1; currentLevel < level; currentLevel++) {
        total += 100 + (currentLevel - 1) * 50;
    }

    return total;
}

export function buildLevelSnapshot(xp: number) {
    const safeXp = Math.max(0, xp);
    let level = 1;

    while (safeXp >= xpRequiredForLevel(level + 1)) {
        level++;
    }

    const currentLevelXp = xpRequiredForLevel(level);
    const nextLevelXp = xpRequiredForLevel(level + 1);
    const xpIntoLevel = safeXp - currentLevelXp;
    const xpForNextLevel = nextLevelXp - currentLevelXp;
    const progressPct =
        xpForNextLevel <= 0 ? 100 : Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

    return {
        level,
        title: LEVEL_TITLES[Math.min(level - 1, LEVEL_TITLES.length - 1)],
        currentLevelXp,
        nextLevelXp,
        xpIntoLevel,
        xpForNextLevel,
        progressPct,
    };
}

export function buildGamificationSnapshot(params: {
    xp: number;
    streakCurrent: number;
    streakBest: number;
    startedTrails: number;
    completedTrails: number;
    accuracy: number;
    streakLogs: Array<{ dataRegistro: string; concluido: boolean }>;
    progressTrails: Array<{ startedAt?: Date; updatedAt?: Date }>;
}) {
    const level = buildLevelSnapshot(params.xp);
    const unlockedBadges = buildUnlockedBadges(params);
    const unlockedCosmetics = buildUnlockedCosmetics(params);
    const missions = buildMissionSnapshot(params);

    return {
        xp: params.xp,
        ...level,
        unlockedBadges,
        unlockedCosmetics,
        missions,
    } satisfies GamificationSnapshot;
}

function buildMissionSnapshot(params: {
    streakCurrent: number;
    streakLogs: Array<{ dataRegistro: string; concluido: boolean }>;
    progressTrails: Array<{ startedAt?: Date; updatedAt?: Date }>;
}) {
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const weekThreshold = new Date(now);
    weekThreshold.setDate(now.getDate() - 6);

    const concludedLogs = params.streakLogs.filter((log) => log.concluido);
    const studiedToday = concludedLogs.some((log) => log.dataRegistro?.slice(0, 10) === todayIso) ? 1 : 0;
    const studiedDaysThisWeek = concludedLogs.filter((log) => {
        const logDate = new Date(log.dataRegistro);
        return logDate >= weekThreshold && logDate <= now;
    }).length;

    const updatedTrailsToday = params.progressTrails.filter((trail) => {
        if (!trail.updatedAt) return false;
        return trail.updatedAt.toISOString().slice(0, 10) === todayIso;
    }).length;

    const updatedTrailsThisWeek = params.progressTrails.filter((trail) => {
        if (!trail.updatedAt) return false;
        return trail.updatedAt >= weekThreshold && trail.updatedAt <= now;
    }).length;

    const startedTrailsThisWeek = params.progressTrails.filter((trail) => {
        if (!trail.startedAt) return false;
        return trail.startedAt >= weekThreshold && trail.startedAt <= now;
    }).length;

    const daily: GamificationMission[] = [
        createMission({
            id: 'study-today',
            label: 'Registrar estudo hoje',
            description: 'Marque pelo menos uma sessão de estudo no dia.',
            icon: '🗓️',
            period: 'daily',
            progress: studiedToday,
            target: 1,
        }),
        createMission({
            id: 'trail-today',
            label: 'Avançar em uma trilha',
            description: 'Mantenha uma trilha em movimento hoje.',
            icon: '📚',
            period: 'daily',
            progress: Math.min(updatedTrailsToday, 1),
            target: 1,
        }),
        createMission({
            id: 'streak-three',
            label: 'Proteger streak de 3 dias',
            description: 'Construa consistência até o terceiro dia seguido.',
            icon: '🔥',
            period: 'daily',
            progress: Math.min(params.streakCurrent, 3),
            target: 3,
        }),
    ];

    const weekly: GamificationMission[] = [
        createMission({
            id: 'study-three-days',
            label: 'Estudar em 3 dias da semana',
            description: 'Espalhe o ritmo de estudo pela semana.',
            icon: '📅',
            period: 'weekly',
            progress: Math.min(studiedDaysThisWeek, 3),
            target: 3,
        }),
        createMission({
            id: 'start-trail-week',
            label: 'Iniciar uma nova trilha',
            description: 'Abra uma frente nova de aprendizado na semana.',
            icon: '🧭',
            period: 'weekly',
            progress: Math.min(startedTrailsThisWeek, 1),
            target: 1,
        }),
        createMission({
            id: 'touch-two-trails',
            label: 'Movimentar 2 trilhas',
            description: 'Mostre progresso em pelo menos duas trilhas nesta semana.',
            icon: '🚀',
            period: 'weekly',
            progress: Math.min(updatedTrailsThisWeek, 2),
            target: 2,
        }),
    ];

    return { daily, weekly } satisfies GamificationMissionSnapshot;
}

function createMission(input: Omit<GamificationMission, 'status'>) {
    return {
        ...input,
        status: input.progress >= input.target ? 'completed' : 'pending',
    } satisfies GamificationMission;
}

function buildUnlockedBadges(params: {
    xp: number;
    streakCurrent: number;
    streakBest: number;
    startedTrails: number;
    completedTrails: number;
    accuracy: number;
}) {
    const badges: GamificationBadge[] = [];

    if (params.xp >= 100) {
        badges.push({
            id: 'xp-starter',
            label: 'Primeiros 100 XP',
            description: 'Você transformou estudo em progresso real.',
            icon: '✨',
            tone: 'green',
        });
    }

    if (params.streakCurrent >= 3 || params.streakBest >= 3) {
        badges.push({
            id: 'streak-3',
            label: 'Constância Inicial',
            description: 'Manteve 3 dias seguidos de estudo.',
            icon: '🔥',
            tone: 'orange',
        });
    }

    if (params.streakBest >= 7) {
        badges.push({
            id: 'streak-7',
            label: 'Ritmo Forte',
            description: 'Alcançou uma streak de 7 dias.',
            icon: '🚀',
            tone: 'amber',
        });
    }

    if (params.startedTrails >= 3) {
        badges.push({
            id: 'explorer',
            label: 'Explorador de Trilhas',
            description: 'Iniciou pelo menos 3 trilhas.',
            icon: '🧭',
            tone: 'blue',
        });
    }

    if (params.completedTrails >= 1) {
        badges.push({
            id: 'trail-finisher',
            label: 'Trilha Concluída',
            description: 'Finalizou sua primeira trilha publicada.',
            icon: '🏁',
            tone: 'green',
        });
    }

    if (params.completedTrails >= 3) {
        badges.push({
            id: 'trail-master',
            label: 'Mestre das Trilhas',
            description: 'Concluiu 3 trilhas completas.',
            icon: '🏆',
            tone: 'amber',
        });
    }

    if (params.accuracy >= 80) {
        badges.push({
            id: 'sharp-solver',
            label: 'Resposta Afiada',
            description: 'Manteve 80% ou mais de acerto geral.',
            icon: '🎯',
            tone: 'blue',
        });
    }

    return badges;
}

function buildUnlockedCosmetics(params: {
    xp: number;
    streakCurrent: number;
    completedTrails: number;
}) {
    const cosmetics: CosmeticReward[] = [];

    if (params.xp >= 150) {
        cosmetics.push({
            id: 'title-explorer',
            label: 'Título: Explorador',
            description: 'Exibido no perfil ao alcançar 150 XP.',
            type: 'title',
        });
    }

    if (params.streakCurrent >= 7) {
        cosmetics.push({
            id: 'frame-flame',
            label: 'Moldura: Chama Viva',
            description: 'Desbloqueada ao manter 7 dias seguidos de estudo.',
            type: 'frame',
        });
    }

    if (params.completedTrails >= 2) {
        cosmetics.push({
            id: 'theme-forest',
            label: 'Tema: Floresta Duo',
            description: 'Tema de perfil desbloqueado ao concluir 2 trilhas.',
            type: 'theme',
        });
    }

    return cosmetics;
}
