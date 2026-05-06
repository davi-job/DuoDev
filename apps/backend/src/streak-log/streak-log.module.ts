import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { StreakLog } from './streak-log.entity';
import { StreakLogService } from './streak-log.service';
import { StreakLogController } from './streak-log.controller';

@Module({
    imports: [TypeOrmModule.forFeature([StreakLog])],
    providers: [StreakLogService],
    controllers: [StreakLogController],
    exports: [StreakLogService],
})
export class StreakLogModule {}
