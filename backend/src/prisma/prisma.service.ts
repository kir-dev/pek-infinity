import { Injectable, OnModuleDestroy, OnModuleInit } from '@nestjs/common';
import { PrismaClient } from '@prisma/client';

@Injectable()
export class PrismaService
  extends PrismaClient
  implements OnModuleInit, OnModuleDestroy
{
  constructor() {
    super(
      process.env.NODE_ENV === 'production'
        ? {}
        : {
            log: ['query', 'info', 'warn', 'error'],
          }
    );
  }

  async onModuleInit() {
    if (process.env.NODE_ENV === 'production') {
      await this.$connect();
    }
  }

  async onModuleDestroy() {
    await this.$disconnect();
  }
}
