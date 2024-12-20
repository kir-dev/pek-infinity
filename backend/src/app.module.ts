import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { AccessModule } from './access/access.module';
import { AppController } from './app.controller';
import { AuthModule } from './auth/auth.module';
import { GroupModule } from './group/group.module';

@Module({
  imports: [
    PrismaModule.forRoot({ isGlobal: true }),
    AuthModule,
    GroupModule,
    AccessModule,
  ],
  controllers: [AppController],
  providers: [],
})
export class AppModule {}
