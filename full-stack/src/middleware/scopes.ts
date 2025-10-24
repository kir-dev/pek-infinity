export enum SCOPE {
  // view username, name, avatar
  USER_VIEW_BASIC = 'user:view-basic',
  // view profile, external accounts, awards and other scores
  USER_VIEW_PROFILE = 'user:view-profile',
  // all edit operations on the user, profile, external account, award.toggleVisibility, delete account
  USER_EDIT = 'user:edit',
  // view group bio
  GROUP_VIEW = 'group:view',
  // view score history
  GROUP_VIEW_HISTORY = 'group:view-history',
  // edit group profile
  GROUP_EDIT_PROFILE = 'group:edit-profile',
  // create, modify, submit semester evaluations
  GROUP_EDIT_DRAFT_EVALUATIONS = 'group:edit-draft-evaluations',
  // accept or reject evaluations
  GROUP_JUDGE_EVALUATIONS = 'group:judge-evaluations',
  // view evaluations
  GROUP_VIEW_EVALUATIONS = 'group:view-evaluations',
  // create and assign roles and flairs
  GROUP_ROLE_ADMIN = 'group:role-admin',
  // accept or reject applications, transitions MembershipStatus
  GROUP_MEMBER_ADMIN = 'group:member-admin',
  // only the group owner can set group owners, archive the group, move under new parent group
  GROUP_OWNER = 'group:owner',
  // create
  GROUP_CREATE_SUBGROUP = 'group:create-subgroup',
  // create new organizations
  GROUP_CREATE_TOPLEVEL = 'group:create-toplevel',
  // GROUP_APPLY -> future, now everyone can apply
  // bypass all authorization checks
  SUPREME_SUDO = 'supreme:sudo',
}
