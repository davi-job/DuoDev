import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { TrailsModule } from './trails/trails.module';
import { ContentModule } from './content/content.module';
import { DashboardModule } from './dashboard/dashboard.module';
import { ExportImportModule } from './export-import/export-import.module';
import { AuthModule } from './auth/auth.module';
import { JwtAuthGuard } from './auth/jwt-auth.guard';
import { UsersModule } from './users/users.module';
import { GamificationModule } from './gamification/gamification.module';

@Module({
    imports: [DatabaseModule, AuthModule, UsersModule, CategoriesModule, TrailsModule, ContentModule, DashboardModule, ExportImportModule, GamificationModule],
    providers: [
        {
            provide: APP_GUARD,
            useClass: JwtAuthGuard,
        },
    ],
})
export class AppModule {}
