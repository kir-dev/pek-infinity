import { Module } from '@nestjs/common';
import { PrismaModule } from '@/prisma/prisma.module';
import { ExternalAccountController } from './external-account.controller';
import { ExternalAccountService } from './external-account.service';

@Module({
  imports: [PrismaModule],
  controllers: [ExternalAccountController],
  providers: [ExternalAccountService],
})
export class ExternalAccountModule {}
