import { inject, injectable } from 'tsyringe';
import { type P, PrismaService } from '@/domains/prisma';

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findByAuthSchId(authSchId: string): Promise<P.UserModel | null> {
    return await this.prisma.user.findUnique({ where: { id: authSchId } });
  }

  create(_createUserDto: unknown) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, _updateUserDto: unknown) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
