import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GroupService } from '@/domains/group';
import { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';

describe('GroupService', () => {
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

  it('should be injectable and resolve correctly', () => {
    const groupService = container.resolve(GroupService);
    expect(groupService).toBeDefined();
    expect(groupService).toBeInstanceOf(GroupService);
  });

  it('should find all groups', async () => {
    const groupService = container.resolve(GroupService);
    const mockGroups = [
      { id: '1', name: 'Group 1' },
      { id: '2', name: 'Group 2' },
    ];
    mockPrisma.group.findMany.mockResolvedValue(mockGroups as any);

    const result = await groupService.findAll();

    expect(result).toEqual(mockGroups);
    expect(mockPrisma.group.findMany).toHaveBeenCalled();
  });

  it('should find one group by id', async () => {
    const groupService = container.resolve(GroupService);
    const mockGroup = { id: '1', name: 'Test Group' };
    mockPrisma.group.findUnique.mockResolvedValue(mockGroup as any);

    const result = await groupService.findOne('1');

    expect(result).toEqual(mockGroup);
    expect(mockPrisma.group.findUnique).toHaveBeenCalledWith({
      where: { id: '1' },
    });
  });

  it('should create a new group', async () => {
    const groupService = container.resolve(GroupService);
    const newGroup = { name: 'New Group' };
    const createdGroup = { id: '3', ...newGroup };
    mockPrisma.group.create.mockResolvedValue(createdGroup as any);

    const result = await groupService.create(newGroup as any);

    expect(result).toEqual(createdGroup);
    expect(mockPrisma.group.create).toHaveBeenCalledWith({
      data: newGroup,
    });
  });
});
