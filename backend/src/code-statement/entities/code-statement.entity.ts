import { ApiProperty } from '@nestjs/swagger';
import { type CodeDefinedStatement, StatementImplementation } from '@prisma/client';
import { IsOptional, IsString } from 'class-validator';

export class CodeStatementEntry implements CodeDefinedStatement {
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
    description: 'Implementation of the statement',
    enum: Object.values(StatementImplementation),
    example: StatementImplementation.DEFAULT_ROLE,
  })
  implementedBy: StatementImplementation;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'ID of the group this statement applies to (if applicable)',
    example: 'clg2hq8vw0002uh0g0pzm1jd0',
  })
  onGroupId: string | null;

  @IsString()
  @IsOptional()
  @ApiProperty({
    description: 'ID of the user this statement applies to (if applicable)',
    example: 'clg2hq8vw0003uh0g0pzm1jd1',
  })
  onUserId: string | null;
}
