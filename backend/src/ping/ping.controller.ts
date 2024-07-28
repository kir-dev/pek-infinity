import { Controller, Get } from '@nestjs/common';

import { Ping } from './entities/ping.entity';

@Controller('ping')
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
