import { Module } from '@nestjs/common';
import { UserTrailService } from './user-trail.service';
import { UserTrailController } from './user-trail.controller';

@Module({
    providers: [UserTrailService],
    controllers: [UserTrailController],
    exports: [UserTrailService],
})
export class UserTrailModule {}
