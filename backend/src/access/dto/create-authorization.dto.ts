import { OmitType } from '@nestjs/swagger';
import { AuthorizationEntity } from '../entities/authorization.entity';

export class CreateAuthorizationDto extends OmitType(AuthorizationEntity, [
  'id',
  'createdAt',
  'updatedAt',
  'codeDefined',
  'dbDefined',
]) {
  // @ApiHideProperty()
  // @IsEmpty()
  // codeDefined?: any;
  // @ApiHideProperty()
  // @IsEmpty()
  // defaultEnabled?: any;
}
