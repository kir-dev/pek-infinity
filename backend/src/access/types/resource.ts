import { ResourceKind, Resource } from '@prisma/client';

export type ResourceGroup = (typeof ResourceKind)[keyof typeof ResourceKind];

interface Builder<
  T extends ResourceGroup,
  U extends Resource['onUserId'],
  G extends Resource['onGroupId'],
  ON_ALL extends boolean = false,
> {
  target: T;
  onUserId: U;
  onGroupId: G;
  onAll: ON_ALL;
}

export type OnThisUserResource = Builder<'USER', string, null>;
export type OnAllUsersResource = Builder<'USER', null, null, true>;
export type OnThisProfileResource = Builder<'USER_PROFILE', string, null>;
export type OnAllProfilesResource = Builder<'USER_PROFILE', null, null, true>;
export type OnThisSvieCardResource = Builder<'SVIE_CARD', string, null>;
export type OnAllSvieCardsResource = Builder<'SVIE_CARD', null, null, true>;
export type OnThisMembershipResource = Builder<'MEMBERSHIP', string, string>;
export type OnAllMembershipsResource = Builder<'MEMBERSHIP', null, null, true>;
export type OnThisGroupResource = Builder<'GROUP', string, string>;
export type OnAllGroupsResource = Builder<'GROUP', null, null, true>;
export type OnThisGroupLeaderChangeRequestResource = Builder<
  'GROUP_LEADER_CHANGE_REQUEST',
  string,
  string
>;
export type OnAllGroupLeaderChangeRequestsResource = Builder<
  'GROUP_LEADER_CHANGE_REQUEST',
  null,
  null,
  true
>;
export type OnThisGuidelineResource = Builder<'GUIDELINE', string, string>;
export type OnAllGuidelinesResource = Builder<'GUIDELINE', null, null, true>;
export type OnThisScoreboardResource = Builder<'SCOREBOARD', string, string>;
export type OnAllScoreboardsResource = Builder<'SCOREBOARD', null, null, true>;
export type OnThisNotificationResource = Builder<'NOTIFICATION', string, string>;
export type OnAllNotificationsResource = Builder<'NOTIFICATION', null, null, true>;
export type OnThisSystemResource = Builder<'SYSTEM', string, null>;
export type OnAllSystemResource = Builder<'SYSTEM', null, null, true>;
export type OnThisAdminResource = Builder<'ADMIN', string, null>;
export type OnAllAdminResource = Builder<'ADMIN', null, null, true>;
