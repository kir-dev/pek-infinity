import 'reflect-metadata';
import { createMiddleware } from '@tanstack/react-start';
import { container } from 'tsyringe';
import type z from 'zod';
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

export function parseBody<T>(schema: z.ZodType<T>) {
  return createMiddleware().server(async ({ next, request, context = {} }) => {
    const body = await request.json();
    const parsed = schema.safeParse(body);
    if (!parsed.success) {
      throw new Error(`Invalid request body: ${parsed.error.message}`);
    }
    const resp = await next({
      context: { ...context, validatedBody: parsed.data },
    });
    return resp;
  });
}
