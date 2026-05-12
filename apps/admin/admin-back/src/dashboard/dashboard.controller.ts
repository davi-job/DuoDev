import { Controller, Get, Query } from '@nestjs/common';
import { DashboardService } from './dashboard.service';

@Controller('dashboard')
export class DashboardController {
    constructor(private readonly dashboardService: DashboardService) {}

    @Get()
    getDashboard() {
        return this.dashboardService.getDashboard();
    }

    @Get('trilhas-por-usuarios')
    getTrilhasPorUsuarios(
        @Query('pagina') paginaStr = '1',
        @Query('ordem') ordemStr = 'desc',
    ) {
        const pagina = Math.max(1, parseInt(paginaStr) || 1);
        const ordem = ordemStr === 'asc' ? 'asc' : 'desc';
        return this.dashboardService.getTrilhasPorUsuarios(pagina, ordem);
    }
}
