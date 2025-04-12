import { ApiProperty } from '@nestjs/swagger';
import { Action } from '@prisma/client'; // Assuming Action enum is available from prisma client
import { ArrayNotEmpty, IsArray, IsEnum, IsNotEmpty, IsString, MinLength } from 'class-validator';

export class CreateDbStatementDto {
  @ApiProperty({
    description: 'ID of the Authorization this statement belongs to',
    example: 'clg2hq8vw0000uh0g0pzm1jd8',
  })
  @IsString()
  @IsNotEmpty()
  authId: string;

  @ApiProperty({
    description: 'List of resource identifiers (e.g., pek:user:123, pek:group:abc)',
    example: ['pek:user:clg2hq8vw0000uh0g0pzm1jd8'],
    isArray: true,
    type: [String],
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsString({ each: true })
  @MinLength(1, { each: true })
  resources: string[];

  @ApiProperty({
    description: 'List of actions allowed on the resources',
    example: [Action.USER_PROFILE__VIEW, Action.USER_PROFILE__EDIT],
    enum: Action,
    isArray: true,
  })
  @IsArray()
  @ArrayNotEmpty()
  @IsEnum(Action, { each: true })
  actions: Action[];
}
