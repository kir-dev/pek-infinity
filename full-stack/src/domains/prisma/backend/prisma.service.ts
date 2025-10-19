import 'reflect-metadata';
import { injectable } from 'tsyringe';
import { PrismaClient } from '../../../../../generated/prisma/client';

@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    super(
      process.env.NODE_ENV === 'production'
        ? { log: ['query', 'info', 'warn', 'error'] }
        : {
            log: ['query', 'info', 'warn', 'error'],
          }
    );
  }
}
