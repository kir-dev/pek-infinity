import { ApiProperty } from '@nestjs/swagger';

import AllGuards from '../access.guard';
import { Action } from '../types/action';
import { AccessResource } from '../types/resource';

/**
 * A statement is a collection of rules that allow some actions on some resources
 */
export class Statement {
  @ApiProperty({
    description: 'Resources on which the actions are allowed',
    example: [
      'pek:profile:1000',
      'pek:profile:2000',
    ] satisfies AccessResource[],
  })
  resources: AccessResource[];
  @ApiProperty({
    description: 'Actions (usually endpoints) that are allowed on the resource',
    example: [
      'ProfileViewPublic',
      'ProfileViewPrivate',
      'ProfileEdit',
    ] satisfies Action[],
    isArray: true,
    enum: Object.keys(AllGuards),
  })
  actions: Action[];
}
