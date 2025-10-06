import { applyDecorators, Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ApiBearerAuth as SwaggerBearerAuth } from '@nestjs/swagger';

@Injectable()
class JwtAuthGuard extends AuthGuard('jwt') {}

@Injectable()
export class JwtOptionalAuthGuard extends AuthGuard('jwt') {
  handleRequest<UserEntity>(_: any, user: UserEntity): UserEntity {
    return user;
  }
}

export function JwtAuth() {
  return applyDecorators(UseGuards(JwtAuthGuard), SwaggerBearerAuth());
}
