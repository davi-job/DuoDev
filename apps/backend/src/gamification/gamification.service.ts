import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import {
    adaptiveReviewRules,
    achievementDefinitions,
    cosmeticItems,
    gamificationConfigs,
    inAppNotifications,
    leaderboardSnapshots,
    leaderboardSeasons,
    legacyUsers,
    missionDefinitions,
    streakFreezes,
    userMissions,
    rewardTiers,
    streakLogs,
    userCosmetics,
    userEquippedCosmetics,
    weeklyRewards,
    userTrails,
    xpRules,
    type DB,
} from '@duodev/db';
import { and, asc, desc, eq, lte, gte, inArray, or, sql } from 'drizzle-orm';
import {
    buildGamificationSnapshot,
    DEFAULT_XP_RULES,
    getXpRulePoints,
    type GamificationMission,
    type GamificationMetrics,
    type LevelConfig,
    type RuntimeAchievementDefinition,
    type RuntimeCosmeticItem,
    type RuntimeMissionDefinition,
} from '../users/gamification.util';

@Injectable()
export class GamificationService {
    constructor(@Inject('DB') private readonly db: DB) {}

    async buildProfileSnapshot(metrics: GamificationMetrics) {
        const runtime = await this.getRuntimeDefinitions();

        return buildGamificationSnapshot({
            ...metrics,
            levelConfig: runtime.levelConfig,
            achievementDefinitions: runtime.achievements,
            cosmeticItems: runtime.cosmetics,
            missionDefinitions: runtime.missions,
        });
    }

    async getXpPoints(code: string) {
        const rules = await this.listXpRules();
        return getXpRulePoints(rules, code);
    }

    async grantXp(userId: string, amount: number, options?: { source?: string; reason?: string; type?: 'sistema' | 'recompensa' | 'ranking' | 'missao' | 'nivel' | 'streak' }) {
        const safeAmount = Math.max(0, Math.round(amount));
        if (safeAmount === 0) {
            return {
                xp: 0,
                levelUp: false,
            };
        }

        const [user] = await this.db
            .select({
                id: legacyUsers.id,
                xp: legacyUsers.xp,
            })
            .from(legacyUsers)
            .where(eq(legacyUsers.id, userId))
            .limit(1);

        if (!user) {
            throw new NotFoundException('Usuário não encontrado.');
        }

        const runtime = await this.getRuntimeDefinitions();
        const beforeLevel = buildGamificationSnapshot({
            xp: user.xp ?? 0,
            streakCurrent: 0,
            streakBest: 0,
            startedTrails: 0,
            completedTrails: 0,
            accuracy: 0,
            streakLogs: [],
            progressTrails: [],
            levelConfig: runtime.levelConfig,
            achievementDefinitions: runtime.achievements,
            cosmeticItems: runtime.cosmetics,
            missionDefinitions: runtime.missions,
        }).level;

        const nextXp = (user.xp ?? 0) + safeAmount;
        const afterLevel = buildGamificationSnapshot({
            xp: nextXp,
            streakCurrent: 0,
            streakBest: 0,
            startedTrails: 0,
            completedTrails: 0,
            accuracy: 0,
            streakLogs: [],
            progressTrails: [],
            levelConfig: runtime.levelConfig,
            achievementDefinitions: runtime.achievements,
            cosmeticItems: runtime.cosmetics,
            missionDefinitions: runtime.missions,
        }).level;

        await this.db
            .update(legacyUsers)
            .set({
                xp: sql`${legacyUsers.xp} + ${safeAmount}`,
            })
            .where(eq(legacyUsers.id, userId));

        const levelUp = afterLevel > beforeLevel;
        const notificationType = options?.type ?? (levelUp ? 'nivel' : 'recompensa');

        await this.db.insert(inAppNotifications).values({
            userId,
            type: notificationType,
            title: levelUp ? `Subiu para o nível ${afterLevel}` : 'XP adicionado',
            body:
                options?.reason ??
                `Você ganhou ${safeAmount} XP${options?.source ? ` por ${options.source}` : ''}.`,
            payload: {
                xp: safeAmount,
                source: options?.source ?? 'sistema',
                levelBefore: beforeLevel,
                levelAfter: afterLevel,
            },
        });

        return {
            xp: safeAmount,
            levelUp,
        };
    }

    async grantStreakFreeze(userId: string, delta = 1, options?: { source?: string; reason?: string }) {
        const safeDelta = Math.max(1, Math.round(delta));
        const now = new Date();
        const rows = Array.from({ length: safeDelta }).map((_, index) => ({
            userId,
            delta: 1,
            source: options?.source ?? 'sistema',
            reason: options?.reason ?? 'Proteção de streak concedida.',
            createdAt: new Date(now.getTime() - index * 1000),
        }));

        await this.db.insert(streakFreezes).values(rows);

        await this.db.insert(inAppNotifications).values({
            userId,
            type: 'streak',
            title: 'Proteção de streak recebida',
            body: options?.reason ?? `Você recebeu ${safeDelta} proteção(ões) de streak.`,
            payload: {
                delta: safeDelta,
                source: options?.source ?? 'sistema',
            },
        });

        return {
            delta: safeDelta,
        };
    }

    async getStreakFreezeState(userId: string) {
        const [freezeConfig, freezeBalance] = await Promise.all([
            this.getStreakFreezeConfig(),
            this.getStreakFreezeBalance(userId),
        ]);

        const recent = await this.db
            .select({
                id: streakFreezes.id,
                delta: streakFreezes.delta,
                source: streakFreezes.source,
                reason: streakFreezes.reason,
                createdAt: streakFreezes.createdAt,
            })
            .from(streakFreezes)
            .where(eq(streakFreezes.userId, userId))
            .orderBy(desc(streakFreezes.createdAt))
            .limit(5);

        return {
            balance: freezeBalance,
            config: freezeConfig,
            recent: recent.map((row) => ({
                id: row.id,
                delta: row.delta,
                source: row.source,
                reason: row.reason,
                createdAt: row.createdAt.toISOString(),
            })),
        };
    }

    async getStreakFreezeDates(userId: string) {
        const rows = await this.db
            .select({
                createdAt: streakFreezes.createdAt,
            })
            .from(streakFreezes)
            .where(eq(streakFreezes.userId, userId));

        return new Set(rows.map((row) => row.createdAt.toISOString().slice(0, 10)));
    }

    async applyStreakFreezeForGap(userId: string, lastCompletedDate: string, currentDate: string) {
        const freezeConfig = await this.getStreakFreezeConfig();
        if (!freezeConfig.enabled) {
            return { consumed: 0, protectedDays: [] as string[] };
        }

        const missingDays = diffDays(lastCompletedDate, currentDate) - 1;
        if (missingDays <= 0 || missingDays > freezeConfig.maxGapDays) {
            return { consumed: 0, protectedDays: [] as string[] };
        }

        const balance = await this.getStreakFreezeBalance(userId);
        if (balance < missingDays) {
            return { consumed: 0, protectedDays: [] as string[] };
        }

        const existingDates = await this.getStreakFreezeDates(userId);
        const protectedDays: string[] = [];
        const cursor = new Date(lastCompletedDate);
        for (let i = 0; i < missingDays; i++) {
            cursor.setDate(cursor.getDate() + 1);
            const protectedDay = cursor.toISOString().slice(0, 10);
            if (!existingDates.has(protectedDay)) {
                protectedDays.push(protectedDay);
            }
        }

        if (!protectedDays.length) {
            return { consumed: 0, protectedDays: [] as string[] };
        }

        await this.db.insert(streakFreezes).values(
            protectedDays.map((day) => ({
                userId,
                delta: 1,
                source: 'auto_freeze',
                reason: `Proteção automática para manter a streak em ${day}.`,
                createdAt: new Date(`${day}T12:00:00.000Z`),
            })),
        );

        await this.db.insert(inAppNotifications).values({
            userId,
            type: 'streak',
            title: 'Streak protegida',
            body: `Sua sequência foi protegida por ${protectedDays.length} dia(s) usando streak freeze.`,
            payload: {
                protectedDays,
            },
        });

        return {
            consumed: protectedDays.length,
            protectedDays,
        };
    }

    async getNotifications(userId: string, limit = 10) {
        const [items, unreadCountRows] = await Promise.all([
            this.db
                .select()
                .from(inAppNotifications)
                .where(eq(inAppNotifications.userId, userId))
                .orderBy(desc(inAppNotifications.createdAt))
                .limit(Math.min(Math.max(limit, 1), 50)),
            this.db
                .select({
                    count: sql<number>`count(*)`.mapWith(Number),
                })
                .from(inAppNotifications)
                .where(and(eq(inAppNotifications.userId, userId), sql`${inAppNotifications.readAt} is null`)),
        ]);

        return {
            unreadCount: unreadCountRows[0]?.count ?? 0,
            items: items.map((row) => ({
                id: row.id,
                type: row.type,
                title: row.title,
                body: row.body,
                payload: toObject(row.payload),
                readAt: row.readAt?.toISOString() ?? null,
                createdAt: row.createdAt.toISOString(),
            })),
        };
    }

    async markNotificationAsRead(userId: string, notificationId: string) {
        const [updated] = await this.db
            .update(inAppNotifications)
            .set({ readAt: new Date() })
            .where(and(eq(inAppNotifications.id, notificationId), eq(inAppNotifications.userId, userId)))
            .returning({ id: inAppNotifications.id });

        if (!updated) {
            throw new NotFoundException('Notificação não encontrada.');
        }

        return { success: true };
    }

    async getWeeklyLeaderboard(currentUserId: string) {
        const now = new Date();
        const activeSeason = await this.getActiveSeason(now);
        const startsAt = activeSeason?.startsAt ? new Date(activeSeason.startsAt) : new Date(now);
        const endsAt = activeSeason?.endsAt ? new Date(activeSeason.endsAt) : new Date(now);

        if (!activeSeason) {
            startsAt.setHours(0, 0, 0, 0);
            startsAt.setDate(startsAt.getDate() - 6);
            endsAt.setHours(23, 59, 59, 999);
        }

        const scoring = await this.getLeaderboardScoring(
            toObject(activeSeason?.scoringRules) as Record<string, unknown>,
        );

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
            .where(and(eq(streakLogs.completed, true), gte(streakLogs.logDate, startsAt.toISOString().slice(0, 10))))
            .groupBy(streakLogs.userId);

        const trailMoveRows = await this.db
            .select({
                userId: userTrails.userId,
                trailMoves: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(gte(userTrails.updatedAt, startsAt))
            .groupBy(userTrails.userId);

        const trailStartRows = await this.db
            .select({
                userId: userTrails.userId,
                trailStarts: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(gte(userTrails.startedAt, startsAt))
            .groupBy(userTrails.userId);

        const completedTrailRows = await this.db
            .select({
                userId: userTrails.userId,
                completedTrails: sql<number>`count(*)`.mapWith(Number),
            })
            .from(userTrails)
            .where(and(gte(userTrails.updatedAt, startsAt), gte(userTrails.progressPct, 100)))
            .groupBy(userTrails.userId);

        const studyDaysByUser = new Map(streakRows.map((row) => [row.userId, row.studyDays]));
        const trailMovesByUser = new Map(trailMoveRows.map((row) => [row.userId, row.trailMoves]));
        const trailStartsByUser = new Map(trailStartRows.map((row) => [row.userId, row.trailStarts]));
        const completedTrailsByUser = new Map(
            completedTrailRows.map((row) => [row.userId, row.completedTrails]),
        );

        const ranked = users
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
                    studyDays,
                    trailMoves,
                    trailStarts,
                    completedTrails,
                    isCurrentUser: user.id === currentUserId,
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
                rank: index + 1,
                ...entry,
            }));

        const enrichedRanked = await this.attachEquippedCosmeticsToLeaderboard(ranked);

        const currentUser = enrichedRanked.find((entry) => entry.userId === currentUserId) ?? null;
        const rewardTierRows = await this.getRewardTiersForSeason(activeSeason?.id);

        return {
            period: {
                label: activeSeason?.label ?? 'Últimos 7 dias',
                startsAt: startsAt.toISOString(),
                endsAt: endsAt.toISOString(),
            },
            top: enrichedRanked.slice(0, 10),
            currentUser,
            rewardTiers: rewardTierRows.map((tier) => ({
                id: tier.id,
                label: tier.label,
                placement: tier.placementFrom === tier.placementTo
                    ? `${tier.placementFrom}º lugar`
                    : `${tier.placementFrom}º ao ${tier.placementTo}º`,
                reward: formatRewardPayload(tier.rewardPayload),
                cosmetic: formatRewardCosmetic(tier.rewardPayload),
            })),
            currentUserReward: currentUser ? this.projectReward(currentUser.rank, rewardTierRows) : null,
        };
    }

    async getWeeklyRewardHistory(userId: string) {
        const rows = await this.db
            .select({
                id: weeklyRewards.id,
                deliveryStatus: weeklyRewards.deliveryStatus,
                deliveredAt: weeklyRewards.deliveredAt,
                createdAt: weeklyRewards.createdAt,
                rewardPayload: weeklyRewards.rewardPayload,
                seasonId: leaderboardSeasons.id,
                seasonLabel: leaderboardSeasons.label,
                seasonStartsAt: leaderboardSeasons.startsAt,
                seasonEndsAt: leaderboardSeasons.endsAt,
                rank: leaderboardSnapshots.rank,
                score: leaderboardSnapshots.score,
            })
            .from(weeklyRewards)
            .leftJoin(leaderboardSeasons, eq(weeklyRewards.seasonId, leaderboardSeasons.id))
            .leftJoin(
                leaderboardSnapshots,
                and(
                    eq(leaderboardSnapshots.seasonId, weeklyRewards.seasonId),
                    eq(leaderboardSnapshots.userId, weeklyRewards.userId),
                ),
            )
            .where(eq(weeklyRewards.userId, userId))
            .orderBy(desc(weeklyRewards.createdAt))
            .limit(10);

        return rows.map((row) => ({
            id: row.id,
            deliveryStatus: row.deliveryStatus,
            deliveredAt: row.deliveredAt?.toISOString() ?? null,
            createdAt: row.createdAt.toISOString(),
            reward: formatRewardPayload(row.rewardPayload),
            cosmetic: formatRewardCosmetic(row.rewardPayload),
            season: row.seasonId
                ? {
                      id: row.seasonId,
                      label: row.seasonLabel ?? 'Temporada',
                      startsAt: row.seasonStartsAt?.toISOString() ?? null,
                      endsAt: row.seasonEndsAt?.toISOString() ?? null,
                  }
                : null,
            rank: row.rank ?? null,
            score: row.score ?? null,
            rewardPayload: toObject(row.rewardPayload),
        }));
    }

    async getSeasonLeaderboardHistory(currentUserId: string, limit = 6) {
        const seasons = await this.db
            .select()
            .from(leaderboardSeasons)
            .orderBy(desc(leaderboardSeasons.startsAt))
            .limit(Math.max(1, Math.min(limit, 12)));

        if (!seasons.length) {
            return {
                seasons: [],
                currentSeason: null,
            };
        }

        const seasonIds = seasons.map((season) => season.id);

        const [snapshotRows, rewardRows] = await Promise.all([
            this.db
                .select({
                    seasonId: leaderboardSnapshots.seasonId,
                    userId: leaderboardSnapshots.userId,
                    rank: leaderboardSnapshots.rank,
                    score: leaderboardSnapshots.score,
                    rewardSnapshot: leaderboardSnapshots.rewardSnapshot,
                    createdAt: leaderboardSnapshots.createdAt,
                    userName: legacyUsers.name,
                    userXp: legacyUsers.xp,
                    userStreakCurrent: legacyUsers.streakCurrent,
                })
                .from(leaderboardSnapshots)
                .leftJoin(legacyUsers, eq(leaderboardSnapshots.userId, legacyUsers.id))
                .where(inArray(leaderboardSnapshots.seasonId, seasonIds))
                .orderBy(desc(leaderboardSnapshots.seasonId), asc(leaderboardSnapshots.rank)),
            this.db
                .select({
                    seasonId: weeklyRewards.seasonId,
                    userId: weeklyRewards.userId,
                    deliveryStatus: weeklyRewards.deliveryStatus,
                    deliveredAt: weeklyRewards.deliveredAt,
                    rewardPayload: weeklyRewards.rewardPayload,
                })
                .from(weeklyRewards)
                .where(inArray(weeklyRewards.seasonId, seasonIds))
                .orderBy(desc(weeklyRewards.createdAt)),
        ]);

        const snapshotsBySeason = new Map<string, typeof snapshotRows>();
        for (const row of snapshotRows) {
            const list = snapshotsBySeason.get(row.seasonId) ?? [];
            list.push(row);
            snapshotsBySeason.set(row.seasonId, list);
        }

        const rewardsBySeason = new Map<string, typeof rewardRows>();
        for (const row of rewardRows) {
            const list = rewardsBySeason.get(row.seasonId) ?? [];
            list.push(row);
            rewardsBySeason.set(row.seasonId, list);
        }

        const seasonCards = seasons.map((season) => {
            const snapshots = (snapshotsBySeason.get(season.id) ?? []).sort((a, b) => a.rank - b.rank);
            const rewards = rewardsBySeason.get(season.id) ?? [];
            const currentUserSnapshot = snapshots.find((row) => row.userId === currentUserId) ?? null;
            const currentUserReward = rewards.find((row) => row.userId === currentUserId) ?? null;

            return {
                id: season.id,
                code: season.code,
                label: season.label,
                period: season.period,
                status: season.status,
                startsAt: season.startsAt.toISOString(),
                endsAt: season.endsAt.toISOString(),
                participants: snapshots.length,
                rewardCount: rewards.length,
                podium: snapshots.slice(0, 3).map((row) => ({
                    rank: row.rank,
                    userId: row.userId,
                    name: row.userName?.trim() || 'Usuário',
                    xp: row.userXp ?? 0,
                    streakCurrent: row.userStreakCurrent ?? 0,
                    score: row.score,
                    reward: formatRewardPayload(row.rewardSnapshot),
                })),
                currentUser: currentUserSnapshot
                    ? {
                          rank: currentUserSnapshot.rank,
                          userId: currentUserSnapshot.userId,
                          name: currentUserSnapshot.userName?.trim() || 'Usuário',
                          xp: currentUserSnapshot.userXp ?? 0,
                          streakCurrent: currentUserSnapshot.userStreakCurrent ?? 0,
                          score: currentUserSnapshot.score,
                          reward: formatRewardPayload(currentUserSnapshot.rewardSnapshot),
                      }
                    : null,
                currentUserReward: currentUserReward
                    ? {
                          deliveryStatus: currentUserReward.deliveryStatus,
                          deliveredAt: currentUserReward.deliveredAt?.toISOString() ?? null,
                          reward: formatRewardPayload(currentUserReward.rewardPayload),
                          cosmetic: formatRewardCosmetic(currentUserReward.rewardPayload),
                      }
                    : null,
            };
        });

        const currentSeason =
            seasonCards.find((season) => season.status === 'ativa') ??
            seasonCards.find((season) => season.status === 'agendada') ??
            seasonCards[0] ??
            null;

        return {
            currentSeason,
            seasons: seasonCards,
        };
    }

    async getUserCosmeticsState(userId: string, metrics: GamificationMetrics) {
        const inventory = await this.syncAndListUserCosmetics(userId, metrics);
        const equippedCosmetics = await this.getEquippedCosmetics(userId, inventory);

        return {
            inventory,
            equippedCosmetics,
        };
    }

    async getUserMissionState(userId: string, metrics: GamificationMetrics) {
        return this.syncAndListUserMissions(userId, metrics);
    }

    async claimMission(userId: string, missionId: string) {
        const [mission] = await this.db
            .select()
            .from(userMissions)
            .where(and(eq(userMissions.id, missionId), eq(userMissions.userId, userId)))
            .limit(1);

        if (!mission) {
            throw new Error('Missão não encontrada para este usuário.');
        }

        if (mission.status === 'resgatada') {
            throw new Error('Esta missão já foi resgatada.');
        }

        if (mission.status !== 'concluida') {
            throw new Error('Esta missão ainda não foi concluída.');
        }

        const rewardPayload = toObject(mission.rewardSnapshot);
        const xp = typeof rewardPayload.xp === 'number' ? rewardPayload.xp : 0;
        const cosmeticCode = typeof rewardPayload.cosmeticCode === 'string' ? rewardPayload.cosmeticCode : null;

        await this.db.transaction(async (tx) => {
            await tx
                .update(userMissions)
                .set({
                    status: 'resgatada',
                    claimedAt: new Date(),
                    updatedAt: new Date(),
                })
                .where(eq(userMissions.id, mission.id));

            if (xp > 0) {
                await tx
                    .update(legacyUsers)
                    .set({
                        xp: sql`${legacyUsers.xp} + ${xp}`,
                    })
                    .where(eq(legacyUsers.id, userId));
            }

            if (cosmeticCode) {
                const [cosmetic] = await tx
                    .select()
                    .from(cosmeticItems)
                    .where(eq(cosmeticItems.code, cosmeticCode))
                    .limit(1);

                if (cosmetic) {
                    const [existingUserCosmetic] = await tx
                        .select({ id: userCosmetics.id })
                        .from(userCosmetics)
                        .where(
                            and(
                                eq(userCosmetics.userId, userId),
                                eq(userCosmetics.cosmeticItemId, cosmetic.id),
                            ),
                        )
                        .limit(1);

                    if (!existingUserCosmetic) {
                        await tx.insert(userCosmetics).values({
                            userId,
                            cosmeticItemId: cosmetic.id,
                            source: 'mission_claim',
                            metadata: { missionId: mission.id },
                        });
                    }
                }
            }

            await tx.insert(inAppNotifications).values({
                userId,
                type: 'missao',
                title: 'Recompensa de missão resgatada',
                body: buildMissionRewardText(rewardPayload),
                payload: {
                    missionId: mission.id,
                    reward: rewardPayload,
                },
            });
        });

        return {
            success: true,
            missionId: mission.id,
            reward: buildMissionRewardText(rewardPayload),
        };
    }

    async equipCosmetic(userId: string, cosmeticItemId: string) {
        const [ownedCosmetic] = await this.db
            .select({
                itemId: cosmeticItems.id,
                code: cosmeticItems.code,
                label: cosmeticItems.label,
                description: cosmeticItems.description,
                type: cosmeticItems.type,
                rarity: cosmeticItems.rarity,
                unlockedAt: userCosmetics.unlockedAt,
                source: userCosmetics.source,
            })
            .from(userCosmetics)
            .innerJoin(cosmeticItems, eq(userCosmetics.cosmeticItemId, cosmeticItems.id))
            .where(and(eq(userCosmetics.userId, userId), eq(userCosmetics.cosmeticItemId, cosmeticItemId)))
            .limit(1);

        if (!ownedCosmetic) {
            throw new Error('Cosmético não desbloqueado para este usuário.');
        }

        const slotKey = this.slotColumnForType(ownedCosmetic.type);
        const [existing] = await this.db
            .select()
            .from(userEquippedCosmetics)
            .where(eq(userEquippedCosmetics.userId, userId))
            .limit(1);

        if (existing) {
            await this.db
                .update(userEquippedCosmetics)
                .set({
                    [slotKey]: cosmeticItemId,
                    updatedAt: new Date(),
                })
                .where(eq(userEquippedCosmetics.userId, userId));
        } else {
            await this.db.insert(userEquippedCosmetics).values({
                userId,
                [slotKey]: cosmeticItemId,
            });
        }

        const inventory = await this.listUserCosmetics(userId);
        return {
            inventory,
            equippedCosmetics: await this.getEquippedCosmetics(userId, inventory),
        };
    }

    async unequipCosmetic(userId: string, cosmeticItemId: string) {
        const [ownedCosmetic] = await this.db
            .select({
                itemId: cosmeticItems.id,
                code: cosmeticItems.code,
                label: cosmeticItems.label,
                description: cosmeticItems.description,
                type: cosmeticItems.type,
                rarity: cosmeticItems.rarity,
                unlockedAt: userCosmetics.unlockedAt,
                source: userCosmetics.source,
            })
            .from(userCosmetics)
            .innerJoin(cosmeticItems, eq(userCosmetics.cosmeticItemId, cosmeticItems.id))
            .where(and(eq(userCosmetics.userId, userId), eq(userCosmetics.cosmeticItemId, cosmeticItemId)))
            .limit(1);

        if (!ownedCosmetic) {
            throw new NotFoundException('Cosmético não desbloqueado para este usuário.');
        }

        const slotKey = this.slotColumnForType(ownedCosmetic.type);
        const [existing] = await this.db
            .select()
            .from(userEquippedCosmetics)
            .where(eq(userEquippedCosmetics.userId, userId))
            .limit(1);

        if (!existing) {
            const inventory = await this.listUserCosmetics(userId);
            return {
                inventory,
                equippedCosmetics: await this.getEquippedCosmetics(userId, inventory),
            };
        }

        const nextState = {
            titleItemId: existing.titleItemId,
            frameItemId: existing.frameItemId,
            themeItemId: existing.themeItemId,
            badgeItemId: existing.badgeItemId,
            [slotKey]: null,
        };

        if (!nextState.titleItemId && !nextState.frameItemId && !nextState.themeItemId && !nextState.badgeItemId) {
            await this.db.delete(userEquippedCosmetics).where(eq(userEquippedCosmetics.userId, userId));
        } else {
            await this.db
                .update(userEquippedCosmetics)
                .set({
                    ...nextState,
                    updatedAt: new Date(),
                })
                .where(eq(userEquippedCosmetics.userId, userId));
        }

        const inventory = await this.listUserCosmetics(userId);
        return {
            inventory,
            equippedCosmetics: await this.getEquippedCosmetics(userId, inventory),
        };
    }

    private async getRuntimeDefinitions() {
        const [configRows, xpRuleRows, achievementRows, cosmeticRows, missionRows] = await Promise.all([
            this.db.select().from(gamificationConfigs),
            this.listXpRules(),
            this.db.select().from(achievementDefinitions),
            this.db.select().from(cosmeticItems),
            this.db.select().from(missionDefinitions),
        ]);

        const configMap = new Map(configRows.map((row) => [row.key, row.value as Record<string, unknown>]));
        const levelCurve = configMap.get('level_curve') ?? {};

        return {
            configs: configMap,
            xpRules: xpRuleRows,
            levelConfig: {
                baseXp: Number(levelCurve.baseXp ?? 100),
                incrementPerLevel: Number(levelCurve.incrementPerLevel ?? 50),
                titles: Array.isArray(levelCurve.titles) ? (levelCurve.titles as string[]) : undefined,
            } satisfies LevelConfig,
            achievements: achievementRows
                .filter((row) => row.active)
                .map(
                    (row) =>
                        ({
                            id: row.id,
                            label: row.label,
                            description: row.description ?? '',
                            icon: row.icon,
                            rarity: row.rarity,
                            active: row.active,
                            criteria: toObject(row.criteria),
                        }) satisfies RuntimeAchievementDefinition,
                ),
            cosmetics: cosmeticRows
                .filter((row) => row.active)
                .map(
                    (row) =>
                        ({
                            id: row.id,
                            label: row.label,
                            description: row.description,
                            type: row.type,
                            rarity: row.rarity,
                            active: row.active,
                            unlockCondition: toObject(row.unlockCondition),
                        }) satisfies RuntimeCosmeticItem,
                ),
            missions: missionRows
                .filter((row) => row.active && (row.period === 'diaria' || row.period === 'semanal'))
                .map(
                    (row) =>
                        ({
                            id: row.id,
                            label: row.label,
                            description: row.description,
                            icon: row.icon,
                            period: row.period,
                            targetType: row.targetType,
                            targetValue: row.targetValue,
                            active: row.active,
                            criteria: toObject(row.criteria),
                            rewardPayload: toObject(row.rewardPayload),
                        }) satisfies RuntimeMissionDefinition,
                ),
        };
    }

    private async getStreakFreezeConfig() {
        const [rows] = await Promise.all([
            this.db.select().from(gamificationConfigs).where(eq(gamificationConfigs.key, 'streak_policy')).limit(1),
        ]);

        const value = toObject(rows[0]?.value);
        return {
            enabled: value.freezeEnabled !== false,
            maxGapDays: Number(value.maxGapDays ?? 1),
            initialCharges: Number(value.defaultFreezesPerWeek ?? 1),
        };
    }

    private async getStreakFreezeBalance(userId: string) {
        const [row] = await this.db
            .select({
                count: sql<number>`count(*)`.mapWith(Number),
            })
            .from(streakFreezes)
            .where(eq(streakFreezes.userId, userId));

        return row?.count ?? 0;
    }

    private async syncAndListUserMissions(userId: string, metrics: GamificationMetrics) {
        const runtime = await this.getRuntimeDefinitions();
        const missionMetrics = buildMissionMetrics(metrics);
        const activeMissions = runtime.missions.filter((mission) => mission.active);

        for (const definition of activeMissions) {
            const periodWindow = resolveMissionPeriodWindow(definition.period);
            const target = Math.max(1, Number(definition.targetValue ?? 1));
            const progress = Math.min(
                target,
                resolveMissionProgress(definition.targetType, missionMetrics),
            );

            const [existing] = await this.db
                .select()
                .from(userMissions)
                .where(
                    and(
                        eq(userMissions.userId, userId),
                        eq(userMissions.missionDefinitionId, definition.id),
                        eq(userMissions.periodStart, periodWindow.start),
                        eq(userMissions.periodEnd, periodWindow.end),
                    ),
                )
                .limit(1);

            const nextStatus =
                existing?.status === 'resgatada'
                    ? 'resgatada'
                    : progress >= target
                      ? 'concluida'
                      : 'pendente';

            if (!existing) {
                await this.db.insert(userMissions).values({
                    userId,
                    missionDefinitionId: definition.id,
                    periodStart: periodWindow.start,
                    periodEnd: periodWindow.end,
                    progress,
                    target,
                    status: nextStatus,
                    rewardSnapshot: definition.rewardPayload ?? {},
                });
                continue;
            }

            await this.db
                .update(userMissions)
                .set({
                    progress,
                    target,
                    status: nextStatus,
                    rewardSnapshot: definition.rewardPayload ?? {},
                    updatedAt: new Date(),
                })
                .where(eq(userMissions.id, existing.id));
        }

        const rows = await this.db
            .select({
                id: userMissions.id,
                progress: userMissions.progress,
                target: userMissions.target,
                status: userMissions.status,
                claimedAt: userMissions.claimedAt,
                rewardSnapshot: userMissions.rewardSnapshot,
                definitionId: missionDefinitions.id,
                label: missionDefinitions.label,
                description: missionDefinitions.description,
                icon: missionDefinitions.icon,
                period: missionDefinitions.period,
                createdAt: userMissions.createdAt,
            })
            .from(userMissions)
            .innerJoin(missionDefinitions, eq(userMissions.missionDefinitionId, missionDefinitions.id))
            .where(eq(userMissions.userId, userId))
            .orderBy(desc(userMissions.createdAt));

        const daily = rows
            .filter((row) => row.period === 'diaria')
            .map((row) => mapMissionRowToSnapshot(row));
        const weekly = rows
            .filter((row) => row.period === 'semanal')
            .map((row) => mapMissionRowToSnapshot(row));

        return { daily, weekly };
    }

    private async syncAndListUserCosmetics(userId: string, metrics: GamificationMetrics) {
        const runtime = await this.getRuntimeDefinitions();
        const derived = buildGamificationSnapshot({
            ...metrics,
            levelConfig: runtime.levelConfig,
            achievementDefinitions: runtime.achievements,
            cosmeticItems: runtime.cosmetics,
            missionDefinitions: runtime.missions,
        }).unlockedCosmetics;

        const unlockedIds = derived.map((item) => item.id);
        if (unlockedIds.length) {
            const [ownedRows, unlockableItems] = await Promise.all([
                this.db
                    .select({ cosmeticItemId: userCosmetics.cosmeticItemId })
                    .from(userCosmetics)
                    .where(eq(userCosmetics.userId, userId)),
                this.db.select().from(cosmeticItems).where(inArray(cosmeticItems.id, unlockedIds)),
            ]);

            const ownedIds = new Set(ownedRows.map((row) => row.cosmeticItemId));
            const missing = unlockableItems
                .filter((item) => !ownedIds.has(item.id))
                .map((item) => ({
                    userId,
                    cosmeticItemId: item.id,
                    source: 'unlock_condition',
                    metadata: {},
                }));

            if (missing.length) {
                await this.db.insert(userCosmetics).values(missing);
            }
        }

        return this.listUserCosmetics(userId);
    }

    private async listUserCosmetics(userId: string) {
        const equipped = await this.db
            .select()
            .from(userEquippedCosmetics)
            .where(eq(userEquippedCosmetics.userId, userId))
            .limit(1);

        const equippedIds = new Set(
            [
                equipped[0]?.titleItemId,
                equipped[0]?.frameItemId,
                equipped[0]?.themeItemId,
                equipped[0]?.badgeItemId,
            ].filter((value): value is string => Boolean(value)),
        );

        const rows = await this.db
            .select({
                itemId: cosmeticItems.id,
                code: cosmeticItems.code,
                label: cosmeticItems.label,
                description: cosmeticItems.description,
                type: cosmeticItems.type,
                rarity: cosmeticItems.rarity,
                unlockedAt: userCosmetics.unlockedAt,
                source: userCosmetics.source,
            })
            .from(userCosmetics)
            .innerJoin(cosmeticItems, eq(userCosmetics.cosmeticItemId, cosmeticItems.id))
            .where(eq(userCosmetics.userId, userId))
            .orderBy(desc(userCosmetics.unlockedAt));

        return rows.map((row) => ({
            id: row.itemId,
            code: row.code,
            label: row.label,
            description: row.description ?? 'Recompensa cosmética desbloqueada.',
            type: cosmeticTypeToFrontend(row.type),
            rarity: row.rarity,
            source: row.source,
            unlockedAt: row.unlockedAt.toISOString(),
            equipped: equippedIds.has(row.itemId),
        }));
    }

    private async getEquippedCosmetics(
        userId: string,
        inventory?: Array<{
            id: string;
            label: string;
            description: string;
            type: string;
            rarity: string;
            code: string;
            source: string;
            unlockedAt: string;
            equipped: boolean;
        }>,
    ) {
        const [equipped] = await this.db
            .select()
            .from(userEquippedCosmetics)
            .where(eq(userEquippedCosmetics.userId, userId))
            .limit(1);

        if (!equipped) {
            return {
                title: null,
                frame: null,
                theme: null,
                badge: null,
            };
        }

        const items = inventory ?? (await this.listUserCosmetics(userId));

        const findItem = (itemId?: string | null) => items.find((item) => item.id === itemId) ?? null;

        return {
            title: findItem(equipped.titleItemId),
            frame: findItem(equipped.frameItemId),
            theme: findItem(equipped.themeItemId),
            badge: findItem(equipped.badgeItemId),
        };
    }

    private slotColumnForType(type: string) {
        switch (type) {
            case 'titulo':
                return 'titleItemId' as const;
            case 'moldura':
                return 'frameItemId' as const;
            case 'tema':
                return 'themeItemId' as const;
            default:
                return 'badgeItemId' as const;
        }
    }

    private async attachEquippedCosmeticsToLeaderboard<
        T extends {
            userId: string;
            name: string;
        },
    >(entries: T[]) {
        if (!entries.length) {
            return entries;
        }

        const equippedRows = await this.db
            .select()
            .from(userEquippedCosmetics)
            .where(inArray(userEquippedCosmetics.userId, entries.map((entry) => entry.userId)));

        const cosmeticIds = [
            ...new Set(
                equippedRows
                    .flatMap((row) => [row.titleItemId, row.badgeItemId, row.frameItemId, row.themeItemId])
                    .filter((value): value is string => Boolean(value)),
            ),
        ];

        const items = cosmeticIds.length
            ? await this.db.select().from(cosmeticItems).where(inArray(cosmeticItems.id, cosmeticIds))
            : [];

        const itemsById = new Map(items.map((item) => [item.id, item]));
        const equippedByUser = new Map(equippedRows.map((row) => [row.userId, row]));

        return entries.map((entry) => {
            const equipped = equippedByUser.get(entry.userId);
            return {
                ...entry,
                equippedTitle: equipped?.titleItemId ? itemsById.get(equipped.titleItemId)?.label ?? null : null,
                equippedBadge: equipped?.badgeItemId ? itemsById.get(equipped.badgeItemId)?.label ?? null : null,
                equippedFrame: equipped?.frameItemId ? itemsById.get(equipped.frameItemId)?.label ?? null : null,
                equippedTheme: equipped?.themeItemId ? itemsById.get(equipped.themeItemId)?.label ?? null : null,
            };
        });
    }

    private async listXpRules() {
        const rows = await this.db.select().from(xpRules);
        if (rows.length) {
            return rows.map((row) => ({ code: row.code, points: row.points, active: row.active }));
        }

        return Object.entries(DEFAULT_XP_RULES).map(([code, points]) => ({ code, points, active: true }));
    }

    private async getActiveSeason(now: Date) {
        const [season] = await this.db
            .select()
            .from(leaderboardSeasons)
            .where(
                and(
                    eq(leaderboardSeasons.status, 'ativa'),
                    lte(leaderboardSeasons.startsAt, now),
                    gte(leaderboardSeasons.endsAt, now),
                ),
            )
            .orderBy(desc(leaderboardSeasons.startsAt))
            .limit(1);

        if (season) {
            return season;
        }

        const [fallback] = await this.db
            .select()
            .from(leaderboardSeasons)
            .where(or(eq(leaderboardSeasons.status, 'ativa'), eq(leaderboardSeasons.status, 'agendada')))
            .orderBy(desc(leaderboardSeasons.startsAt))
            .limit(1);

        return fallback;
    }

    private async getRewardTiersForSeason(seasonId?: string) {
        if (!seasonId) {
            return [];
        }

        return this.db
            .select()
            .from(rewardTiers)
            .where(eq(rewardTiers.seasonId, seasonId))
            .orderBy(asc(rewardTiers.placementFrom));
    }

    private async getLeaderboardScoring(seasonScoringRules: Record<string, unknown>) {
        const configRows = await this.db
            .select()
            .from(gamificationConfigs)
            .where(eq(gamificationConfigs.key, 'leaderboard_scoring'))
            .limit(1);

        const config = toObject(configRows[0]?.value);
        const overrides = toObject(seasonScoringRules);

        return {
            studyDayWeight: Number(overrides.studyDayWeight ?? config.studyDayWeight ?? 40),
            trailMoveWeight: Number(overrides.trailMoveWeight ?? config.trailMoveWeight ?? 18),
            trailStartWeight: Number(overrides.trailStartWeight ?? config.trailStartWeight ?? 22),
            completedTrailWeight: Number(overrides.completedTrailWeight ?? config.completedTrailWeight ?? 60),
            streakBonusWeight: Number(overrides.streakBonusWeight ?? config.streakBonusWeight ?? 12),
        };
    }

    private projectReward(
        rank: number,
        tiers: Array<{
            id: string;
            label: string;
            placementFrom: number;
            placementTo: number;
            rewardPayload: unknown;
        }>,
    ) {
        const tier = tiers.find((item) => rank >= item.placementFrom && rank <= item.placementTo);
        if (!tier) {
            return null;
        }

        return {
            tierId: tier.id,
            label: tier.label,
            reward: formatRewardPayload(tier.rewardPayload),
            cosmetic: formatRewardCosmetic(tier.rewardPayload),
        };
    }
}

function buildMissionMetrics(params: GamificationMetrics) {
    const now = new Date();
    const todayIso = now.toISOString().slice(0, 10);
    const weekStart = startOfCurrentWeek(now);

    const concludedLogs = params.streakLogs.filter((log) => log.concluido);
    const studiedToday = concludedLogs.some((log) => log.dataRegistro?.slice(0, 10) === todayIso) ? 1 : 0;
    const studiedDaysThisWeek = concludedLogs.filter((log) => {
        const logDate = new Date(log.dataRegistro);
        return logDate >= weekStart && logDate <= now;
    }).length;

    const updatedTrailsToday = params.progressTrails.filter((trail) => {
        if (!trail.updatedAt) return false;
        return trail.updatedAt.toISOString().slice(0, 10) === todayIso;
    }).length;

    const updatedTrailsThisWeek = params.progressTrails.filter((trail) => {
        if (!trail.updatedAt) return false;
        return trail.updatedAt >= weekStart && trail.updatedAt <= now;
    }).length;

    const startedTrailsThisWeek = params.progressTrails.filter((trail) => {
        if (!trail.startedAt) return false;
        return trail.startedAt >= weekStart && trail.startedAt <= now;
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

function resolveMissionProgress(
    targetType: string,
    metrics: ReturnType<typeof buildMissionMetrics>,
) {
    switch (targetType) {
        case 'study_today':
        case 'study_sessions':
            return metrics.studiedToday;
        case 'updated_trails_today':
            return metrics.updatedTrailsToday;
        case 'streak_current':
            return metrics.streakCurrent;
        case 'study_days_this_week':
        case 'study_days':
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

function resolveMissionPeriodWindow(period: string) {
    const now = new Date();

    if (period === 'diaria') {
        const start = new Date(now);
        start.setHours(0, 0, 0, 0);
        const end = new Date(start);
        end.setHours(23, 59, 59, 999);
        return { start, end };
    }

    const start = startOfCurrentWeek(now);
    const end = new Date(start);
    end.setDate(start.getDate() + 6);
    end.setHours(23, 59, 59, 999);
    return { start, end };
}

function startOfCurrentWeek(now: Date) {
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    start.setDate(start.getDate() - start.getDay());
    return start;
}

function diffDays(startIso: string, endIso: string) {
    const start = new Date(`${startIso}T00:00:00.000Z`);
    const end = new Date(`${endIso}T00:00:00.000Z`);
    return Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24));
}

function mapMissionRowToSnapshot(row: {
    id: string;
    progress: number;
    target: number;
    status: string;
    claimedAt: Date | null;
    rewardSnapshot: unknown;
    definitionId: string;
    label: string;
    description: string | null;
    icon: string;
    period: string;
}) {
    return {
        id: row.id,
        definitionId: row.definitionId,
        label: row.label,
        description: row.description ?? '',
        icon: row.icon || '🎯',
        period: row.period === 'diaria' ? 'daily' : 'weekly',
        progress: row.progress,
        target: row.target,
        status:
            row.status === 'resgatada'
                ? 'claimed'
                : row.status === 'concluida'
                  ? 'completed'
                  : 'pending',
        reward: buildMissionRewardText(toObject(row.rewardSnapshot)),
        claimable: row.status === 'concluida',
        claimedAt: row.claimedAt?.toISOString() ?? null,
    } satisfies GamificationMission;
}

function toObject(value: unknown) {
    return value && typeof value === 'object' ? (value as Record<string, unknown>) : {};
}

function formatRewardPayload(payload: unknown) {
    const data = toObject(payload);
    if (typeof data.xp === 'number') {
        return `${data.xp} XP bônus`;
    }
    return 'Sem recompensa configurada';
}

function formatRewardCosmetic(payload: unknown) {
    const data = toObject(payload);
    if (typeof data.cosmeticCode === 'string') {
        return `Cosmético: ${data.cosmeticCode}`;
    }
    if (typeof data.badge === 'string') {
        return `Badge: ${data.badge}`;
    }
    return 'Sem cosmético configurado';
}

function cosmeticTypeToFrontend(type: string) {
    switch (type) {
        case 'titulo':
            return 'title' as const;
        case 'moldura':
            return 'frame' as const;
        case 'tema':
            return 'theme' as const;
        default:
            return 'badge' as const;
    }
}

function buildMissionRewardText(payload: Record<string, unknown>) {
    const parts: string[] = [];

    if (typeof payload.xp === 'number' && payload.xp > 0) {
        parts.push(`${payload.xp} XP`);
    }

    if (typeof payload.cosmeticCode === 'string') {
        parts.push(`cosmético ${payload.cosmeticCode}`);
    }

    if (typeof payload.badge === 'string') {
        parts.push(`badge ${payload.badge}`);
    }

    return parts.length ? parts.join(' + ') : 'Recompensa configurada';
}
