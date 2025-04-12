import { ApiPropertyOptional } from '@nestjs/swagger';
import { StatementImplementation } from '@prisma/client';
import { IsEnum, IsOptional, IsString, ValidateIf } from 'class-validator';

export class UpdateCodeStatementDto {
  @ApiPropertyOptional({
    description: 'The predefined implementation logic for this statement',
    enum: StatementImplementation,
    example: StatementImplementation.GROUP_MEMBERSHIP,
  })
  @IsOptional()
  @IsEnum(StatementImplementation)
  implementedBy?: StatementImplementation;

  @ApiPropertyOptional({
    description:
      'Optional Group ID context for the statement implementation. Set to null to remove.',
    example: 'clg2hq8vw0002uh0g0pzm1jda',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.onGroupId !== null) // Allow null but validate if string
  onGroupId?: string | null;

  @ApiPropertyOptional({
    description:
      'Optional User ID context for the statement implementation. Set to null to remove.',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
    nullable: true,
  })
  @IsOptional()
  @IsString()
  @ValidateIf((o) => o.onUserId !== null) // Allow null but validate if string
  onUserId?: string | null;
}
