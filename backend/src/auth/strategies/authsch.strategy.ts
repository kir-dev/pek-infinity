import {
  AuthSchProfile,
  AuthSchScope,
  Strategy,
} from '@kir-dev/passport-authsch';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

import {
  AUTHSCH_CLIENT_ID,
  AUTHSCH_CLIENT_SECRET,
} from '@/config/environment.config';

import { UserDto } from '../entities/user.entity';

@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientId: AUTHSCH_CLIENT_ID,
      clientSecret: AUTHSCH_CLIENT_SECRET,
      scopes: [AuthSchScope.PROFILE, AuthSchScope.PEK_PROFILE],
    });
  }

  validate(userProfile: AuthSchProfile): Promise<UserDto> {
    return Promise.resolve({
      name: userProfile.fullName,
    });
  }
}
