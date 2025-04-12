import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsBoolean, IsOptional, IsString, Length } from 'class-validator';

export class UpdateAuthorizationDto {
  @ApiPropertyOptional({
    description: 'Human-readable name for the authorization',
    example: 'KIR-DEV Admin',
  })
  @IsOptional()
  @IsString()
  @Length(7, 20)
  name?: string;

  @ApiPropertyOptional({
    description: 'Indicates if the client should apply this authorization by default',
    example: true,
  })
  @IsOptional()
  @IsBoolean()
  defaultEnabled?: boolean;

  // Note: Updating statements (codeDefined, dbDefined) is handled via AccessStatementController
}
