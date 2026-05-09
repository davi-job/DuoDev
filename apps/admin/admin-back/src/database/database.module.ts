import { Global, Module } from '@nestjs/common';
import { db } from '@duodev/db';

@Global()
@Module({
    providers: [{ provide: 'DB', useValue: db }],
    exports: ['DB'],
})
export class DatabaseModule {}
