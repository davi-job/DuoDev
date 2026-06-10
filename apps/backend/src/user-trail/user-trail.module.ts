import { Module } from '@nestjs/common';
import { UserTrailService } from './user-trail.service';
import { UserTrailController } from './user-trail.controller';
import { UsersModule } from '../users/users.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
    imports: [UsersModule, GamificationModule],
    providers: [UserTrailService],
    controllers: [UserTrailController],
    exports: [UserTrailService],
})
export class UserTrailModule {}
