import { Get } from '@nestjs/common';

import { ApiController } from '@/utils/controller.decorator';

import { Ping } from './entities/ping.entity';

@ApiController('ping', { withAuth: false })
export class PingController {
  /**
   * # Health check endpoint<br>
   *
   * This endpoint is a simple health check API designed to confirm that the server is operational.
   *
   * When accessed, it returns a straightforward response indicating that the service is up and running.
   *
   */
  @Get()
  send(): Ping {
    return { ping: 'PONG' };
  }
}
