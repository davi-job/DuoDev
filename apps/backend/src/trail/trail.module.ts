import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Trail } from './trail.entity';
import { TrailService } from './trail.service';
import { TrailController } from './trail.controller';

@Module({
    imports: [TypeOrmModule.forFeature([Trail])],
    providers: [TrailService],
    controllers: [TrailController],
    exports: [TrailService],
})
export class TrailModule {}
