import 'reflect-metadata';
import { createMiddleware, useServerFn } from '@tanstack/react-start';
import { container } from 'tsyringe';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';

let mockPrisma: MockPrismaService;

vi.mock(import('@/domains/auth/backend/auth.guard'), async () => {
  return {
    authGuard: (_requiredScopes: string[]) =>
      createMiddleware().server(async ({ next, context = {} }) => {
        return await next({
          context: {
            ...context,
            prisma: mockPrisma as any,
          },
        });
      }),
  };
});

vi.mock('@/middleware', async (importOriginal) => {
  const originalModule: any = await importOriginal();
  return {
    SCOPE: originalModule.SCOPE,
    authGuard: (_requiredScopes: string[]) =>
      createMiddleware({ type: 'function' })
        .client(async ({ next, context = {} }) => {
          return await next({
            sendContext: {
              ...context,
              prisma: mockPrisma as any,
            } as any,
          });
        })
        .server(async ({ next, context = {} }) => {
          return await next({
            sendContext: {
              ...context,
              prisma: mockPrisma as any,
            } as any,
          });
        }),
    injectService: (ServiceClass: any) =>
      createMiddleware({ type: 'function' })
        .client(async ({ next, context = {} }) => {
          return await next({
            sendContext: {
              ...context,
              get service() {
                return container.resolve(ServiceClass);
              },
            } as any,
          });
        })
        .server(async ({ next, context = {} }) => {
          return await next({
            sendContext: {
              ...context,
              get service() {
                return container.resolve(ServiceClass);
              },
            } as any,
          });
        }),
  };
});

import { GroupController } from '@/domains/group/api/group.controller';

describe('GroupController (e2e)', () => {
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

    const resp = await GroupController.findMany({
      data: { page: { skip: 0, take: 10 } },
    } as any);

    const body = await resp?.json();

    await new Promise((r) => setTimeout(r, 500));

    // expect(mockPrisma.group.findMany).toHaveBeenCalled();
    expect(body).toEqual(mockGroups);
  });
});
