import 'reflect-metadata';
import { PrismaClient } from '@prisma/client';
import { injectable } from 'tsyringe';

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
