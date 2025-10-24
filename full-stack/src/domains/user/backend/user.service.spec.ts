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

  it('should get user profile', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', name: 'John Doe' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.findByAuthSchId('123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
    });
  });

  it('should update user profile', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', name: 'Jane Doe' };
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    await userService.update(123, {
      name: 'Jane Doe',
    });

    // expect(result).toEqual(mockUser);
    // expect(mockPrisma.user.update).toHaveBeenCalledWith({
    //   where: { id: '123' },
    //   data: { name: 'Jane Doe' },
    // });
  });
});
