import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../../src/services/prisma.service';
import { UserService } from '../../src/services/user.service';
import { createMockPrismaService } from '../services-mock.util';

describe('UserService', () => {
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
    // Test DI resolution
    const userService = container.resolve(UserService);
    expect(userService).toBeDefined();
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should get user profile', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', name: 'John Doe' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.getUserProfile('123');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: '123' },
    });
  });

  it('should update user profile', async () => {
    const userService = container.resolve(UserService);
    const mockUser = { id: '123', name: 'Jane Doe' };
    mockPrisma.user.update.mockResolvedValue(mockUser as any);

    const result = await userService.updateUserProfile('123', {
      name: 'Jane Doe',
    });

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.update).toHaveBeenCalledWith({
      where: { id: '123' },
      data: { name: 'Jane Doe' },
    });
  });
});
