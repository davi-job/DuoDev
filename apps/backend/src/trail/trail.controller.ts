import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { TrailService } from './trail.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('trilhas')
export class TrailController {
    constructor(private readonly trailService: TrailService) {}

    @Get()
    findAll() {
        return this.trailService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.trailService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.trailService.create(body);
    }
}
