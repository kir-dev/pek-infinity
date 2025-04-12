import { ApiPropertyOptional } from '@nestjs/swagger';
import { Action } from '@prisma/client';
import { ArrayNotEmpty, IsArray, IsEnum, IsOptional, IsString, MinLength } from 'class-validator';

export class UpdateDbStatementDto {
  @ApiPropertyOptional({
    description: 'List of resource identifiers (e.g., pek:user:123, pek:group:abc)',
    example: ['pek:user:clg2hq8vw0000uh0g0pzm1jd8'],
    isArray: true,
    type: [String],
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  resources?: string[];

  @ApiPropertyOptional({
    description: 'List of actions allowed on the resources',
    example: [Action.USER_PROFILE__VIEW, Action.USER_PROFILE__EDIT],
    enum: Action,
    isArray: true,
  })
  @IsOptional()
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Action, { each: true })
  actions?: Action[];
}
