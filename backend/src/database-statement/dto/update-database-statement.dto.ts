import { PartialType } from '@nestjs/swagger';
import { CreateDatabaseStatementDto } from './create-database-statement.dto';

export class UpdateDatabaseStatementDto extends PartialType(CreateDatabaseStatementDto) {}
