import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { BlogPost } from './blog-post.entity';

@Injectable()
export class BlogPostService {
    constructor(
        @InjectRepository(BlogPost)
        private blogPostRepository: Repository<BlogPost>,
    ) {}

    findAll(): Promise<BlogPost[]> {
        return this.blogPostRepository.find({
            relations: ['autor'],
            order: { publicadoEm: 'DESC' },
        });
    }

    findOne(id: string): Promise<BlogPost | null> {
        return this.blogPostRepository.findOne({
            where: { id },
            relations: ['autor'],
        });
    }

    create(data: Partial<BlogPost>): Promise<BlogPost> {
        const post = this.blogPostRepository.create(data);
        return this.blogPostRepository.save(post);
    }
}
