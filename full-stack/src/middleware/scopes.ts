export const SCOPE = {
  USER_VIEW_PROFILE: 'USER_VIEW_PROFILE',
  USER_EDIT_PROFILE: 'USER_EDIT_PROFILE',
  GROUP_VIEW: 'GROUP_VIEW',
  GROUP_CREATE: 'GROUP_CREATE',
  GROUP_EDIT: 'GROUP_EDIT',
  GROUP_DELETE: 'GROUP_DELETE',
  // Add more scopes as needed
} as const;

export type Scope = (typeof SCOPE)[keyof typeof SCOPE];
