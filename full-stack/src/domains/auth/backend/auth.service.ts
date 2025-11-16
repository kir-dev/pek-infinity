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
        // Update last login timestamp
        await this.usersService.recordLogin({
          userId: user.id,
          timestamp: new Date(),
        });
        return user.id;
      }

      // Create new system user
      const newUser = await this.usersService.createSystemUser({
        authSchId: oAuthUser.authSchId,
      });

      return newUser.id;
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
