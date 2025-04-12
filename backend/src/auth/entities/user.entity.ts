import { ApiProperty } from '@nestjs/swagger';

import { AuthSchStrategy } from '../strategies/authsch.strategy';

export class UserDto implements Awaited<ReturnType<AuthSchStrategy['validate']>> {
  @ApiProperty()
  name: string;

  @ApiProperty()
  id: string;
}
