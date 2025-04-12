import Authorization from '@prisma/client';
import { PickType } from '@nestjs/swagger';
import { AuthorizationEntity } from '../entities/authorization.entity';

/**
 * The client probably doesn't care about the internals of the authorization entity.
 * We only need the id, name and defaultEnabled properties.
 */
export class AuthorizationSummaryDto extends PickType(AuthorizationEntity, [
  'id',
  'name',
  'defaultEnabled',
]) {}
