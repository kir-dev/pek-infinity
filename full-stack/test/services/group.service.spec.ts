import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { GroupService } from '../../src/services/group.service';
import { PrismaService } from '../../src/services/prisma.service';
import { createMockPrismaService } from '../services-mock.util';

describe('GroupService', () => {
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    container.clearInstances();
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);
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

    const result = await groupService.create(newGroup);

    expect(result).toEqual(createdGroup);
    expect(mockPrisma.group.create).toHaveBeenCalledWith({
      data: newGroup,
    });
  });
});
