import { Module } from '@nestjs/common';
import { CodeStatementService } from './code-statement.service';

@Module({
  controllers: [],
  providers: [CodeStatementService],
})
export class CodeStatementModule {}
