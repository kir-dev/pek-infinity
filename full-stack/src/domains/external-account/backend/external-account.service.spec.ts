import { ExternalAccountProtocol } from '@prisma/browser';
import { beforeEach, describe, expect, it } from 'vitest';
import type { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';
import { ExternalAccountService } from './external-account.service';

describe('ExternalAccountService', () => {
  let service: ExternalAccountService;
  let prisma: MockPrismaService;

  beforeEach(() => {
    prisma = new MockPrismaService();
    service = new ExternalAccountService(prisma as unknown as PrismaService);
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
          protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER,
          accountName: '@testuser',
          ownerId,
        },
        {
          id: '2',
          protocol: ExternalAccountProtocol.TELEGRAM,
          accountName: '@testuser2',
          ownerId,
        },
      ];
      prisma.externalAccountLink.findMany.mockResolvedValue(accounts);

      const result = await service.findAll(ownerId);

      expect(prisma.externalAccountLink.findMany).toHaveBeenCalledWith({
        where: { ownerId },
      });
      expect(result).toEqual(accounts);
    });

    it('should return empty array if no external accounts exist', async () => {
      const ownerId = 'user123';
      prisma.externalAccountLink.findMany.mockResolvedValue([]);

      const result = await service.findAll(ownerId);

      expect(prisma.externalAccountLink.findMany).toHaveBeenCalledWith({
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
          protocol: ExternalAccountProtocol.X_FORMERLY_TWITTER,
          accountName: '@newuser',
        },
        {
          protocol: ExternalAccountProtocol.TELEGRAM,
          accountName: '@newuser2',
        },
      ];

      await service.updateBatch(ownerId, accounts);

      expect(prisma.externalAccountLink.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: expect.any(Array),
        })
      );
    });

    it('should handle empty accounts array', async () => {
      const ownerId = 'user123';

      await service.updateBatch(ownerId, []);

      expect(prisma.externalAccountLink.createMany).toHaveBeenCalledWith(
        expect.objectContaining({
          data: [],
        })
      );
    });
  });
});
