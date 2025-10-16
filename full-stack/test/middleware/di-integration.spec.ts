import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { PrismaService } from '../../src/services/prisma.service';
import { UserService } from '../../src/services/user.service';
import { createMockPrismaService } from '../services-mock.util';

describe('Dependency Injection Integration', () => {
  let mockPrisma: ReturnType<typeof createMockPrismaService>;

  beforeEach(() => {
    container.clearInstances();
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should resolve services with dependencies', () => {
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const userService = container.resolve(UserService);

    expect(userService).toBeDefined();
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should inject PrismaService into UserService', async () => {
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const userService = container.resolve(UserService);
    const mockUser = { id: 'test-id', name: 'Test User' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.getUserProfile('test-id');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-id' },
    });
  });

  it('should handle multiple service resolutions', () => {
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const service1 = container.resolve(UserService);
    const service2 = container.resolve(UserService);

    // Both should be defined and be instances of UserService
    expect(service1).toBeDefined();
    expect(service2).toBeDefined();
    expect(service1).toBeInstanceOf(UserService);
    expect(service2).toBeInstanceOf(UserService);
  });

  it('should clear instances properly', () => {
    mockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const service1 = container.resolve(UserService);
    expect(service1).toBeDefined();

    container.clearInstances();

    // After clearing, we need to re-register
    const newMockPrisma = createMockPrismaService();
    container.registerInstance(PrismaService, newMockPrisma as any);

    const service2 = container.resolve(UserService);
    expect(service2).toBeDefined();
    expect(service2).toBeInstanceOf(UserService);
  });
});
