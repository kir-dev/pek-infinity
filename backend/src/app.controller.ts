import { Controller, Get, VERSION_NEUTRAL, Version } from '@nestjs/common';

@Controller()
export class AppController {
  @Get()
  @Version(VERSION_NEUTRAL)
  getRoot(): string {
    return 'Hello World!';
  }
}
