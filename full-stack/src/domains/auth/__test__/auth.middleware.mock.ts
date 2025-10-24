import { createMiddleware } from '@tanstack/react-start';
import type { PrismaService } from '@/domains/prisma';
import { MockPrismaService } from '@/domains/prisma/__test__/prisma.service.mock';

// Simple auth mock that just passes through
export function createMockAuthGuard(_requiredScopes: string[]) {
  return createMiddleware().server(async ({ next, context = {} }) => {
    return await next({
      context: {
        ...context,
        prisma: new MockPrismaService() as any as PrismaService,
      },
    });
  });
}
