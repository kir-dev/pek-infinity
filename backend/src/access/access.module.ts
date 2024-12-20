import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { AccessService } from './access.service';
import { AccessController } from './access-role.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AccessController],
  providers: [AccessService],
})
export class AccessModule {}
