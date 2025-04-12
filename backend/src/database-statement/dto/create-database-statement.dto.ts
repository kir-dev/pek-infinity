import { PickType } from '@nestjs/swagger';
import { DatabaseStatementEntry } from '../entities/database-statement.entity';

export class CreateDatabaseStatementDto extends PickType(DatabaseStatementEntry, [
  'actions',
  'resources',
]) {}
