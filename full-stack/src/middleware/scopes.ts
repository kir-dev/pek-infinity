export const SCOPE = {
  USER_VIEW_PROFILE: 'USER_VIEW_PROFILE',
  USER_EDIT_PROFILE: 'USER_EDIT_PROFILE',
  // Add more scopes as needed
} as const;

export type Scope = typeof SCOPE[keyof typeof SCOPE];
