import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';
import { UserService } from './user.service';

describe('UserService', () => {
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
    // Test DI resolution
    const userService = container.resolve(UserService);
    expect(userService).toBeDefined();
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should find user by authSchId', async () => {
    const userService = container.resolve(UserService);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
      usernames: [],
    };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.findByAuthSchId('auth123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { authSchId: 'auth123' },
      include: { usernames: true },
    });
  });

  it('should find user by id', async () => {
    const userService = container.resolve(UserService);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
      usernames: [],
      profile: null,
    };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.findById('123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
      include: {
        usernames: true,
        profile: {
          select: {
            id: true,
          },
        },
      },
    });
  });

  it('should create system user', async () => {
    const userService = container.resolve(UserService);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
      usernames: [],
    };
    mockPrisma.user.create.mockResolvedValue(mockUser as any);

    const result = await userService.createSystemUser({
      authSchId: 'auth123',
    });

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { authSchId: 'auth123' },
    });
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should attach username to user', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);
    mockPrisma.username.findUnique.mockResolvedValue(null);
    const mockUsername = {
      humanId: 'john_doe',
      userId: '123',
      createdAt: new Date(),
    };
    mockPrisma.username.create.mockResolvedValue(mockUsername as any);

    const result = await userService.attachUsername({
      userId: '123',
      humanId: 'john_doe',
    });

    expect(result).toEqual(mockUsername);
    expect(mockPrisma.username.create).toHaveBeenCalled();
  });

  it('should record login', async () => {
    const userService = container.resolve(UserService);
    const mockUser = {
      id: '123',
      lastLogin: new Date(),
    };
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    const result = await userService.recordLogin({
      userId: '123',
    });

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: expect.objectContaining({
        lastLogin: expect.any(Date),
        updatedAt: expect.any(Date),
      }),
    });
  });

  it('should find many users with pagination', async () => {
    const userService = container.resolve(UserService);
    const mockUsers = [
      { id: '1', authSchId: 'auth1', usernames: [] },
      { id: '2', authSchId: 'auth2', usernames: [] },
    ];
    mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

    const result = await userService.findMany(undefined, { skip: 0, take: 20 });

    expect(result).toEqual(mockUsers);
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('should delete user (soft delete)', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', profile: null };
    mockPrisma.user.findUnique.mockResolvedValue({ id: '123' } as any);
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    const result = await userService.deleteUser('123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: {
        profile: {
          disconnect: true,
        },
      },
      include: {
        usernames: true,
      },
    });
  });
});
