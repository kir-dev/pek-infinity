import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from './prisma.service';

@injectable()
export class UserService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async getUserProfile(userId: string) {
    return this.prisma.user.findUnique({ where: { id: userId } });
  }

  async updateUserProfile(userId: string, body: { name?: string }) {
    return this.prisma.user.update({
      where: { id: userId },
      data: body,
    });
  }
}
