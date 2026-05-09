import { Controller, Get, Post, Patch, Delete, Param, Body, Query, HttpCode, HttpStatus } from '@nestjs/common';
import { TrailsService } from './trails.service';
import { CreateTrailDto } from './dto/create-trail.dto';
import { UpdateTrailDto } from './dto/update-trail.dto';

@Controller('trails')
export class TrailsController {
    constructor(private readonly trailsService: TrailsService) {}

    @Get()
    findAll(@Query('categoryId') categoryId: string) {
        return this.trailsService.findAllByCategory(categoryId);
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.trailsService.findOne(id);
    }

    @Post()
    create(@Body() dto: CreateTrailDto) {
        return this.trailsService.create(dto);
    }

    @Patch(':id')
    update(@Param('id') id: string, @Body() dto: UpdateTrailDto) {
        return this.trailsService.update(id, dto);
    }

    @Delete(':id')
    @HttpCode(HttpStatus.NO_CONTENT)
    remove(@Param('id') id: string) {
        return this.trailsService.remove(id);
    }
}
