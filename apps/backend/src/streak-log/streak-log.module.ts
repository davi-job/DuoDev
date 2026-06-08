import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreakLog } from './streak-log.entity';
import { StreakLogService } from './streak-log.service';
import { StreakLogController } from './streak-log.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [TypeOrmModule.forFeature([StreakLog]), UsersModule],
    providers: [StreakLogService],
    controllers: [StreakLogController],
    exports: [StreakLogService],
})
export class StreakLogModule {}
