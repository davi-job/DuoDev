import { Controller, Get, Post, Body } from '@nestjs/common';
import { ExportImportService } from './export-import.service';
import { ImportContentDto } from './dto/import-content.dto';

@Controller()
export class ExportImportController {
    constructor(private readonly exportImportService: ExportImportService) {}

    @Get('export')
    exportContent() {
        return this.exportImportService.exportContent();
    }

    @Post('import')
    importContent(@Body() dto: ImportContentDto) {
        return this.exportImportService.importContent(dto);
    }
}
