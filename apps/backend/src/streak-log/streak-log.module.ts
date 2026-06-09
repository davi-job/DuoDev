import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreakLog } from './streak-log.entity';
import { StreakLogService } from './streak-log.service';
import { StreakLogController } from './streak-log.controller';
import { UsersModule } from '../users/users.module';
import { GamificationModule } from '../gamification/gamification.module';

@Module({
    imports: [TypeOrmModule.forFeature([StreakLog]), UsersModule, GamificationModule],
    providers: [StreakLogService],
    controllers: [StreakLogController],
    exports: [StreakLogService],
})
export class StreakLogModule {}
