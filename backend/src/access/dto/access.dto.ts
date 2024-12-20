import { ApiProperty } from '@nestjs/swagger';

import AllGuards from '../access.guard';
import { Action } from '../types/action';
import { AccessResource } from '../types/resource';
import { Statement } from './statement.dto';

export class CreateOrUpdateRoleDto {
  @ApiProperty({
    description:
      'A human-readable name for the role, used for display purposes.',
    example: 'Member of kir-dev',
  })
  displayName: string;

  @ApiProperty({
    description:
      'Indicates whether this role should be enabled by default on the client.',
    example: true,
  })
  defaultEnabled?: boolean;
}

export class RoleDto {
  @ApiProperty({
    description:
      'A human-readable name for the role, used for display purposes.',
    example: 'Member of kir-dev',
  })
  displayName: string;

  @ApiProperty({
    description: 'A unique identifier for the role.',
    example: '524$@wEsf!',
  })
  id: string;

  @ApiProperty({
    description:
      'Indicates whether this role should be enabled by default on the client.',
    example: true,
  })
  defaultEnabled?: boolean;
}

export class RoleDetailsDto extends RoleDto {
  @ApiProperty({
    description: 'List of statements assigned to the role',
  })
  statements: Statement[];
}

export class RoleAssignmentDto {
  @ApiProperty({})
  userIds: string[];
}
