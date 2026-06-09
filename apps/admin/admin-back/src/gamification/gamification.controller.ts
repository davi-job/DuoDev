import { Body, Controller, Delete, Get, Param, Patch, Post } from '@nestjs/common';
import { GamificationService } from './gamification.service';

@Controller('gamification')
export class GamificationController {
    constructor(private readonly gamificationService: GamificationService) {}

    @Get('overview')
    getOverview() {
        return this.gamificationService.getOverview();
    }

    @Post('bootstrap')
    bootstrap() {
        return this.gamificationService.bootstrapDefaults();
    }

    @Get('configs')
    listConfigs() {
        return this.gamificationService.listConfigs();
    }

    @Post('configs')
    createConfig(@Body() dto: Record<string, any>) {
        return this.gamificationService.createConfig(dto);
    }

    @Patch('configs/:id')
    updateConfig(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateConfig(id, dto);
    }

    @Delete('configs/:id')
    deleteConfig(@Param('id') id: string) {
        return this.gamificationService.deleteConfig(id);
    }

    @Get('xp-rules')
    listXpRules() {
        return this.gamificationService.listXpRules();
    }

    @Post('xp-rules')
    createXpRule(@Body() dto: Record<string, any>) {
        return this.gamificationService.createXpRule(dto);
    }

    @Patch('xp-rules/:id')
    updateXpRule(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateXpRule(id, dto);
    }

    @Delete('xp-rules/:id')
    deleteXpRule(@Param('id') id: string) {
        return this.gamificationService.deleteXpRule(id);
    }

    @Get('achievements')
    listAchievements() {
        return this.gamificationService.listAchievements();
    }

    @Post('achievements')
    createAchievement(@Body() dto: Record<string, any>) {
        return this.gamificationService.createAchievement(dto);
    }

    @Patch('achievements/:id')
    updateAchievement(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateAchievement(id, dto);
    }

    @Delete('achievements/:id')
    deleteAchievement(@Param('id') id: string) {
        return this.gamificationService.deleteAchievement(id);
    }

    @Get('cosmetics')
    listCosmetics() {
        return this.gamificationService.listCosmetics();
    }

    @Post('cosmetics')
    createCosmetic(@Body() dto: Record<string, any>) {
        return this.gamificationService.createCosmetic(dto);
    }

    @Patch('cosmetics/:id')
    updateCosmetic(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateCosmetic(id, dto);
    }

    @Delete('cosmetics/:id')
    deleteCosmetic(@Param('id') id: string) {
        return this.gamificationService.deleteCosmetic(id);
    }

    @Get('missions')
    listMissions() {
        return this.gamificationService.listMissions();
    }

    @Post('missions')
    createMission(@Body() dto: Record<string, any>) {
        return this.gamificationService.createMission(dto);
    }

    @Patch('missions/:id')
    updateMission(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateMission(id, dto);
    }

    @Delete('missions/:id')
    deleteMission(@Param('id') id: string) {
        return this.gamificationService.deleteMission(id);
    }

    @Get('seasons')
    listSeasons() {
        return this.gamificationService.listSeasons();
    }

    @Post('seasons')
    createSeason(@Body() dto: Record<string, any>) {
        return this.gamificationService.createSeason(dto);
    }

    @Patch('seasons/:id')
    updateSeason(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateSeason(id, dto);
    }

    @Post('seasons/:id/settle')
    settleSeason(@Param('id') id: string) {
        return this.gamificationService.settleSeason(id);
    }

    @Delete('seasons/:id')
    deleteSeason(@Param('id') id: string) {
        return this.gamificationService.deleteSeason(id);
    }

    @Get('reward-tiers')
    listRewardTiers() {
        return this.gamificationService.listRewardTiers();
    }

    @Post('reward-tiers')
    createRewardTier(@Body() dto: Record<string, any>) {
        return this.gamificationService.createRewardTier(dto);
    }

    @Patch('reward-tiers/:id')
    updateRewardTier(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateRewardTier(id, dto);
    }

    @Delete('reward-tiers/:id')
    deleteRewardTier(@Param('id') id: string) {
        return this.gamificationService.deleteRewardTier(id);
    }

    @Get('adaptive-rules')
    listAdaptiveRules() {
        return this.gamificationService.listAdaptiveRules();
    }

    @Post('adaptive-rules')
    createAdaptiveRule(@Body() dto: Record<string, any>) {
        return this.gamificationService.createAdaptiveRule(dto);
    }

    @Patch('adaptive-rules/:id')
    updateAdaptiveRule(@Param('id') id: string, @Body() dto: Record<string, any>) {
        return this.gamificationService.updateAdaptiveRule(id, dto);
    }

    @Delete('adaptive-rules/:id')
    deleteAdaptiveRule(@Param('id') id: string) {
        return this.gamificationService.deleteAdaptiveRule(id);
    }
}
