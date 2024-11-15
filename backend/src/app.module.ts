import { Module } from '@nestjs/common';
import { PrismaModule } from 'nestjs-prisma';

import { AuthModule } from './auth/auth.module';
import { PingModule } from './ping/ping.module';
import { ProfileModule } from './profile/profile.module';

@Module({
  imports: [PrismaModule.forRoot({ isGlobal: true }), PingModule, AuthModule, ProfileModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
