import {
    Controller, Get, Post, Patch, Delete,
    Param, Body, HttpCode, HttpStatus,
} from '@nestjs/common';
import { ContentService } from './content.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';
import { CreateQuestionDto } from './dto/create-question.dto';
import { UpdateQuestionDto } from './dto/update-question.dto';
import { CreateChallengeDto } from './dto/create-challenge.dto';
import { UpdateChallengeDto } from './dto/update-challenge.dto';
import { ReorderContentDto } from './dto/reorder-content.dto';

@Controller('content')
export class ContentController {
    constructor(private readonly contentService: ContentService) {}

    @Get(':trailId')
    findAll(@Param('trailId') trailId: string) {
        return this.contentService.findAllByTrail(trailId);
    }

    @Patch(':trailId/reorder')
    reorder(@Param('trailId') trailId: string, @Body() dto: ReorderContentDto) {
        return this.contentService.reorder(trailId, dto);
    }

    // ── Lessons ──────────────────────────────────────────────────────────────

    @Post('lessons')
    createLesson(@Body() dto: CreateLessonDto) {
        return this.contentService.createLesson(dto);
    }

    @Patch('lessons/:id')
    updateLesson(@Param('id') id: string, @Body() dto: UpdateLessonDto) {
        return this.contentService.updateLesson(id, dto);
    }

    @Delete('lessons/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeLesson(@Param('id') id: string) {
        return this.contentService.removeLesson(id);
    }

    // ── Questions ────────────────────────────────────────────────────────────

    @Post('questions')
    createQuestion(@Body() dto: CreateQuestionDto) {
        return this.contentService.createQuestion(dto);
    }

    @Patch('questions/:id')
    updateQuestion(@Param('id') id: string, @Body() dto: UpdateQuestionDto) {
        return this.contentService.updateQuestion(id, dto);
    }

    @Delete('questions/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeQuestion(@Param('id') id: string) {
        return this.contentService.removeQuestion(id);
    }

    // ── Challenges ───────────────────────────────────────────────────────────

    @Post('challenges')
    createChallenge(@Body() dto: CreateChallengeDto) {
        return this.contentService.createChallenge(dto);
    }

    @Patch('challenges/:id')
    updateChallenge(@Param('id') id: string, @Body() dto: UpdateChallengeDto) {
        return this.contentService.updateChallenge(id, dto);
    }

    @Delete('challenges/:id')
    @HttpCode(HttpStatus.NO_CONTENT)
    removeChallenge(@Param('id') id: string) {
        return this.contentService.removeChallenge(id);
    }
}
