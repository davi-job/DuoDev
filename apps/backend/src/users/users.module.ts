import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './user.entity';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { UserTrail } from '../user-trail/user-trail.entity';
import { StreakLog } from '../streak-log/streak-log.entity';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
    imports: [TypeOrmModule.forFeature([User, UserTrail, StreakLog]), GamificationModule],
    providers: [UsersService],
    controllers: [UsersController],
    exports: [UsersService],
})
export class UsersModule {}
