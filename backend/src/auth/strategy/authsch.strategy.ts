import {
  AuthSchProfile,
  AuthSchScope,
  Strategy,
} from '@kir-dev/passport-authsch';
import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';

@Injectable()
export class AuthSchStrategy extends PassportStrategy(Strategy) {
  constructor() {
    super({
      clientId: process.env.AUTHSCH_CLIENT_ID!,
      clientSecret: process.env.AUTHSCH_CLIENT_SECRET!,
      scopes: [AuthSchScope.PROFILE, AuthSchScope.EMAIL],
    });
  }

  async validate(userProfile: AuthSchProfile) {
    return Promise.resolve({
      name: userProfile.fullName,
      id: userProfile.pek?.pekId ?? 12345,
    });
  }
}
