import { inject, injectable } from 'tsyringe';
import type { z } from 'zod';
import { PrismaService } from '@/domains/prisma';
import type { ContactBatchSchema } from './contact.schema';

@injectable()
export class ContactService {
  constructor(@inject(PrismaService) private prisma: PrismaService) {}

  async getContacts(userId: string) {
    return this.prisma.contact.findMany({ where: { ownerId: userId } });
  }

  async replaceContacts(
    userId: string,
    contacts: z.infer<typeof ContactBatchSchema>
  ) {
    return this.prisma.$transaction(async (tx) => {
      await tx.contact.deleteMany({
        where: { ownerId: userId },
      });
      await tx.contact.createMany({
        data: contacts.map((c) => ({
          ownerId: userId,
          protocol: c.protocol,
          value: c.value,
        })),
      });
    });
  }
}
