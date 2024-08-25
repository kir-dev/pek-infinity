import { Injectable } from '@nestjs/common';
import { PrismaService } from 'nestjs-prisma';

import { Ping } from './entities/ping.entity';

@Injectable()
export class PingService {
  constructor(private readonly prisma: PrismaService) {}

  async getPing(): Promise<Ping> {
    await this.prisma.user.count();
    return { ping: 'PONG' };
  }
}
