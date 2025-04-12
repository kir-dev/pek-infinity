import { PickType } from '@nestjs/swagger';
import { CodeStatementEntry } from '../entities/code-statement.entity';

export class CreateCodeStatementDto extends PickType(CodeStatementEntry, [
  'implementedBy',
  'onGroupId',
  'onUserId',
]) {}
