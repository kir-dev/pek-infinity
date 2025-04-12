import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { StatementImplementation } from '@prisma/client'; // Assuming StatementImplementation enum is available
import { IsEnum, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateCodeStatementDto {
  @ApiProperty({
    description: 'ID of the Authorization this statement belongs to',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  @IsString()
  @IsNotEmpty()
  authId: string;

  @ApiProperty({
    description: 'The predefined implementation logic for this statement',
    enum: StatementImplementation,
    example: StatementImplementation.GROUP_MEMBERSHIP,
  })
  @IsEnum(StatementImplementation)
  @IsNotEmpty()
  implementedBy: StatementImplementation;

  @ApiPropertyOptional({
    description: 'Optional Group ID context for the statement implementation',
    example: 'clg2hq8vw0002uh0g0pzm1jda',
  })
  @IsOptional()
  @IsString()
  onGroupId?: string;

  @ApiPropertyOptional({
    description: 'Optional User ID context for the statement implementation',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  @IsOptional()
  @IsString()
  onUserId?: string;
}
