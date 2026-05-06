import { Controller, Get, Post, UseGuards, Request } from '@nestjs/common';
import { StreakLogService } from './streak-log.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('streak')
export class StreakLogController {
    constructor(private readonly streakLogService: StreakLogService) {}

    @Get()
    findMeus(@Request() req: any) {
        return this.streakLogService.findByUsuario(req.user.id);
    }

    @Get('stats')
    getStats(@Request() req: any) {
        return this.streakLogService.calcularStreaks(req.user.id);
    }

    @Post('registrar-hoje')
    registrarHoje(@Request() req: any) {
        return this.streakLogService.registrarHoje(req.user.id);
    }
}
