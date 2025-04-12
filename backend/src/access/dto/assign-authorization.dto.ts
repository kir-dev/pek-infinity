import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, MinLength } from 'class-validator';

export class AssignAuthorizationDto {
  @ApiProperty({
    description: 'IDs of the users to assign/unassign the authorization to',
    example: ['clg2hq8vw0000uh0g0pzm1jd8', 'clg2hq8vw0001uh0g0pzm1jd9'],
    isArray: true,
    minItems: 1,
    type: [String],
  })
  @IsString({ each: true })
  @IsNotEmpty({ each: true })
  @MinLength(1)
  userIds: string[];
}
