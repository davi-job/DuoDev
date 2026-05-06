import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './users/user.entity';
import { Trail } from './trail/trail.entity';
import { UserTrail } from './user-trail/user-trail.entity';
import { StreakLog } from './streak-log/streak-log.entity';
import { BlogPost } from './blog-post/blog-post.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
import { TrailModule } from './trail/trail.module';
import { UserTrailModule } from './user-trail/user-trail.module';
import { StreakLogModule } from './streak-log/streak-log.module';
import { BlogPostModule } from './blog-post/blog-post.module';

@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => ({
                type: 'postgres',
                host: configService.get('POSTGRES_HOST'),
                port: parseInt(configService.get('POSTGRES_PORT') || '5432', 10),
                username: configService.get('POSTGRES_USER'),
                password: configService.get('POSTGRES_PASSWORD'),
                database: configService.get('POSTGRES_DB'),
                entities: [User, Trail, UserTrail, StreakLog, BlogPost],
                synchronize: true, // desativar em produção
            }),
        }),
        UsersModule,
        AuthModule,
        TrailModule,
        UserTrailModule,
        StreakLogModule,
        BlogPostModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
