import { BadRequestException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { and, asc, desc, eq, gte, lte, sql } from 'drizzle-orm';
import {
    achievementDefinitions,
    adaptiveReviewRules,
    cosmeticItems,
    gamificationConfigs,
    inAppNotifications,
    leaderboardSeasons,
    leaderboardSnapshots,
    legacyUsers,
    missionDefinitions,
    rewardTiers,
    streakLogs,
    userCosmetics,
    userTrails,
    weeklyRewards,
    xpRules,
    type DB,
} from '@duodev/db';

@Injectable()
export class GamificationService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async getOverview() {
        const [
            configs,
            rules,
            achievements,
            cosmetics,
            missions,
            seasons,
            rewards,
            adaptiveRules,
        ] = await Promise.all([
            this.listConfigs(),
            this.listXpRules(),
            this.listAchievements(),
            this.listCosmetics(),
            this.listMissions(),
            this.listSeasons(),
            this.listRewardTiers(),
            this.listAdaptiveRules(),
        ]);

        return {
            configs,
            xpRules: rules,
            achievements,
            cosmetics,
            missions,
            seasons,
            rewardTiers: rewards,
            adaptiveReviewRules: adaptiveRules,
        };
    }

    async bootstrapDefaults() {
        const now = new Date();
        const seasonStartsAt = new Date(now);
        seasonStartsAt.setHours(0, 0, 0, 0);
        seasonStartsAt.setDate(seasonStartsAt.getDate() - seasonStartsAt.getDay());

        const seasonEndsAt = new Date(seasonStartsAt);
        seasonEndsAt.setDate(seasonStartsAt.getDate() + 6);
        seasonEndsAt.setHours(23, 59, 59, 999);

        await this.insertIfMissing(gamificationConfigs, 'key', [
            {
                key: 'level_curve',
                label: 'Curva de nível',
                description: 'Configura a progressão base do nível do aluno.',
                value: { baseXp: 100, incrementPerLevel: 50 },
            },
            {
                key: 'streak_policy',
                label: 'Política de streak',
                description: 'Define regras de proteção e perda de streak.',
                value: { freezeEnabled: true, defaultFreezesPerWeek: 1, maxGapDays: 1 },
            },
            {
                key: 'leaderboard_scoring',
                label: 'Pesos do ranking semanal',
                description: 'Fórmula usada para score semanal.',
                value: {
                    studyDayWeight: 40,
                    trailMoveWeight: 18,
                    trailStartWeight: 22,
                    completedTrailWeight: 60,
                    streakBonusWeight: 12,
                },
            },
        ]);

        await this.insertIfMissing(xpRules, 'code', [
            { code: 'trail_started', label: 'Início de trilha', description: 'Usuário iniciou uma trilha', points: 10 },
            { code: 'lesson_completed', label: 'Aula concluída', description: 'Usuário concluiu uma aula', points: 20 },
            { code: 'challenge_completed', label: 'Desafio concluído', description: 'Usuário concluiu um desafio', points: 35 },
            { code: 'quiz_completed', label: 'Quiz finalizado', description: 'Usuário finalizou um quiz', points: 50 },
            { code: 'quiz_perfect_bonus', label: 'Bônus de quiz perfeito', description: 'Quiz sem erros', points: 25 },
            { code: 'streak_logged', label: 'Streak registrada', description: 'Sessão diária registrada', points: 15 },
            { code: 'trail_completed', label: 'Trilha concluída', description: 'Usuário concluiu uma trilha', points: 100 },
        ]);

        await this.insertIfMissing(achievementDefinitions, 'code', [
            {
                code: 'xp_starter',
                label: 'Primeiros 100 XP',
                description: 'Você transformou estudo em progresso real.',
                icon: '✨',
                rarity: 'comum',
                criteria: { xpGte: 100 },
                rewardPayload: {},
            },
            {
                code: 'streak_3',
                label: 'Constância Inicial',
                description: 'Manteve 3 dias seguidos de estudo.',
                icon: '🔥',
                rarity: 'comum',
                criteria: { streakBestGte: 3 },
                rewardPayload: {},
            },
            {
                code: 'streak_7',
                label: 'Ritmo Forte',
                description: 'Alcançou uma streak de 7 dias.',
                icon: '🚀',
                rarity: 'raro',
                criteria: { streakBestGte: 7 },
                rewardPayload: { cosmeticCode: 'frame_flame' },
            },
            {
                code: 'streak_14',
                label: 'Constância Elite',
                description: 'Manteve 14 dias seguidos de estudo.',
                icon: '🌟',
                rarity: 'epico',
                criteria: { streakBestGte: 14 },
                rewardPayload: {},
            },
            {
                code: 'explorer',
                label: 'Explorador de Trilhas',
                description: 'Iniciou pelo menos 3 trilhas.',
                icon: '🧭',
                rarity: 'comum',
                criteria: { startedTrailsGte: 3 },
                rewardPayload: {},
            },
            {
                code: 'trail_finisher',
                label: 'Trilha Concluída',
                description: 'Finalizou sua primeira trilha publicada.',
                icon: '🏁',
                rarity: 'incomum',
                criteria: { completedTrailsGte: 1 },
                rewardPayload: {},
            },
            {
                code: 'trail_master',
                label: 'Mestre das Trilhas',
                description: 'Concluiu 3 trilhas completas.',
                icon: '🏆',
                rarity: 'epico',
                criteria: { completedTrailsGte: 3 },
                rewardPayload: {},
            },
            {
                code: 'sharp_solver',
                label: 'Resposta Afiada',
                description: 'Manteve 80% ou mais de acerto geral.',
                icon: '🎯',
                rarity: 'raro',
                criteria: { accuracyGte: 80 },
                rewardPayload: {},
            },
            {
                code: 'study_week_5',
                label: 'Ritmo da Semana',
                description: 'Estudou em 5 dias diferentes na semana.',
                icon: '📅',
                rarity: 'incomum',
                criteria: { studiedDaysThisWeekGte: 5 },
                rewardPayload: {},
            },
            {
                code: 'trail_starter_week',
                label: 'Explorador Incansável',
                description: 'Iniciou 5 trilhas na semana.',
                icon: '🚀',
                rarity: 'raro',
                criteria: { startedTrailsThisWeekGte: 5 },
                rewardPayload: {},
            },
            {
                code: 'completion_week_2',
                label: 'Finalizador da Semana',
                description: 'Concluiu 2 trilhas completas.',
                icon: '✅',
                rarity: 'incomum',
                criteria: { completedTrailsGte: 2 },
                rewardPayload: {},
            },
        ]);

        await this.insertIfMissing(cosmeticItems, 'code', [
            {
                code: 'title_explorer',
                label: 'Título: Explorador',
                description: 'Título liberado ao atingir marcos iniciais.',
                type: 'titulo',
                rarity: 'comum',
                preview: { text: 'Explorador' },
                unlockCondition: { xpGte: 150 },
            },
            {
                code: 'title_builder',
                label: 'Título: Builder',
                description: 'Título liberado ao atingir 400 XP.',
                type: 'titulo',
                rarity: 'incomum',
                preview: { text: 'Builder' },
                unlockCondition: { xpGte: 400 },
            },
            {
                code: 'title_mentor',
                label: 'Título: Mentor',
                description: 'Título liberado ao atingir 800 XP.',
                type: 'titulo',
                rarity: 'raro',
                preview: { text: 'Mentor' },
                unlockCondition: { xpGte: 800 },
            },
            {
                code: 'title_architect',
                label: 'Título: Arquiteto',
                description: 'Título liberado ao atingir 1200 XP.',
                type: 'titulo',
                rarity: 'epico',
                preview: { text: 'Arquiteto' },
                unlockCondition: { xpGte: 1200 },
            },
            {
                code: 'frame_flame',
                label: 'Moldura: Chama Viva',
                description: 'Moldura liberada ao manter ritmo forte.',
                type: 'moldura',
                rarity: 'raro',
                preview: { gradient: ['#ff9a3c', '#ff5c36'] },
                unlockCondition: { streakBestGte: 7 },
            },
            {
                code: 'frame_emerald',
                label: 'Moldura: Esmeralda',
                description: 'Moldura liberada ao concluir 3 trilhas.',
                type: 'moldura',
                rarity: 'incomum',
                preview: { gradient: ['#5fd18b', '#1b7f54'] },
                unlockCondition: { completedTrailsGte: 3 },
            },
            {
                code: 'frame_orbit',
                label: 'Moldura: Órbita',
                description: 'Moldura liberada ao manter 90% ou mais de acerto.',
                type: 'moldura',
                rarity: 'epico',
                preview: { gradient: ['#8d9cff', '#5e72ff'] },
                unlockCondition: { accuracyGte: 90 },
            },
            {
                code: 'theme_forest',
                label: 'Tema: Floresta Duo',
                description: 'Tema visual do perfil.',
                type: 'tema',
                rarity: 'incomum',
                preview: { background: '#eef7e9' },
                unlockCondition: { completedTrailsGte: 2 },
            },
            {
                code: 'theme_night',
                label: 'Tema: Noite Duo',
                description: 'Tema visual desbloqueado com 80% ou mais de acerto.',
                type: 'tema',
                rarity: 'raro',
                preview: { background: '#e9eefc' },
                unlockCondition: { accuracyGte: 80 },
            },
            {
                code: 'theme_dawn',
                label: 'Tema: Amanhecer',
                description: 'Tema visual desbloqueado ao estudar 5 dias na semana.',
                type: 'tema',
                rarity: 'epico',
                preview: { background: '#fff3da' },
                unlockCondition: { studiedDaysThisWeekGte: 5 },
            },
            {
                code: 'badge_comet',
                label: 'Selo: Cometa',
                description: 'Selo decorativo liberado ao iniciar trilhas na semana.',
                type: 'selo',
                rarity: 'comum',
                preview: { text: '☄️' },
                unlockCondition: { startedTrailsThisWeekGte: 3 },
            },
            {
                code: 'badge_guardian',
                label: 'Selo: Guardião',
                description: 'Selo decorativo liberado ao manter 14 dias de constância.',
                type: 'selo',
                rarity: 'epico',
                preview: { text: '🛡️' },
                unlockCondition: { streakBestGte: 14 },
            },
        ]);

        await this.insertIfMissing(missionDefinitions, 'code', [
            {
                code: 'study_today',
                label: 'Registrar estudo hoje',
                description: 'Marque pelo menos uma sessão de estudo no dia.',
                icon: '🗓️',
                period: 'diaria',
                targetType: 'study_sessions',
                targetValue: 1,
                criteria: { source: 'streak_log' },
                rewardPayload: { xp: 20 },
            },
            {
                code: 'study_three_days',
                label: 'Estudar em 3 dias da semana',
                description: 'Espalhe o ritmo de estudo pela semana.',
                icon: '📅',
                period: 'semanal',
                targetType: 'study_days',
                targetValue: 3,
                criteria: { source: 'streak_log' },
                rewardPayload: { xp: 60 },
            },
        ]);

        await this.insertIfMissing(adaptiveReviewRules, 'code', [
            {
                code: 'low_accuracy_trail',
                label: 'Trilha com baixa precisão',
                description: 'Sugere revisão quando a trilha tem precisão baixa.',
                criteria: { accuracyLt: 60, progressGt: 0 },
                recommendationPayload: { action: 'review_trail', priority: 'high' },
            },
        ]);

        const [season] = await this.insertIfMissing(leaderboardSeasons, 'code', [
            {
                code: 'weekly-default',
                label: 'Temporada Semanal Padrão',
                period: 'semanal',
                status: 'ativa',
                startsAt: seasonStartsAt,
                endsAt: seasonEndsAt,
                scoringRules: {
                    studyDayWeight: 40,
                    trailMoveWeight: 18,
                    trailStartWeight: 22,
                    completedTrailWeight: 60,
                    streakBonusWeight: 12,
                },
            },
        ]);

        if (season) {
            await this.insertIfMissing(rewardTiers, 'label', [
                {
                    seasonId: season.id,
                    label: 'Campeão da semana',
                    placementFrom: 1,
                    placementTo: 1,
                    rewardPayload: { xp: 450, cosmeticCode: 'frame_flame' },
                },
                {
                    seasonId: season.id,
                    label: 'Pódio da semana',
                    placementFrom: 2,
                    placementTo: 3,
                    rewardPayload: { xp: 250, badge: 'podio-semanal' },
                },
                {
                    seasonId: season.id,
                    label: 'Elite da semana',
                    placementFrom: 4,
                    placementTo: 10,
                    rewardPayload: { xp: 120, badge: 'elite-semanal' },
                },
            ]);
        }

        return this.getOverview();
    }

    listConfigs() {
        return this.listRows(gamificationConfigs);
    }

    createConfig(data: Record<string, any>) {
        return this.createRow(gamificationConfigs, data);
    }

    updateConfig(id: string, data: Record<string, any>) {
        return this.updateRow(gamificationConfigs, id, data);
    }

    deleteConfig(id: string) {
        return this.deleteRow(gamificationConfigs, id);
    }

    listXpRules() {
        return this.listRows(xpRules);
    }

    createXpRule(data: Record<string, any>) {
        return this.createRow(xpRules, data);
    }

    updateXpRule(id: string, data: Record<string, any>) {
        return this.updateRow(xpRules, id, data);
    }

    deleteXpRule(id: string) {
        return this.deleteRow(xpRules, id);
    }

    listAchievements() {
        return this.listRows(achievementDefinitions);
    }

    createAchievement(data: Record<string, any>) {
        return this.createRow(achievementDefinitions, data);
    }

    updateAchievement(id: string, data: Record<string, any>) {
        return this.updateRow(achievementDefinitions, id, data);
    }

    deleteAchievement(id: string) {
        return this.deleteRow(achievementDefinitions, id);
    }

    listCosmetics() {
        return this.listRows(cosmeticItems);
    }

    createCosmetic(data: Record<string, any>) {
        return this.createRow(cosmeticItems, data);
    }

    updateCosmetic(id: string, data: Record<string, any>) {
        return this.updateRow(cosmeticItems, id, data);
    }

    deleteCosmetic(id: string) {
        return this.deleteRow(cosmeticItems, id);
    }

    listMissions() {
        return this.listRows(missionDefinitions);
    }

    createMission(data: Record<string, any>) {
        return this.createRow(missionDefinitions, data);
    }

    updateMission(id: string, data: Record<string, any>) {
        return this.updateRow(missionDefinitions, id, data);
    }

    deleteMission(id: string) {
        return this.deleteRow(missionDefinitions, id);
    }

    listSeasons() {
        return this.listRows(leaderboardSeasons);
    }

    createSeason(data: Record<string, any>) {
        return this.createRow(leaderboardSeasons, data);
    }

    updateSeason(id: string, data: Record<string, any>) {
        return this.updateRow(leaderboardSeasons, id, data);
    }

    deleteSeason(id: string) {
        return this.deleteRow(leaderboardSeasons, id);
    }

    async settleSeason(id: string) {
        const season = await this.findRow(leaderboardSeasons, id);

        if (season.status === 'encerrada' || season.status === 'arquivada') {
            throw new BadRequestException('Esta temporada já foi encerrada.');
        }

        const [existingSnapshot] = await this.db
            .select({ id: leaderboardSnapshots.id })
            .from(leaderboardSnapshots)
            .where(eq(leaderboardSnapshots.seasonId, id))
            .limit(1);

        if (existingSnapshot) {
            throw new BadRequestException('Já existem snapshots salvos para esta temporada.');
        }

        const scoring = await this.getLeaderboardScoring(this.toObject(season.scoringRules));
        const rankings = await this.buildLeaderboardForSeasonWindow(season.startsAt, season.endsAt, scoring);
        const tiers = await this.db
            .select()
            .from(rewardTiers)
            .where(eq(rewardTiers.seasonId, id))
            .orderBy(asc(rewardTiers.placementFrom));

        const cosmeticCodes = tiers
            .map((tier) => this.getRewardCosmeticCode(tier.rewardPayload))
            .filter((code): code is string => Boolean(code));

        const cosmetics = cosmeticCodes.length
            ? await this.db.select().from(cosmeticItems).where(sql`${cosmeticItems.code} in ${cosmeticCodes}`)
            : [];

        const cosmeticsByCode = new Map(cosmetics.map((item) => [item.code, item]));

        let rewardedUsers = 0;
        let deliveredXp = 0;
        let deliveredCosmetics = 0;

        await this.db.transaction(async (tx) => {
            if (rankings.length) {
                await tx.insert(leaderboardSnapshots).values(
                    rankings.map((entry) => ({
                        seasonId: season.id,
                        userId: entry.userId,
                        rank: entry.rank,
                        score: entry.weeklyScore,
                        rewardSnapshot: this.buildRewardSnapshot(entry.rank, tiers),
                    })),
                );
            }

            for (const entry of rankings) {
                const tier = this.findRewardTier(entry.rank, tiers);
                if (!tier) {
                    continue;
                }

                rewardedUsers += 1;
                const rewardPayload = this.toObject(tier.rewardPayload);
                const xp = typeof rewardPayload.xp === 'number' ? rewardPayload.xp : 0;
                const cosmeticCode = this.getRewardCosmeticCode(rewardPayload);

                await tx.insert(weeklyRewards).values({
                    seasonId: season.id,
                    userId: entry.userId,
                    rewardPayload,
                    deliveryStatus: 'entregue',
                    deliveredAt: new Date(),
                });

                if (xp > 0) {
                    deliveredXp += xp;
                    await tx
                        .update(legacyUsers)
                        .set({
                            xp: sql`${legacyUsers.xp} + ${xp}`,
                        })
                        .where(eq(legacyUsers.id, entry.userId));
                }

                if (cosmeticCode) {
                    const cosmetic = cosmeticsByCode.get(cosmeticCode);
                    if (cosmetic) {
                        const [existingUserCosmetic] = await tx
                            .select({ id: userCosmetics.id })
                            .from(userCosmetics)
                            .where(
                                and(
                                    eq(userCosmetics.userId, entry.userId),
                                    eq(userCosmetics.cosmeticItemId, cosmetic.id),
                                ),
                            )
                            .limit(1);

                        if (!existingUserCosmetic) {
                            deliveredCosmetics += 1;
                            await tx.insert(userCosmetics).values({
                                userId: entry.userId,
                                cosmeticItemId: cosmetic.id,
                                source: 'weekly_reward',
                                metadata: { seasonId: season.id, tierId: tier.id },
                            });
                        }
                    }
                }

                await tx.insert(inAppNotifications).values({
                    userId: entry.userId,
                    type: 'ranking',
                    title: `Resultado da temporada: ${season.label}`,
                    body: this.buildRewardNotificationBody(tier.label, rewardPayload),
                    payload: {
                        seasonId: season.id,
                        seasonLabel: season.label,
                        rank: entry.rank,
                        reward: rewardPayload,
                    },
                });
            }

            await tx
                .update(leaderboardSeasons)
                .set({
                    status: 'encerrada',
                    updatedAt: new Date(),
                })
                .where(eq(leaderboardSeasons.id, season.id));
        });

        return {
            seasonId: season.id,
            seasonLabel: season.label,
            rankings: rankings.length,
            rewardedUsers,
            deliveredXp,
            deliveredCosmetics,
            status: 'encerrada',
        };
    }

    listRewardTiers() {
        return this.listRows(rewardTiers);
    }

    createRewardTier(data: Record<string, any>) {
        return this.createRow(rewardTiers, data);
    }

    updateRewardTier(id: string, data: Record<string, any>) {
        return this.updateRow(rewardTiers, id, data);
    }

    deleteRewardTier(id: string) {
        return this.deleteRow(rewardTiers, id);
    }

    listAdaptiveRules() {
        return this.listRows(adaptiveReviewRules);
    }

    createAdaptiveRule(data: Record<string, any>) {
        return this.createRow(adaptiveReviewRules, data);
    }

    updateAdaptiveRule(id: string, data: Record<string, any>) {
        return this.updateRow(adaptiveReviewRules, id, data);
    }

    deleteAdaptiveRule(id: string) {
        return this.deleteRow(adaptiveReviewRules, id);
    }

    private async buildLeaderboardForSeasonWindow(
        startsAt: Date,
        endsAt: Date,
        scoring: {
            studyDayWeight: number;
            trailMoveWeight: number;
            trailStartWeight: number;
            completedTrailWeight: number;
            streakBonusWeight: number;
        },
    ) {
        const users = await this.db
            .select({
                id: legacyUsers.id,
                name: legacyUsers.name,
                xp: legacyUsers.xp,
                streakCurrent: legacyUsers.streakCurrent,
            })
            .from(legacyUsers)
            .orderBy(asc(legacyUsers.name));

        const streakRows = await this.db
            .select({
                userId: streakLogs.userId,
                studyDays: sql<number>`count(*)`.mapWith(Number),
            })
            .from(streakLogs)
            .where(
                and(
                    eq(streakLogs.completed, true),
                    gte(streakLogs.logDate, startsAt.toISOString().slice(0, 10)),
                    lte(streakLogs.logDate, endsAt.toISOString().slice(0, 10)),
                ),
            )
            .groupBy(streakLogs.userId);

        const trailMoveRows = await this.db
            .select({
                userId: userTrails.userId,
                trailMoves: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(and(gte(userTrails.updatedAt, startsAt), lte(userTrails.updatedAt, endsAt)))
            .groupBy(userTrails.userId);

        const trailStartRows = await this.db
            .select({
                userId: userTrails.userId,
                trailStarts: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(and(gte(userTrails.startedAt, startsAt), lte(userTrails.startedAt, endsAt)))
            .groupBy(userTrails.userId);

        const completedTrailRows = await this.db
            .select({
                userId: userTrails.userId,
                completedTrails: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(
                and(
                    gte(userTrails.updatedAt, startsAt),
                    lte(userTrails.updatedAt, endsAt),
                    gte(userTrails.progressPct, 100),
                ),
            )
            .groupBy(userTrails.userId);

        const studyDaysByUser = new Map(streakRows.map((row) => [row.userId, row.studyDays]));
        const trailMovesByUser = new Map(trailMoveRows.map((row) => [row.userId, row.trailMoves]));
        const trailStartsByUser = new Map(trailStartRows.map((row) => [row.userId, row.trailStarts]));
        const completedTrailsByUser = new Map(
            completedTrailRows.map((row) => [row.userId, row.completedTrails]),
        );

        return users
            .map((user) => {
                const studyDays = studyDaysByUser.get(user.id) ?? 0;
                const trailMoves = trailMovesByUser.get(user.id) ?? 0;
                const trailStarts = trailStartsByUser.get(user.id) ?? 0;
                const completedTrails = completedTrailsByUser.get(user.id) ?? 0;
                const weeklyScore =
                    studyDays * scoring.studyDayWeight +
                    trailMoves * scoring.trailMoveWeight +
                    trailStarts * scoring.trailStartWeight +
                    completedTrails * scoring.completedTrailWeight +
                    Math.min(user.streakCurrent ?? 0, 7) * scoring.streakBonusWeight;

                return {
                    userId: user.id,
                    name: user.name?.trim() || 'Usuário',
                    xp: user.xp ?? 0,
                    streakCurrent: user.streakCurrent ?? 0,
                    weeklyScore,
                };
            })
            .filter((entry) => entry.weeklyScore > 0 || entry.xp > 0 || entry.streakCurrent > 0)
            .sort((a, b) => {
                if (b.weeklyScore !== a.weeklyScore) return b.weeklyScore - a.weeklyScore;
                if (b.xp !== a.xp) return b.xp - a.xp;
                if (b.streakCurrent !== a.streakCurrent) return b.streakCurrent - a.streakCurrent;
                return a.name.localeCompare(b.name, 'pt-BR');
            })
            .map((entry, index) => ({
                ...entry,
                rank: index + 1,
            }));
    }

    private async getLeaderboardScoring(overrides: Record<string, unknown>) {
        const [config] = await this.db
            .select()
            .from(gamificationConfigs)
            .where(eq(gamificationConfigs.key, 'leaderboard_scoring'))
            .limit(1);

        const base = this.toObject(config?.value);

        return {
            studyDayWeight: Number(overrides.studyDayWeight ?? base.studyDayWeight ?? 40),
            trailMoveWeight: Number(overrides.trailMoveWeight ?? base.trailMoveWeight ?? 18),
            trailStartWeight: Number(overrides.trailStartWeight ?? base.trailStartWeight ?? 22),
            completedTrailWeight: Number(overrides.completedTrailWeight ?? base.completedTrailWeight ?? 60),
            streakBonusWeight: Number(overrides.streakBonusWeight ?? base.streakBonusWeight ?? 12),
        };
    }

    private findRewardTier(
        rank: number,
        tiers: Array<{
            id: string;
            label: string;
            placementFrom: number;
            placementTo: number;
            rewardPayload: unknown;
        }>,
    ) {
        return tiers.find((tier) => rank >= tier.placementFrom && rank <= tier.placementTo) ?? null;
    }

    private buildRewardSnapshot(
        rank: number,
        tiers: Array<{
            id: string;
            label: string;
            placementFrom: number;
            placementTo: number;
            rewardPayload: unknown;
        }>,
    ) {
        const tier = this.findRewardTier(rank, tiers);
        if (!tier) {
            return {};
        }

        return {
            tierId: tier.id,
            tierLabel: tier.label,
            ...this.toObject(tier.rewardPayload),
        };
    }

    private buildRewardNotificationBody(label: string, rewardPayload: Record<string, unknown>) {
        const parts: string[] = [label];

        if (typeof rewardPayload.xp === 'number' && rewardPayload.xp > 0) {
            parts.push(`${rewardPayload.xp} XP`);
        }

        const cosmeticCode = this.getRewardCosmeticCode(rewardPayload);
        if (cosmeticCode) {
            parts.push(`cosmético ${cosmeticCode}`);
        }

        if (typeof rewardPayload.badge === 'string') {
            parts.push(`badge ${rewardPayload.badge}`);
        }

        return `Você recebeu ${parts.join(' + ')}.`;
    }

    private getRewardCosmeticCode(payload: unknown) {
        const rewardPayload = this.toObject(payload);
        return typeof rewardPayload.cosmeticCode === 'string' ? rewardPayload.cosmeticCode : undefined;
    }

    private toObject(value: unknown) {
        return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
    }

    private async listRows(table: any) {
        return this.db.select().from(table).orderBy(asc(table.createdAt));
    }

    private async createRow(table: any, data: Record<string, any>) {
        const rows = (await this.db.insert(table).values(data).returning()) as any[];
        const [row] = rows;
        return row;
    }

    private async updateRow(table: any, id: string, data: Record<string, any>) {
        await this.findRow(table, id);
        const rows = (await this.db
            .update(table)
            .set({ ...data, updatedAt: new Date() })
            .where(eq(table.id, id))
            .returning()) as any[];
        const [row] = rows;
        return row;
    }

    private async deleteRow(table: any, id: string) {
        await this.findRow(table, id);
        await this.db.delete(table).where(eq(table.id, id));
    }

    private async findRow(table: any, id: string) {
        const [row] = await this.db.select().from(table).where(eq(table.id, id)).limit(1);
        if (!row) {
            throw new NotFoundException(`Registro ${id} não encontrado`);
        }
        return row;
    }

    private async insertIfMissing(table: any, uniqueField: string, entries: Record<string, any>[]) {
        const inserted: any[] = [];

        for (const entry of entries) {
            const field = table[uniqueField];
            const [existing] = await this.db
                .select()
                .from(table)
                .where(eq(field, entry[uniqueField]))
                .limit(1);

            if (existing) {
                inserted.push(existing);
                continue;
            }

            const rows = (await this.db.insert(table).values(entry).returning()) as any[];
            const [created] = rows;
            inserted.push(created);
        }

        return inserted;
    }
}
