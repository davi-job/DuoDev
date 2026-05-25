import { Controller, Get, Post, Body, Param, UseGuards } from '@nestjs/common';
import { BlogPostService } from './blog-post.service';
import { AuthGuard } from '@nestjs/passport';

@UseGuards(AuthGuard('jwt'))
@Controller('blog')
export class BlogPostController {
    constructor(private readonly blogPostService: BlogPostService) {}

    @Get()
    findAll() {
        return this.blogPostService.findAll();
    }

    @Get(':id')
    findOne(@Param('id') id: string) {
        return this.blogPostService.findOne(id);
    }

    @Post()
    create(@Body() body: any) {
        return this.blogPostService.create(body);
    }
}
