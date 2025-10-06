import { forwardRef, Module } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { UserModule } from '@/user/user.module';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthSchStrategy } from './strategy/authsch.strategy';
import { JwtStrategy } from './strategy/jwt.strategy';

@Module({
  imports: [
    PassportModule.register({}),
    JwtModule,
    forwardRef(() => UserModule),
  ],
  controllers: [AuthController],
  providers: [AuthService, AuthSchStrategy, JwtStrategy],
})
export class AuthModule {}
