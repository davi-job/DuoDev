import { Controller, Get, Param, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { LearningService } from './learning.service';

@UseGuards(AuthGuard('jwt'))
@Controller('learning')
export class LearningController {
    constructor(private readonly learningService: LearningService) {}

    @Get('categories')
    listCategories() {
        return this.learningService.listPublishedCategories();
    }

    @Get('categories/:categoryId/trails')
    listTrailsByCategory(@Param('categoryId') categoryId: string) {
        return this.learningService.listPublishedTrailsByCategory(categoryId);
    }

    @Get('trails/:trailId')
    getTrail(@Param('trailId') trailId: string) {
        return this.learningService.getPublishedTrail(trailId);
    }

    @Get('trails/:trailId/content')
    getTrailContent(@Param('trailId') trailId: string) {
        return this.learningService.getPublishedTrailContent(trailId);
    }
}
