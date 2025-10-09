import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { UpdateExternalAccountBatchDto } from './dto/external-account.dto';

@Injectable()
export class ExternalAccountService {
  constructor(private prisma: PrismaService) {}

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
