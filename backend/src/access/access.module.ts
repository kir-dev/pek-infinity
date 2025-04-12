import { CacheModule } from '@nestjs/cache-manager';
import { Module } from '@nestjs/common';

import { AccessService } from './access.service';
import { AccessRoleController } from './access-authorization.controller';
import { AccessStatementController } from './access-statement.controller';

@Module({
  imports: [CacheModule.register()],
  controllers: [AccessRoleController, AccessStatementController],
  providers: [AccessService],
})
export class AccessModule {}
