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
      const user = await this.usersService.findByAuthSchId(oAuthUser.authSchId);
      if (user) {
        return user.id;
      }

      const newUser = await this.usersService.create({
        authSchId: oAuthUser.authSchId,
        firstName: oAuthUser.firstName,
        fullName: oAuthUser.fullName,
        email: oAuthUser.email,
      });

      return newUser;
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
