import { ApiProperty } from '@nestjs/swagger';
import { Action, type DbDefinedStatement } from '@prisma/client';

export class DatabaseStatementEntry implements DbDefinedStatement {
  @ApiProperty({
    description: 'Unique identifier for the statement',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  id: string;

  @ApiProperty({
    description: 'ID of the parent authorization',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  authId: string;

  @ApiProperty({
    description: 'List of resources this statement applies to',
  })
  resources: string[];

  @ApiProperty({
    description: 'List of actions allowed by this statement',
    enum: Object.values(Action),
    isArray: true,
  })
  actions: Action[];
}
