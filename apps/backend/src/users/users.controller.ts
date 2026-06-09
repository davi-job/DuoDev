import { Controller, Get, UseGuards, Request, Patch, Body, Param, Post } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { UsersService } from './users.service';
import { UpdateUserPreferencesDto } from './dto/update-user-preferences.dto';
import { GamificationService } from '../gamification/gamification.service';
import { EquipCosmeticDto } from './dto/equip-cosmetic.dto';

@Controller('users')
export class UsersController {
    constructor(
        private readonly usersService: UsersService,
        private readonly gamificationService: GamificationService,
    ) {}

    @UseGuards(JwtAuthGuard)
    @Get('profile')
    getProfile(@Request() req) {
        return req.user;
    }

    @UseGuards(JwtAuthGuard)
    @Get('leaderboard/weekly')
    getWeeklyLeaderboard(@Request() req) {
        return this.gamificationService.getWeeklyLeaderboard(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('public/:id/gamification')
    async getPublicGamificationProfile(@Param('id') id: string) {
        const user = await this.usersService.findById(id);
        const metrics = await this.usersService.getGamificationMetrics(id);

        const profileMetrics = {
            xp: user.xp ?? 0,
            streakCurrent: user.streakCurrent ?? 0,
            streakBest: user.streakBest ?? 0,
            startedTrails: metrics.startedTrails,
            completedTrails: metrics.completedTrails,
            accuracy: metrics.accuracy,
            streakLogs: metrics.streakLogs,
            progressTrails: metrics.progressTrails,
        };

        const [gamification, cosmeticsState] = await Promise.all([
            this.gamificationService.buildProfileSnapshot(profileMetrics),
            this.gamificationService.getUserCosmeticsState(id, profileMetrics),
        ]);

        return {
            id: user.id,
            name: user.name,
            avatarUrl: user.avatarUrl,
            xp: user.xp ?? 0,
            streakCurrent: user.streakCurrent ?? 0,
            streakBest: user.streakBest ?? 0,
            gamification: {
                ...gamification,
                unlockedCosmetics: cosmeticsState.inventory,
                inventory: cosmeticsState.inventory,
                equippedCosmetics: cosmeticsState.equippedCosmetics,
            },
        };
    }

    @UseGuards(JwtAuthGuard)
    @Get('rewards/weekly')
    getWeeklyRewardHistory(@Request() req) {
        return this.gamificationService.getWeeklyRewardHistory(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('leaderboard/seasons')
    getSeasonLeaderboardHistory(@Request() req) {
        return this.gamificationService.getSeasonLeaderboardHistory(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('notifications')
    getNotifications(@Request() req) {
        return this.gamificationService.getNotifications(req.user.id, 20);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('notifications/:id/read')
    markNotificationAsRead(@Request() req, @Param('id') id: string) {
        return this.gamificationService.markNotificationAsRead(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('streak-freeze')
    getStreakFreeze(@Request() req) {
        return this.gamificationService.getStreakFreezeState(req.user.id);
    }

    @UseGuards(JwtAuthGuard)
    @Get('cosmetics')
    async getMyCosmetics(@Request() req) {
        const profile = await this.usersService.findById(req.user.id);
        const progressRows = await this.usersService.getGamificationMetrics(req.user.id);
        return this.gamificationService.getUserCosmeticsState(req.user.id, {
            xp: profile.xp ?? 0,
            streakCurrent: profile.streakCurrent ?? 0,
            streakBest: profile.streakBest ?? 0,
            ...progressRows,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Get('missions')
    async getMyMissions(@Request() req) {
        const profile = await this.usersService.findById(req.user.id);
        const progressRows = await this.usersService.getGamificationMetrics(req.user.id);
        return this.gamificationService.getUserMissionState(req.user.id, {
            xp: profile.xp ?? 0,
            streakCurrent: profile.streakCurrent ?? 0,
            streakBest: profile.streakBest ?? 0,
            ...progressRows,
        });
    }

    @UseGuards(JwtAuthGuard)
    @Patch('missions/:id/claim')
    claimMission(@Request() req, @Param('id') id: string) {
        return this.gamificationService.claimMission(req.user.id, id);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('cosmetics/equip')
    equipCosmetic(@Request() req, @Body() dto: EquipCosmeticDto) {
        return this.gamificationService.equipCosmetic(req.user.id, dto.cosmeticItemId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('cosmetics/unequip')
    unequipCosmetic(@Request() req, @Body() dto: EquipCosmeticDto) {
        return this.gamificationService.unequipCosmetic(req.user.id, dto.cosmeticItemId);
    }

    @UseGuards(JwtAuthGuard)
    @Patch('me/preferences')
    async updateMyPreferences(
        @Request() req,
        @Body() updateUserPreferencesDto: UpdateUserPreferencesDto,
    ) {
        return this.usersService.updateUserPreferences(req.user.id, updateUserPreferencesDto);
    }

    @UseGuards(JwtAuthGuard)
    @Post('me/onboarding/complete')
    async completeOnboarding(@Request() req) {
        const user = await this.usersService.findById(req.user.id);
        const updated = await this.usersService.updateUserPreferences(req.user.id, {
            onboardingCompleted: true,
        });

        const shouldGrantWelcomeReward = !user.onboardingCompleted;
        if (shouldGrantWelcomeReward) {
            await this.gamificationService.grantStreakFreeze(req.user.id, 1, {
                source: 'onboarding',
                reason: 'Recompensa de boas-vindas pela conclusão do onboarding.',
            });
        }

        return {
            success: true,
            onboardingCompleted: updated.onboardingCompleted,
            grantedWelcomeReward: shouldGrantWelcomeReward,
        };
    }
}
