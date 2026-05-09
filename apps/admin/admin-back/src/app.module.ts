import { Module } from '@nestjs/common';
import { DatabaseModule } from './database/database.module';
import { CategoriesModule } from './categories/categories.module';
import { TrailsModule } from './trails/trails.module';

@Module({
    imports: [DatabaseModule, CategoriesModule, TrailsModule],
})
export class AppModule {}
