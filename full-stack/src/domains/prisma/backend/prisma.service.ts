import 'reflect-metadata';
import { PrismaPg as PrismaAdapter } from '@prisma/adapter-pg';
import { injectable } from 'tsyringe';
// import { PrismaPostgresAdapter as PrismaAdapter } from '@prisma/adapter-ppg'

import { PrismaClient } from '@/_generated/prisma/client';
import { env } from '@/env';

@injectable()
export class PrismaService extends PrismaClient {
  constructor() {
    const adapter = new PrismaAdapter({
      connectionString: env.POSTGRES_PRISMA_URL,
    });

    super({
      adapter,
      log:
        process.env.NODE_ENV === 'production'
          ? ['error']
          : ['query', 'info', 'warn', 'error'],
    });
  }
}
