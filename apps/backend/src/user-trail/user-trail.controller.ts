import { Controller, Get, Patch, Body, Param, UseGuards, Request } from '@nestjs/common';
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

    @Patch(':idTrilha/progresso')
    updateProgresso(
        @Request() req: any,
        @Param('idTrilha') idTrilha: string,
        @Body('progressoPct') progressoPct: number,
    ) {
        return this.userTrailService.updateProgresso(req.user.id, idTrilha, progressoPct);
    }
}
