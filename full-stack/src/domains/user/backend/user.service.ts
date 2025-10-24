import type * as Prisma from '@prisma/client';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from '@/domains/prisma';

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findByAuthSchId(authSchId: string): Promise<Prisma.User | null> {
    return await this.prisma.user.findUnique({ where: { id: authSchId } });
  }

  create(_createUserDto: {}) {
    return 'This action adds a new user';
  }

  findAll() {
    return `This action returns all user`;
  }

  findOne(id: number) {
    return `This action returns a #${id} user`;
  }

  update(id: number, _updateUserDto: {}) {
    return `This action updates a #${id} user`;
  }

  remove(id: number) {
    return `This action removes a #${id} user`;
  }
}
