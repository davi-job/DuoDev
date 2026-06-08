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
}) {
    const level = buildLevelSnapshot(params.xp);
    const unlockedBadges = buildUnlockedBadges(params);
    const unlockedCosmetics = buildUnlockedCosmetics(params);

    return {
        xp: params.xp,
        ...level,
        unlockedBadges,
        unlockedCosmetics,
    } satisfies GamificationSnapshot;
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
