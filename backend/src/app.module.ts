import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { PingModule } from './ping/ping.module';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true }), PingModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
