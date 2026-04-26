import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';

import { User } from './users/user.entity';
import { UsersModule } from './users/users.module';
import { AuthModule } from './auth/auth.module';
@Module({
    imports: [
        ConfigModule.forRoot({
            isGlobal: true,
            envFilePath: '.env',
        }),
        TypeOrmModule.forRootAsync({
            imports: [ConfigModule],
            inject: [ConfigService],
            useFactory: (configService: ConfigService) => {
                const password = configService.get<string>('POSTGRES_PASSWORD');

                console.log('DB_PASSWORD:', password); 

                return {
                    type: 'postgres',
                    host: configService.get('POSTGRES_HOST'),
                    port: parseInt(configService.get('POSTGRES_PORT') || '5432', 10),
                    username: configService.get('POSTGRES_USER'),
                    password: password,
                    database: configService.get('POSTGRES_DB'),
                    entities: [User],
                    synchronize: true,
                };
            },
        }),
        UsersModule,
        AuthModule,
    ],
    controllers: [AppController],
    providers: [AppService],
})
export class AppModule {}
