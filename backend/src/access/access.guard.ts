import { type CanActivate, type ExecutionContext, Injectable } from '@nestjs/common';
import type { Request } from 'express';

import type { UserDto } from '@/auth/entities/user.entity';

import { type FnParamExtractor, param, type ParamExtractor } from './extractor';

const NOT_IMPLEMENTED = () => new AccessGuard(() => true);

export default {
  Pass: () => new AccessGuard(() => true),
  // /find
  FindProfiles: NOT_IMPLEMENTED,
  FindGroups: NOT_IMPLEMENTED,
  // /profile/:id
  ProfileViewPublic: NOT_IMPLEMENTED, // view basic info and public fields
  ProfileViewPrivate: NOT_IMPLEMENTED, // view hidden profile fields
  ProfileViewMemberships: NOT_IMPLEMENTED, // view group memberships
  ProfileViewHistory: NOT_IMPLEMENTED, // view point and award history
  ProfileEdit: NOT_IMPLEMENTED, // edit the public and private profile
  // /group
  GroupCreate: NOT_IMPLEMENTED,
  // /group/:id
  GroupViewDetails: (groupId: ParamExtractor = 'id') =>
    new AccessGuard(({ extract }) => extract(groupId) !== '5'),
  GroupViewMembers: NOT_IMPLEMENTED,
  GroupEditDetails: (groupId: ParamExtractor = 'id') =>
    new AccessGuard(({ extract, user }) => extract(groupId) === user.id),
};

// export const Pass = () => new AccessGuard(() => true);

@Injectable()
export class AccessGuard implements CanActivate {
  canActivate(ctx: ExecutionContext) {
    const req: Request = ctx.switchToHttp().getRequest();
    const user = req.user as UserDto | undefined;
    if (!user) {
      return false;
    }

    return this.verify({
      ctx,
      req,
      user,
      extract(extractor) {
        if (typeof extractor === 'string') {
          return param(extractor)({ ctx, req, user });
        }
        return extractor({ ctx, req, user });
      },
    });
  }

  constructor(
    private readonly verify: (params: {
      ctx: ExecutionContext;
      req: Request;
      user: UserDto;
      extract(extractor: ParamExtractor): ReturnType<FnParamExtractor>;
    }) => ReturnType<CanActivate['canActivate']>
  ) {}
}
