import type { QuestionType } from '../types/types';

export interface UserTrailAPI {
    trail: TrailAPI;
    progressoPct: number;
    acertos?: number;
    erros?: number;
    startedAt?: string | Date;
    updatedAt?: string | Date;
}

export interface JwtPayload {
    sub: string;
    email: string;
    name?: string;
}

export interface TrailAPI {
    id: string;
    nome: string;
    nivel: string;
    totalHoras: number;
    ano: number;
}

export interface LearningCategorySummary {
    id: string;
    name: string;
    icon?: string | null;
    thumbColor: string;
}

export interface LearningContentCounts {
    lessons: number;
    questions: number;
    challenges: number;
}

export interface LearningTrailSummary {
    id: string;
    categoryId?: string | null;
    category?: LearningCategorySummary | null;
    name: string;
    level: string;
    description: string;
    duration?: string | null;
    totalHours?: number | null;
    year?: number | null;
    thumbColor: string;
    status: string;
    contentCounts: LearningContentCounts;
}

export interface LessonElement {
    id: string;
    type: 'texto' | 'imagem';
    content: string;
    order: number;
}

export interface LearningLessonItem {
    id: string;
    type: 'lesson';
    order: number;
    title: string;
    status: string;
    elements: LessonElement[];
}

export interface LearningQuestionItem {
    id: string;
    type: 'question';
    order: number;
    title: string;
    status: string;
    description: string | null;
    questionType: QuestionType;
    codeSnippet: string | null;
    sentence: string | null;
    blanks: string[];
    correctOrder: string[];
    alternatives: { id: string; text: string }[];
    answer: string;
}

export interface LearningChallengeItem {
    id: string;
    type: 'challenge';
    order: number;
    title: string;
    status: string;
    description: string | null;
    instructions: string | null;
}

export type LearningContentItem =
    | LearningLessonItem
    | LearningQuestionItem
    | LearningChallengeItem;

export interface LearningTrailContentResponse {
    trail: LearningTrailSummary;
    items: LearningContentItem[];
}

export interface StreakStats {
    sequenciaAtual: number;
    melhorSequencia: number;
}

export interface StreakLog {
    dataRegistro: string;
    concluido: boolean;
}

export interface GamificationBadge {
    id: string;
    label: string;
    description: string;
    icon: string;
    tone: 'green' | 'blue' | 'amber' | 'orange';
}

export interface CosmeticReward {
    id: string;
    code?: string;
    label: string;
    description: string;
    type: 'title' | 'frame' | 'theme' | 'badge';
    rarity?: string;
    source?: string;
    unlockedAt?: string;
    equipped?: boolean;
}

export interface GamificationSnapshot {
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
    inventory?: CosmeticReward[];
    equippedCosmetics?: {
        title: CosmeticReward | null;
        frame: CosmeticReward | null;
        theme: CosmeticReward | null;
        badge: CosmeticReward | null;
    };
    missions: {
        daily: GamificationMission[];
        weekly: GamificationMission[];
    };
    streakFreeze?: {
        balance: number;
        config: {
            enabled: boolean;
            maxGapDays: number;
            initialCharges: number;
        };
        recent: Array<{
            id: string;
            delta: number;
            source: string;
            reason: string | null;
            createdAt: string;
        }>;
    };
    notifications?: {
        unreadCount: number;
        items: GamificationNotification[];
    };
}

export interface GamificationNotification {
    id: string;
    type: 'nivel' | 'badge' | 'missao' | 'ranking' | 'recompensa' | 'streak' | 'sistema';
    title: string;
    body: string;
    payload: Record<string, unknown>;
    readAt: string | null;
    createdAt: string;
}

export interface GamificationMission {
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
}

export interface WeeklyLeaderboardEntry {
    rank: number;
    userId: string;
    name: string;
    xp: number;
    streakCurrent: number;
    weeklyScore: number;
    studyDays: number;
    trailMoves: number;
    trailStarts: number;
    completedTrails: number;
    isCurrentUser: boolean;
    equippedTitle?: string | null;
    equippedBadge?: string | null;
    equippedFrame?: string | null;
    equippedTheme?: string | null;
}

export interface WeeklyLeaderboardResponse {
    period: {
        label: string;
        startsAt: string;
        endsAt: string;
    };
    top: WeeklyLeaderboardEntry[];
    currentUser: WeeklyLeaderboardEntry | null;
    rewardTiers: WeeklyRewardTier[];
    currentUserReward: WeeklyRewardProjection | null;
}

export interface WeeklyRewardTier {
    id: string;
    label: string;
    placement: string;
    reward: string;
    cosmetic: string;
}

export interface WeeklyRewardProjection {
    tierId: string;
    label: string;
    reward: string;
    cosmetic: string;
}

export interface RankingUserDetail {
    id: string;
    name: string;
    avatarUrl?: string;
    xp: number;
    streakCurrent: number;
    streakBest: number;
    gamification: GamificationSnapshot;
}

export interface WeeklyRewardHistoryEntry {
    id: string;
    deliveryStatus: 'pendente' | 'entregue' | 'falhou';
    deliveredAt: string | null;
    createdAt: string;
    reward: string;
    cosmetic: string;
    rank: number | null;
    score: number | null;
    season: {
        id: string;
        label: string;
        startsAt: string | null;
        endsAt: string | null;
    } | null;
    rewardPayload: Record<string, unknown>;
}

export interface SeasonLeaderboardPodiumEntry {
    rank: number;
    userId: string;
    name: string;
    xp: number;
    streakCurrent: number;
    score: number;
    reward: string;
}

export interface SeasonLeaderboardHistoryEntry {
    id: string;
    code: string;
    label: string;
    period: 'diaria' | 'semanal' | 'sazonal';
    status: 'rascunho' | 'agendada' | 'ativa' | 'encerrada' | 'arquivada';
    startsAt: string;
    endsAt: string;
    participants: number;
    rewardCount: number;
    podium: SeasonLeaderboardPodiumEntry[];
    currentUser: SeasonLeaderboardPodiumEntry | null;
    currentUserReward: {
        deliveryStatus: 'pendente' | 'entregue' | 'falhou';
        deliveredAt: string | null;
        reward: string;
        cosmetic: string;
    } | null;
}

export interface SeasonLeaderboardHistoryResponse {
    currentSeason: SeasonLeaderboardHistoryEntry | null;
    seasons: SeasonLeaderboardHistoryEntry[];
}

export interface UserProfile {
    id: string;
    name: string;
    email: string;
    avatarUrl?: string;
    onboardingCompleted?: boolean;
    xp?: number;
    streakCurrent?: number;
    streakBest?: number;
    gamification?: GamificationSnapshot;
}

export interface BaseQuestion {
    id: string | number;
    type: QuestionType;
    question: string;
}

export interface MultipleChoiceQuestion extends BaseQuestion {
    type: 'multiple-choice';
    options: { label: string; text: string }[];
    correct: string; // label
}

export interface FillBlankQuestion extends BaseQuestion {
    type: 'fill-blank';
    blanks: string[]; // the words to arrange
    sentence: string; // full sentence with ___ placeholder
    correctOrder: string[]; // correct sequence
}

export interface CodeReadingQuestion extends BaseQuestion {
    type: 'code-reading';
    code: string;
    options: { label: string; text: string }[];
    correct: string;
}
