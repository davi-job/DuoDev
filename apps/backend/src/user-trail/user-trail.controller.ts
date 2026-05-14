import { Body, Controller, Get, Param, Patch, Post, Request, UseGuards } from '@nestjs/common';
import { UserTrailService } from './user-trail.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('usuario-trilhas')
export class UserTrailController {
    constructor(private readonly userTrailService: UserTrailService) {}

    @Get('meu-progresso')
    findMinhas(@Request() req: any) {
        return this.userTrailService.findByUsuario(req.user.id);
    }

    @Post(':idTrilha/iniciar')
    startTrail(@Request() req: any, @Param('idTrilha') idTrilha: string) {
        return this.userTrailService.startTrail(req.user.id, idTrilha);
    }

    @Post(':idTrilha/aulas/:lessonId/concluir')
    completeLesson(
        @Request() req: any,
        @Param('idTrilha') idTrilha: string,
        @Param('lessonId') lessonId: string,
    ) {
        return this.userTrailService.completeLesson(req.user.id, idTrilha, lessonId);
    }

    @Post(':idTrilha/desafios/:challengeId/concluir')
    completeChallenge(
        @Request() req: any,
        @Param('idTrilha') idTrilha: string,
        @Param('challengeId') challengeId: string,
    ) {
        return this.userTrailService.completeChallenge(req.user.id, idTrilha, challengeId);
    }

    @Post(':idTrilha/quiz/finalizar')
    submitQuiz(
        @Request() req: any,
        @Param('idTrilha') idTrilha: string,
        @Body('questionIds') questionIds: string[],
        @Body('correctAnswers') correctAnswers: number,
        @Body('incorrectAnswers') incorrectAnswers: number,
    ) {
        return this.userTrailService.submitQuiz(req.user.id, idTrilha, {
            questionIds,
            correctAnswers,
            incorrectAnswers,
        });
    }
}
