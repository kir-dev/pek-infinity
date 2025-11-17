import 'reflect-metadata';
import { InternalServerError } from 'http-errors';
import { inject, injectable } from 'tsyringe';
import { UserService } from '@/domains/user/backend/user.service';

type AuthSchProfile = {
  authSchId: string;
  firstName: string;
  fullName: string;
  email: string;
};

@injectable()
export class AuthService {
  constructor(
    @inject(UserService) private usersService: UserService
    // @inject(PrismaService) private prisma: PrismaService
  ) {}

  async findOrCreateUser(oAuthUser: AuthSchProfile): Promise<string> {
    try {
      return await this.usersService.loginByAuthSchId(oAuthUser.authSchId);
    } catch (e) {
      console.error(e);
      throw new InternalServerError(
        'Unexpected error during user creation. Please contact Kir-Dev.'
      );
    }
  }

  login(_user: any): { jwt: string } {
    // JWT logic placeholder
    return { jwt: '' };
  }
}
