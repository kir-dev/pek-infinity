import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { PrismaClient } from '@prisma/client';

@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super(
      process.env.NODE_ENV === 'production'
        ? {}
        : {
            log: ['query', 'info', 'warn', 'error'],
          }
    );
  }
}
