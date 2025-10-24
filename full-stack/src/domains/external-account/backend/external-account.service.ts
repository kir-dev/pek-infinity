import 'reflect-metadata';
import type * as Prisma from '@prisma/client';
import { inject, injectable } from 'tsyringe';
import { PrismaService } from '@/domains/prisma';

type ExternalAccountDto = {
  protocol: Prisma.ExternalAccountProtocol;
  accountName: string;
};

type UpdateExternalAccountBatchDto = {
  accounts: ExternalAccountDto[];
};

@injectable()
export class ExternalAccountService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async findAll(ownerId: string) {
    return this.prisma.externalAccountLink.findMany({
      where: { ownerId },
    });
  }

  async updateBatch(
    ownerId: string,
    accounts: UpdateExternalAccountBatchDto['accounts']
  ) {
    await this.prisma.$transaction(async (tx) => {
      await tx.externalAccountLink.deleteMany({
        where: { ownerId },
      });

      await tx.externalAccountLink.createMany({
        data: accounts.map((account) => ({
          ...account,
          ownerId,
        })),
      });
    });
  }
}
