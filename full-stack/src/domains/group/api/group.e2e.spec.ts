import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GroupService } from '@/domains/group';
import { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';

describe('GroupController (e2e)', () => {
  let mockPrisma: MockPrismaService;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = new MockPrismaService();
    container.registerInstance(
      PrismaService,
      mockPrisma as unknown as PrismaService
    );
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should call controller and reach prisma', async () => {
    const mockGroups = [
      { id: 'test@group1', name: 'Test Group 1' },
      { id: 'test@group2', name: 'Test Group 2' },
    ];
    mockPrisma.group.findMany.mockResolvedValue(mockGroups as any);

    const result = await container.resolve(GroupService).findMany({
      skip: 0,
      take: 10,
    });

    expect(mockPrisma.group.findMany).toHaveBeenCalledWith({
      skip: 0,
      take: 10,
    });
    expect(result).toEqual(mockGroups);
  });
});
