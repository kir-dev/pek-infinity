import { beforeEach, describe, expect, it } from 'vitest';
import { $Enums, type PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';
import { ContactService } from './contact.service';

describe('ContactService', () => {
  let service: ContactService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new ContactService(prisma as unknown as PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('should return all external accounts for the owner', async () => {
      const ownerId = 'user123';
      const accounts = [
        {
          id: '1',
          protocol: $Enums.ContactProtocol.X_FORMERLY_TWITTER,
          accountName: '@testuser',
          ownerId,
        },
        {
          id: '2',
          protocol: $Enums.ContactProtocol.TELEGRAM,
          accountName: '@testuser2',
          ownerId,
        },
      ];
      prisma.contact.findMany.mockResolvedValue(accounts);

      const result = await service.getContacts(ownerId);

      expect(prisma.contact.findMany).toHaveBeenCalledWith({
        where: { ownerId },
      });
      expect(result).toEqual(accounts);
    });

    it('should return empty array if no contacts exist', async () => {
      const ownerId = 'user123';
      prisma.contact.findMany.mockResolvedValue([]);

      const result = await service.getContacts(ownerId);

      expect(prisma.contact.findMany).toHaveBeenCalledWith({
        where: { ownerId },
      });
      expect(result).toEqual([]);
    });
  });

  describe('updateBatch', () => {
    it('should update external accounts in batch', async () => {
      const ownerId = 'user123';
      const accounts = [
        {
          protocol: $Enums.ContactProtocol.X_FORMERLY_TWITTER,
          value: '@newuser',
        },
        {
          protocol: $Enums.ContactProtocol.TELEGRAM,
          value: '@newuser2',
        },
      ];

      await service.replaceContacts(ownerId, accounts);

      expect(prisma.contact.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
        })
      );
    });

    it('should handle empty accounts array', async () => {
      const ownerId = 'user123';

      await service.replaceContacts(ownerId, []);

      expect(prisma.contact.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
        })
      );
    });
  });
});
