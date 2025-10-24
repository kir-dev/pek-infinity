import 'reflect-metadata';
import { createMiddleware } from '@tanstack/react-start';
import { container } from 'tsyringe';

export function injectService<T>(ServiceClass: new (...args: any[]) => T) {
  return createMiddleware().server(async ({ next, context = {} }) => {
    let serviceInstance: T | null = null;

    return await next({
      context: {
        ...context,
        get service() {
          if (!serviceInstance) {
            serviceInstance = container.resolve(ServiceClass);
          }
          return serviceInstance;
        },
      },
    });
  });
}
