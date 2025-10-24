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

    const result = await groupService.findMany();

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
      include: { parent: true, children: true },
    });
  });

  it('should create a new organization', async () => {
    const groupService = container.resolve(GroupService);
    const newOrg = {
      idJustName: 'test-org',
      name: 'Test Organization',
      description: 'A test organization',
      purpose: 'COMMITTEE' as const,
      webpage: null,
      mail: null,
      isCommunity: false,
      isResort: false,
      isTaskForce: false,
      hasTransitiveMembership: false,
      isArchived: false,
    };
    const createdOrg = {
      id: 'test-org@test-org',
      ...newOrg,
      isArchived: false,
      parentId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    mockPrisma.group.create.mockResolvedValue(createdOrg as any);

    const result = await groupService.createOrganization(newOrg);

    expect(result).toEqual(createdOrg);
    expect(mockPrisma.group.create).toHaveBeenCalledWith({
      data: {
        ...newOrg,
        isArchived: false,
        parentId: null,
        id: 'test-org@test-org',
      },
    });
  });
});
