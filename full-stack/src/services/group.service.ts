import 'reflect-metadata';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from './prisma.service';

@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.group.findMany();
  }

  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async create(data: { name: string }) {
    return this.prisma.group.create({ data });
  }
}
