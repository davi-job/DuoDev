import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UserTrail } from './user-trail.entity';
import { UserTrailService } from './user-trail.service';
import { UserTrailController } from './user-trail.controller';

@Module({
    imports: [TypeOrmModule.forFeature([UserTrail])],
    providers: [UserTrailService],
    controllers: [UserTrailController],
    exports: [UserTrailService],
})
export class UserTrailModule {}
