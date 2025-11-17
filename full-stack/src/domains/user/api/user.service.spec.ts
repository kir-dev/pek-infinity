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

    // authSchId should be excluded from response
    expect(result).toEqual({
      id: '123',
      usernames: [],
      profile: null,
    });
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

  it('should create user', async () => {
    const userService = container.resolve(UserService);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
      usernames: [],
      createdAt: new Date(),
      updatedAt: new Date(),
      lastLogin: new Date(),
    };
    mockPrisma.user.create.mockResolvedValue(mockUser as any);

    const result = await userService.create({
      authSchId: 'auth123',
    });

    // authSchId should be excluded from response
    expect(result).not.toHaveProperty('authSchId');
    expect(result).toHaveProperty('id', '123');
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { authSchId: 'auth123' },
    });
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should login by authSchId - create new user', async () => {
    const userService = container.resolve(UserService);
    mockPrisma.user.findUnique.mockResolvedValue(null);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
    };
    mockPrisma.user.create.mockResolvedValue(mockUser as any);

    const result = await userService.loginByAuthSchId('auth123');

    expect(result).toEqual('123');
    expect(mockPrisma.user.create).toHaveBeenCalled();
  });

  it('should login by authSchId - update existing user', async () => {
    const userService = container.resolve(UserService);
    const existingUser = {
      id: '123',
      authSchId: 'auth123',
    };
    const updatedUser = {
      id: '123',
      authSchId: 'auth123',
      lastLogin: new Date(),
    };
    mockPrisma.user.findUnique.mockResolvedValue(existingUser as any);
    mockPrisma.user.update.mockResolvedValue(updatedUser as any);

    const result = await userService.loginByAuthSchId('auth123');

    expect(result).toEqual('123');
    expect(mockPrisma.user.update).toHaveBeenCalled();
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

  it('should find many users with pagination', async () => {
    const userService = container.resolve(UserService);
    const mockUsers = [
      { id: '1', authSchId: 'auth1', usernames: [{ humanId: 'user1' }] },
      { id: '2', authSchId: 'auth2', usernames: [] },
    ];
    mockPrisma.user.findMany.mockResolvedValue(mockUsers as any);

    const result = await userService.findMany(undefined, { skip: 0, take: 20 });

    expect(result).toHaveLength(2);
    // authSchId should be excluded from response
    expect(result[0]).not.toHaveProperty('authSchId');
    expect(result[0].primaryUsername).toEqual({ humanId: 'user1' });
    expect(result[1].primaryUsername).toBeUndefined();
    expect(mockPrisma.user.findMany).toHaveBeenCalled();
  });

  it('should delete user (soft delete)', async () => {
    const userService = container.resolve(UserService);
    const mockUser = {
      id: '123',
      authSchId: 'auth123',
      usernames: [],
      profile: null,
    };
    mockPrisma.user.findUnique.mockResolvedValue({ id: '123' } as any);
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    const result = await userService.deleteUser('123');

    // authSchId should be excluded from response
    expect(result).not.toHaveProperty('authSchId');
    expect(result).toHaveProperty('id', '123');
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
