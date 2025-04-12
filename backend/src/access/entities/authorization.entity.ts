import { CodeStatementEntry } from '@/code-statement/entities/code-statement.entity';
import { DatabaseStatementEntry } from '@/database-statement/entities/database-statement.entity';
import { ApiProperty } from '@nestjs/swagger';
import { Authorization } from '@prisma/client';
import { IsBoolean, IsDate, IsString, Length, MaxLength, MinLength } from 'class-validator';

export class AuthorizationEntity implements Authorization {
  @IsString()
  @MinLength(1)
  @ApiProperty({
    description: 'Unique identifier for the authorization',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  id: string;

  @IsString()
  @Length(7, 20)
  @ApiProperty({
    description: 'Human-readable name for the authorization',
    example: 'KIR-DEV öregtag',
  })
  name: string;

  @IsBoolean()
  @ApiProperty({
    description: 'Indicates if the client should apply this authorization by default',
  })
  defaultEnabled: boolean;

  @ApiProperty({
    description: 'statements stored as code, defined for the authorization',
    type: [CodeStatementEntry],
  })
  codeDefined: CodeStatementEntry[];

  @ApiProperty({
    description: 'statements stored as database, defined for the authorization',
    type: [DatabaseStatementEntry],
  })
  dbDefined: DatabaseStatementEntry[];

  @IsDate()
  @ApiProperty({
    description: 'Timestamp when the authorization was created',
    example: '2023-04-03T00:00:00.000Z',
  })
  createdAt: Date;

  @IsDate()
  @ApiProperty({
    description: 'Timestamp when the authorization was last updated',
    example: '2023-04-03T00:00:00.000Z',
  })
  updatedAt: Date;
}
