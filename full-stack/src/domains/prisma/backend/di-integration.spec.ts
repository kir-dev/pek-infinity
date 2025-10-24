import 'reflect-metadata';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { UserService } from '@/domains/user';
import { MockPrismaService } from '../__test__/prisma.service.mock';
import { PrismaService } from './prisma.service';

describe('Dependency Injection Integration', () => {
  let mockPrisma: MockPrismaService;

  beforeEach(() => {
    container.clearInstances();
  });

  afterEach(() => {
    container.clearInstances();
  });

  it('should resolve services with dependencies', () => {
    mockPrisma = new MockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const userService = container.resolve(UserService);

    expect(userService).toBeDefined();
    expect(userService).toBeInstanceOf(UserService);
  });

  it('should inject PrismaService into UserService', async () => {
    mockPrisma = new MockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const userService = container.resolve(UserService);
    const mockUser = { id: 'test-id', name: 'Test User' };
    mockPrisma.user.findUnique.mockResolvedValue(mockUser as any);

    const result = await userService.findByAuthSchId('test-id');

    expect(result).toEqual(mockUser);
    expect(mockPrisma.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'test-id' },
    });
  });

  it('should handle multiple service resolutions', () => {
    mockPrisma = new MockPrismaService();
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
    mockPrisma = new MockPrismaService();
    container.registerInstance(PrismaService, mockPrisma as any);

    const service1 = container.resolve(UserService);
    expect(service1).toBeDefined();

    container.clearInstances();

    // After clearing, we need to re-register
    const newMockPrisma = new MockPrismaService();
    container.registerInstance(PrismaService, newMockPrisma as any);

    const service2 = container.resolve(UserService);
    expect(service2).toBeDefined();
    expect(service2).toBeInstanceOf(UserService);
  });
});
