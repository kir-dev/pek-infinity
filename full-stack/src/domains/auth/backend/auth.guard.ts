import 'reflect-metadata';
import { createMiddleware } from '@tanstack/react-start';
import { container } from 'tsyringe';
import { PrismaService } from '@/domains/prisma';

export function authGuard(requiredScopes: string[]) {
  return createMiddleware().server(async ({ next, context = {} }) => {
    const user = {
      id: 'mock-user-id',
      scopes: requiredScopes, // Mock: granting all required scopes
    };

    // 2. Check scopes
    const hasAllScopes = requiredScopes.every((scope) =>
      user.scopes.includes(scope)
    );
    if (!hasAllScopes) {
      throw new Error('Forbidden: insufficient scopes');
    }

    // 3. Create and register PrismaService per request
    const prisma = new PrismaService();
    container.registerInstance(PrismaService, prisma);

    const resp = await next({
      context: { ...context, prisma },
    });
    return resp;
  });
}
