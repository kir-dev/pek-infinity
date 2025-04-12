import { Injectable } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';

import { JWT_SECRET } from '@/config/environment.config';

import { UserDto } from './entities/user.entity';

@Injectable()
export class AuthService {
  constructor(private jwtService: JwtService) {}

  login(user: UserDto): string {
    return this.jwtService.sign(user, {
      secret: JWT_SECRET,
      expiresIn: '7 days',
    });
  }
}
