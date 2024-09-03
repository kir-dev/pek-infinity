import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';

import { UserDto } from '@/auth/entities/user.entity';
import { JWT_SECRET } from '@/config/environment.config';
import { extractJwtTokenFromCookie } from '@/utils/auth.utils';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        (req: Request) => extractJwtTokenFromCookie(req),
      ]),
      ignoreExpiration: false,
      secretOrKey: JWT_SECRET,
    });
  }

  validate(payload: UserDto): UserDto {
    return payload;
  }
}
