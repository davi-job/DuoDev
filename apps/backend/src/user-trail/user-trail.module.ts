import { Module } from '@nestjs/common';
import { UserTrailService } from './user-trail.service';
import { UserTrailController } from './user-trail.controller';
import { UsersModule } from '../users/users.module';

@Module({
    imports: [UsersModule],
    providers: [UserTrailService],
    controllers: [UserTrailController],
    exports: [UserTrailService],
})
export class UserTrailModule {}
