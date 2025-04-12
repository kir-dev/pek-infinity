import { Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchStrategy } from './strategies/authsch.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { AccessModule } from '@/access/access.module';

@Module({
  providers: [AuthService, AuthSchStrategy, JwtStrategy],
  controllers: [AuthController],
  imports: [PassportModule, JwtModule, AccessModule],
})
export class AuthModule {}
