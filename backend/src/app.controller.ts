import { Controller, Get, Redirect, VERSION_NEUTRAL } from '@nestjs/common';
import { ApiFoundResponse, ApiResponse, ApiTags } from '@nestjs/swagger';

@ApiTags('default')
@Controller({ version: [VERSION_NEUTRAL] })
export class AppController {
  @Get('/')
  @Redirect('/api', 302)
  @ApiFoundResponse({
    description: 'Redirects to the API documentation.',
  })
  home() {}

  /**
   * # Health check endpoint<br>
   *
   * This endpoint is a simple health check API designed to confirm that the server is operational.
   *
   * When accessed, it returns a straightforward response indicating that the service is up and running.
   *
   */
  @Get('/ping')
  @ApiResponse({
    status: 200,
    description: 'Pong',
    type: String,
    example: 'pong',
  })
  ping(): string {
    return 'pong';
  }
}
