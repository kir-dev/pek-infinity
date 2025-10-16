import 'reflect-metadata';
import { createMiddleware } from '@tanstack/react-start';
import { container } from 'tsyringe';
import { PrismaService } from '../services/prisma.service';
import type { RequestContext } from './types';

export function authGuard(requiredScopes: string[]) {
  return createMiddleware().server(async ({ next, context }) => {
    const ctx = context as RequestContext;

    // 1. Authenticate user (example: from session/token)
    // In a real implementation, you would extract user from JWT token or session
    // For now, we're using a mock user for demonstration purposes
    ctx.user = {
      id: 'mock-user-id',
      scopes: requiredScopes, // Mock: granting all required scopes
    };

    // 2. Check scopes
    const hasAllScopes = requiredScopes.every((scope) =>
      ctx.user!.scopes.includes(scope)
    );
    if (!hasAllScopes) {
      throw new Error('Forbidden: insufficient scopes');
    }

    // 3. Create and register PrismaService per request
    const prisma = new PrismaService();
    container.registerInstance(PrismaService, prisma);
    ctx.prisma = prisma;

    // 4. Resolve pending service if exists
    if (ctx.pendingServiceClass) {
      ctx.service = container.resolve(ctx.pendingServiceClass);
      delete ctx.pendingServiceClass;
    }

    try {
      // 5. Execute handler
      return await next();
    } finally {
      // 6. Cleanup: disconnect Prisma
      await prisma.$disconnect();
    }
  });
}
