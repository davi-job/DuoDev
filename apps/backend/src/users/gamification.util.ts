export const XP_RULE_CODES = {
    trailStarted: 'trail_started',
    lessonCompleted: 'lesson_completed',
    challengeCompleted: 'challenge_completed',
    quizCompleted: 'quiz_completed',
    quizPerfectBonus: 'quiz_perfect_bonus',
    streakLogged: 'streak_logged',
    trailCompleted: 'trail_completed',
} as const;

export const DEFAULT_XP_RULES: Record<string, number> = {
    [XP_RULE_CODES.trailStarted]: 10,
    [XP_RULE_CODES.lessonCompleted]: 20,
    [XP_RULE_CODES.challengeCompleted]: 35,
    [XP_RULE_CODES.quizCompleted]: 50,
    [XP_RULE_CODES.quizPerfectBonus]: 25,
    [XP_RULE_CODES.streakLogged]: 15,
    [XP_RULE_CODES.trailCompleted]: 100,
};

const DEFAULT_LEVEL_TITLES = [
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
    type: 'title' | 'frame' | 'theme' | 'badge';
};

export type GamificationMission = {
    id: string;
    definitionId?: string;
    label: string;
    description: string;
    icon: string;
    period: 'daily' | 'weekly';
    progress: number;
    target: number;
    status: 'pending' | 'completed' | 'claimed';
    reward?: string;
    claimable?: boolean;
    claimedAt?: string | null;
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
    lockedBadges: GamificationBadge[];
    unlockedCosmetics: CosmeticReward[];
    lockedCosmetics: CosmeticReward[];
    missions: GamificationMissionSnapshot;
};

export type LevelConfig = {
    baseXp: number;
    incrementPerLevel: number;
    titles?: string[];
};

export type RuntimeAchievementDefinition = {
    id: string;
    label: string;
    description: string;
    icon: string;
    rarity: string;
    active: boolean;
    criteria: Record<string, unknown>;
};

export type RuntimeCosmeticItem = {
    id: string;
    label: string;
    description: string | null;
    type: string;
    rarity: string;
    active: boolean;
    unlockCondition: Record<string, unknown>;
};

export type RuntimeMissionDefinition = {
    id: string;
    label: string;
    description: string | null;
    icon: string;
    period: string;
    targetType: string;
    targetValue: number;
    active: boolean;
    criteria: Record<string, unknown>;
    rewardPayload?: Record<string, unknown>;
};

export type GamificationMetrics = {
    xp: number;
    streakCurrent: number;
    streakBest: number;
    startedTrails: number;
    completedTrails: number;
    accuracy: number;
    streakLogs: Array<{ dataRegistro: string; concluido: boolean }>;
    progressTrails: Array<{ startedAt?: Date; updatedAt?: Date }>;
};

const DEFAULT_ACHIEVEMENTS: RuntimeAchievementDefinition[] = [
    {
        id: 'xp-starter',
        label: 'Primeiros 100 XP',
        description: 'Você transformou estudo em progresso real.',
        icon: '✨',
        rarity: 'comum',
        active: true,
        criteria: { xpGte: 100 },
    },
    {
        id: 'streak-3',
        label: 'Constância Inicial',
        description: 'Manteve 3 dias seguidos de estudo.',
        icon: '🔥',
        rarity: 'comum',
        active: true,
        criteria: { streakBestGte: 3 },
    },
    {
        id: 'streak-7',
        label: 'Ritmo Forte',
        description: 'Alcançou uma streak de 7 dias.',
        icon: '🚀',
        rarity: 'raro',
        active: true,
        criteria: { streakBestGte: 7 },
    },
    {
        id: 'streak-14',
        label: 'Constância Elite',
        description: 'Manteve 14 dias seguidos de estudo.',
        icon: '🌟',
        rarity: 'epico',
        active: true,
        criteria: { streakBestGte: 14 },
    },
    {
        id: 'explorer',
        label: 'Explorador de Trilhas',
        description: 'Iniciou pelo menos 3 trilhas.',
        icon: '🧭',
        rarity: 'comum',
        active: true,
        criteria: { startedTrailsGte: 3 },
    },
    {
        id: 'trail-finisher',
        label: 'Trilha Concluída',
        description: 'Finalizou sua primeira trilha publicada.',
        icon: '🏁',
        rarity: 'incomum',
        active: true,
        criteria: { completedTrailsGte: 1 },
    },
    {
        id: 'trail-master',
        label: 'Mestre das Trilhas',
        description: 'Concluiu 3 trilhas completas.',
        icon: '🏆',
        rarity: 'epico',
        active: true,
        criteria: { completedTrailsGte: 3 },
    },
    {
        id: 'sharp-solver',
        label: 'Resposta Afiada',
        description: 'Manteve 80% ou mais de acerto geral.',
        icon: '🎯',
        rarity: 'raro',
        active: true,
        criteria: { accuracyGte: 80 },
    },
    {
        id: 'study-week-5',
        label: 'Ritmo da Semana',
        description: 'Estudou em 5 dias diferentes na semana.',
        icon: '📅',
        rarity: 'incomum',
        active: true,
        criteria: { studiedDaysThisWeekGte: 5 },
    },
    {
        id: 'trail-starter-week',
        label: 'Explorador Incansável',
        description: 'Iniciou 5 trilhas na semana.',
        icon: '🚀',
        rarity: 'raro',
        active: true,
        criteria: { startedTrailsThisWeekGte: 5 },
    },
    {
        id: 'completion-week-2',
        label: 'Finalizador da Semana',
        description: 'Concluiu 2 trilhas completas.',
        icon: '✅',
        rarity: 'incomum',
        active: true,
        criteria: { completedTrailsGte: 2 },
    },
];

const DEFAULT_COSMETICS: RuntimeCosmeticItem[] = [
    {
        id: 'title-explorer',
        label: 'Título: Explorador',
        description: 'Exibido no perfil ao alcançar 150 XP.',
        type: 'titulo',
        rarity: 'comum',
        active: true,
        unlockCondition: { xpGte: 150 },
    },
    {
        id: 'title-builder',
        label: 'Título: Builder',
        description: 'Exibido no perfil ao atingir 400 XP.',
        type: 'titulo',
        rarity: 'incomum',
        active: true,
        unlockCondition: { xpGte: 400 },
    },
    {
        id: 'title-mentor',
        label: 'Título: Mentor',
        description: 'Exibido no perfil ao atingir 800 XP.',
        type: 'titulo',
        rarity: 'raro',
        active: true,
        unlockCondition: { xpGte: 800 },
    },
    {
        id: 'title-architect',
        label: 'Título: Arquiteto',
        description: 'Exibido no perfil ao atingir 1200 XP.',
        type: 'titulo',
        rarity: 'epico',
        active: true,
        unlockCondition: { xpGte: 1200 },
    },
    {
        id: 'frame-flame',
        label: 'Moldura: Chama Viva',
        description: 'Desbloqueada ao manter 7 dias seguidos de estudo.',
        type: 'moldura',
        rarity: 'raro',
        active: true,
        unlockCondition: { streakCurrentGte: 7 },
    },
    {
        id: 'frame-emerald',
        label: 'Moldura: Esmeralda',
        description: 'Desbloqueada ao concluir 3 trilhas.',
        type: 'moldura',
        rarity: 'incomum',
        active: true,
        unlockCondition: { completedTrailsGte: 3 },
    },
    {
        id: 'frame-orbit',
        label: 'Moldura: Órbita',
        description: 'Desbloqueada ao manter 90% ou mais de acerto.',
        type: 'moldura',
        rarity: 'epico',
        active: true,
        unlockCondition: { accuracyGte: 90 },
    },
    {
        id: 'theme-forest',
        label: 'Tema: Floresta Duo',
        description: 'Tema de perfil desbloqueado ao concluir 2 trilhas.',
        type: 'tema',
        rarity: 'incomum',
        active: true,
        unlockCondition: { completedTrailsGte: 2 },
    },
    {
        id: 'theme-night',
        label: 'Tema: Noite Duo',
        description: 'Tema de perfil desbloqueado ao manter 80% de acerto.',
        type: 'tema',
        rarity: 'raro',
        active: true,
        unlockCondition: { accuracyGte: 80 },
    },
    {
        id: 'theme-dawn',
        label: 'Tema: Amanhecer',
        description: 'Tema de perfil desbloqueado ao estudar 5 dias na semana.',
        type: 'tema',
        rarity: 'epico',
        active: true,
        unlockCondition: { studiedDaysThisWeekGte: 5 },
    },
    {
        id: 'badge-comet',
        label: 'Selo: Cometa',
        description: 'Selo decorativo liberado ao iniciar muitas trilhas na semana.',
        type: 'badge',
        rarity: 'comum',
        active: true,
        unlockCondition: { startedTrailsThisWeekGte: 3 },
    },
    {
        id: 'badge-guardian',
        label: 'Selo: Guardião',
        description: 'Selo decorativo liberado ao manter 14 dias de constância.',
        type: 'badge',
        rarity: 'epico',
        active: true,
        unlockCondition: { streakBestGte: 14 },
    },
];

const DEFAULT_MISSIONS: RuntimeMissionDefinition[] = [
    {
        id: 'study-today',
        label: 'Registrar estudo hoje',
        description: 'Marque pelo menos uma sessão de estudo no dia.',
        icon: '🗓️',
        period: 'diaria',
        targetType: 'study_today',
        targetValue: 1,
        active: true,
        criteria: {},
    },
    {
        id: 'trail-today',
        label: 'Avançar em uma trilha',
        description: 'Mantenha uma trilha em movimento hoje.',
        icon: '📚',
        period: 'diaria',
        targetType: 'updated_trails_today',
        targetValue: 1,
        active: true,
        criteria: {},
    },
    {
        id: 'streak-three',
        label: 'Proteger streak de 3 dias',
        description: 'Construa consistência até o terceiro dia seguido.',
        icon: '🔥',
        period: 'diaria',
        targetType: 'streak_current',
        targetValue: 3,
        active: true,
        criteria: {},
    },
    {
        id: 'study-three-days',
        label: 'Estudar em 3 dias da semana',
        description: 'Espalhe o ritmo de estudo pela semana.',
        icon: '📅',
        period: 'semanal',
        targetType: 'study_days_this_week',
        targetValue: 3,
        active: true,
        criteria: {},
    },
    {
        id: 'start-trail-week',
        label: 'Iniciar uma nova trilha',
        description: 'Abra uma frente nova de aprendizado na semana.',
        icon: '🧭',
        period: 'semanal',
        targetType: 'started_trails_this_week',
        targetValue: 1,
        active: true,
        criteria: {},
    },
    {
        id: 'touch-two-trails',
        label: 'Movimentar 2 trilhas',
        description: 'Mostre progresso em pelo menos duas trilhas nesta semana.',
        icon: '🚀',
        period: 'semanal',
        targetType: 'updated_trails_this_week',
        targetValue: 2,
        active: true,
        criteria: {},
    },
];

function normalizeLevelConfig(config?: Partial<LevelConfig>): LevelConfig {
    return {
        baseXp: Math.max(1, Number(config?.baseXp ?? 100)),
        incrementPerLevel: Math.max(0, Number(config?.incrementPerLevel ?? 50)),
        titles: config?.titles?.length ? config.titles : [...DEFAULT_LEVEL_TITLES],
    };
}

function xpRequiredForLevel(level: number, config?: Partial<LevelConfig>) {
    const runtime = normalizeLevelConfig(config);
    if (level <= 1) {
        return 0;
    }

    let total = 0;
    for (let currentLevel = 1; currentLevel < level; currentLevel++) {
        total += runtime.baseXp + (currentLevel - 1) * runtime.incrementPerLevel;
    }

    return total;
}

export function buildLevelSnapshot(xp: number, config?: Partial<LevelConfig>) {
    const safeXp = Math.max(0, xp);
    const runtime = normalizeLevelConfig(config);
    let level = 1;

    while (safeXp >= xpRequiredForLevel(level + 1, runtime)) {
        level++;
    }

    const currentLevelXp = xpRequiredForLevel(level, runtime);
    const nextLevelXp = xpRequiredForLevel(level + 1, runtime);
    const xpIntoLevel = safeXp - currentLevelXp;
    const xpForNextLevel = nextLevelXp - currentLevelXp;
    const progressPct =
        xpForNextLevel <= 0 ? 100 : Math.min(100, Math.round((xpIntoLevel / xpForNextLevel) * 100));

    return {
        level,
        title: runtime.titles![Math.min(level - 1, runtime.titles!.length - 1)],
        currentLevelXp,
        nextLevelXp,
        xpIntoLevel,
        xpForNextLevel,
        progressPct,
    };
}

export function buildGamificationSnapshot(
    params: GamificationMetrics & {
        levelConfig?: Partial<LevelConfig>;
        achievementDefinitions?: RuntimeAchievementDefinition[];
        cosmeticItems?: RuntimeCosmeticItem[];
        missionDefinitions?: RuntimeMissionDefinition[];
    },
) {
    const missionMetrics = buildMissionMetrics(params);
    const level = buildLevelSnapshot(params.xp, params.levelConfig);
    const unlockedBadges = buildUnlockedBadges(
        params,
        params.achievementDefinitions ?? DEFAULT_ACHIEVEMENTS,
        missionMetrics,
    );
    const lockedBadges = buildLockedBadges(
        params,
        params.achievementDefinitions ?? DEFAULT_ACHIEVEMENTS,
        missionMetrics,
    );
    const unlockedCosmetics = buildUnlockedCosmetics(
        params,
        params.cosmeticItems ?? DEFAULT_COSMETICS,
        missionMetrics,
    );
    const lockedCosmetics = buildLockedCosmetics(
        params,
        params.cosmeticItems ?? DEFAULT_COSMETICS,
        missionMetrics,
    );
    const missions = buildMissionSnapshot(params.missionDefinitions ?? DEFAULT_MISSIONS, missionMetrics);

    return {
        xp: params.xp,
        ...level,
        unlockedBadges,
        lockedBadges,
        unlockedCosmetics,
        lockedCosmetics,
        missions,
    } satisfies GamificationSnapshot;
}

function buildMissionMetrics(params: GamificationMetrics) {
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

    return {
        ...params,
        studiedToday,
        studiedDaysThisWeek,
        updatedTrailsToday,
        updatedTrailsThisWeek,
        startedTrailsThisWeek,
    };
}

function buildMissionSnapshot(
    definitions: RuntimeMissionDefinition[],
    metrics: ReturnType<typeof buildMissionMetrics>,
) {
    const missions = definitions
        .filter((mission) => mission.active)
        .filter((mission) => mission.period === 'diaria' || mission.period === 'semanal')
        .map((mission) => {
            const target = Math.max(1, Number(mission.targetValue ?? 1));
            const progress = Math.min(target, resolveMissionProgress(mission.targetType, metrics));

            return {
                id: mission.id,
                label: mission.label,
                description: mission.description ?? '',
                icon: mission.icon || '🎯',
                period: mission.period === 'diaria' ? 'daily' : 'weekly',
                progress,
                target,
                status: progress >= target ? 'completed' : 'pending',
            } satisfies GamificationMission;
        });

    return {
        daily: missions.filter((mission) => mission.period === 'daily'),
        weekly: missions.filter((mission) => mission.period === 'weekly'),
    } satisfies GamificationMissionSnapshot;
}

function resolveMissionProgress(
    targetType: string,
    metrics: ReturnType<typeof buildMissionMetrics>,
) {
    switch (targetType) {
        case 'study_today':
            return metrics.studiedToday;
        case 'updated_trails_today':
            return metrics.updatedTrailsToday;
        case 'streak_current':
            return metrics.streakCurrent;
        case 'study_days_this_week':
            return metrics.studiedDaysThisWeek;
        case 'started_trails_this_week':
            return metrics.startedTrailsThisWeek;
        case 'updated_trails_this_week':
            return metrics.updatedTrailsThisWeek;
        case 'completed_trails':
            return metrics.completedTrails;
        default:
            return 0;
    }
}

function buildUnlockedBadges(
    params: GamificationMetrics,
    definitions: RuntimeAchievementDefinition[],
    missionMetrics: ReturnType<typeof buildMissionMetrics>,
) {
    return definitions
        .filter((definition) => definition.active)
        .filter((definition) => matchesCriteria(definition.criteria, params, missionMetrics))
        .map((definition) => ({
            id: definition.id,
            label: definition.label,
            description: definition.description,
            icon: definition.icon || '🏅',
            tone: toneFromRarity(definition.rarity),
        })) satisfies GamificationBadge[];
}

function buildLockedBadges(
    params: GamificationMetrics,
    definitions: RuntimeAchievementDefinition[],
    missionMetrics: ReturnType<typeof buildMissionMetrics>,
) {
    return definitions
        .filter((definition) => definition.active)
        .filter((definition) => !matchesCriteria(definition.criteria, params, missionMetrics))
        .map((definition) => ({
            id: definition.id,
            label: definition.label,
            description: definition.description,
            icon: definition.icon || '🏅',
            tone: toneFromRarity(definition.rarity),
        })) satisfies GamificationBadge[];
}

function buildUnlockedCosmetics(
    params: GamificationMetrics,
    cosmetics: RuntimeCosmeticItem[],
    missionMetrics: ReturnType<typeof buildMissionMetrics>,
) {
    return cosmetics
        .filter((cosmetic) => cosmetic.active)
        .filter((cosmetic) => matchesCriteria(cosmetic.unlockCondition, params, missionMetrics))
        .map((cosmetic) => ({
            id: cosmetic.id,
            label: cosmetic.label,
            description: cosmetic.description ?? 'Recompensa cosmética desbloqueada.',
            type: cosmeticTypeToFrontend(cosmetic.type),
        })) satisfies CosmeticReward[];
}

function buildLockedCosmetics(
    params: GamificationMetrics,
    cosmetics: RuntimeCosmeticItem[],
    missionMetrics: ReturnType<typeof buildMissionMetrics>,
) {
    return cosmetics
        .filter((cosmetic) => cosmetic.active)
        .filter((cosmetic) => !matchesCriteria(cosmetic.unlockCondition, params, missionMetrics))
        .map((cosmetic) => ({
            id: cosmetic.id,
            label: cosmetic.label,
            description: cosmetic.description ?? 'Recompensa cosmética bloqueada.',
            type: cosmeticTypeToFrontend(cosmetic.type),
        })) satisfies CosmeticReward[];
}

function matchesCriteria(
    criteria: Record<string, unknown> | undefined,
    params: GamificationMetrics,
    missionMetrics: ReturnType<typeof buildMissionMetrics>,
) {
    if (!criteria || Object.keys(criteria).length === 0) {
        return true;
    }

    const checks: Array<[number, string, 'gte' | 'lte' | 'gt' | 'lt' | 'eq']> = [
        [params.xp, 'xp', 'gte'],
        [params.streakCurrent, 'streakCurrent', 'gte'],
        [params.streakBest, 'streakBest', 'gte'],
        [params.startedTrails, 'startedTrails', 'gte'],
        [params.completedTrails, 'completedTrails', 'gte'],
        [params.accuracy, 'accuracy', 'gte'],
        [missionMetrics.studiedToday, 'studiedToday', 'gte'],
        [missionMetrics.studiedDaysThisWeek, 'studiedDaysThisWeek', 'gte'],
        [missionMetrics.updatedTrailsToday, 'updatedTrailsToday', 'gte'],
        [missionMetrics.updatedTrailsThisWeek, 'updatedTrailsThisWeek', 'gte'],
        [missionMetrics.startedTrailsThisWeek, 'startedTrailsThisWeek', 'gte'],
    ];

    return checks.every(([actual, prefix]) => {
        const gte = criteria[`${prefix}Gte`];
        const lte = criteria[`${prefix}Lte`];
        const gt = criteria[`${prefix}Gt`];
        const lt = criteria[`${prefix}Lt`];
        const eq = criteria[`${prefix}Eq`];

        if (gte !== undefined && actual < Number(gte)) return false;
        if (lte !== undefined && actual > Number(lte)) return false;
        if (gt !== undefined && actual <= Number(gt)) return false;
        if (lt !== undefined && actual >= Number(lt)) return false;
        if (eq !== undefined && actual !== Number(eq)) return false;
        return true;
    });
}

function toneFromRarity(rarity: string): GamificationBadge['tone'] {
    switch (rarity) {
        case 'lendario':
        case 'epico':
            return 'amber';
        case 'raro':
            return 'blue';
        case 'incomum':
            return 'orange';
        default:
            return 'green';
    }
}

function cosmeticTypeToFrontend(type: string): CosmeticReward['type'] {
    switch (type) {
        case 'titulo':
            return 'title';
        case 'moldura':
            return 'frame';
        case 'tema':
            return 'theme';
        case 'selo':
            return 'badge';
        default:
            return 'badge';
    }
}

export function getXpRulePoints(
    rules: Array<{ code: string; points: number; active?: boolean }> | undefined,
    code: string,
) {
    const rule = rules?.find((item) => item.code === code && item.active !== false);
    return rule?.points ?? DEFAULT_XP_RULES[code] ?? 0;
}
