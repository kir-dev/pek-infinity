import { Module } from '@nestjs/common';
import { DatabaseStatementService } from './database-statement.service';

@Module({
  controllers: [],
  providers: [DatabaseStatementService],
})
export class DatabaseStatementModule {}
