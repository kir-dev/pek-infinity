import 'reflect-metadata';
import type * as Prisma from '@prisma/client';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from '@/domains/prisma';

@injectable()
export class GroupService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findAll() {
    return this.prisma.group.findMany();
  }

  async findOne(id: string) {
    return this.prisma.group.findUnique({ where: { id } });
  }

  async create(data: Prisma.Group) {
    return this.prisma.group.create({ data });
  }
}
