import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Trail } from './trail.entity';

@Injectable()
export class TrailService {
    constructor(
        @InjectRepository(Trail)
        private trailRepository: Repository<Trail>,
    ) {}

    findAll(): Promise<Trail[]> {
        return this.trailRepository.find();
    }

    findOne(id: string): Promise<Trail | null> {
        return this.trailRepository.findOneBy({ id });
    }

    create(data: Partial<Trail>): Promise<Trail> {
        const trail = this.trailRepository.create(data);
        return this.trailRepository.save(trail);
    }
}
