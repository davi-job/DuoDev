import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { TrailsModule } from './trails/trails.module';
import { ContentModule } from './content/content.module';
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
    imports: [DatabaseModule, CategoriesModule, TrailsModule, ContentModule, DashboardModule],
})
export class AppModule {}
