import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BlogPost } from './blog-post.entity';
import { BlogPostService } from './blog-post.service';
import { BlogPostController } from './blog-post.controller';

@Module({
    imports: [TypeOrmModule.forFeature([BlogPost])],
    providers: [BlogPostService],
    controllers: [BlogPostController],
    exports: [BlogPostService],
})
export class BlogPostModule {}
