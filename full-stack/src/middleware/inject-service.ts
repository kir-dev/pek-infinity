import 'reflect-metadata';
import { createMiddleware } from '@tanstack/react-start';
import { container } from 'tsyringe';
import type { RequestContext } from './types';

export function injectService<T>(ServiceClass: new (...args: any[]) => T) {
  return createMiddleware().server(async ({ next, context }) => {
    const ctx = context as RequestContext;
    let resolveError: unknown = null;

    try {
      // Try immediate resolution
      ctx.service = container.resolve(ServiceClass);
      return await next();
    } catch (err) {
      // Store for deferred resolution by authGuard
      resolveError = err;
      ctx.pendingServiceClass = ServiceClass;
    }

    try {
      await next();
      if (ctx.pendingServiceClass) {
        throw new Error(
          `Pending service ${ServiceClass.name} was never resolved by authGuard`
        );
      }
    } catch (finalErr) {
      console.error('Service resolution failed:', resolveError);
      throw finalErr;
    }
  });
}
