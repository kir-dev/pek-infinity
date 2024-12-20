import type { Group, User } from '@prisma/client';

type ProfileId = User['id'];
type GroupId = Group['id'];

/**
 * Types of resources on which actions can be performed
 *
 * These should somewhat map to nest.js modules
 */

export type AccessResource =
  | 'pek:auth'
  | 'pek:find'
  | `pek:profile`
  | `pek:profile:${ProfileId}`
  | `pek:group`
  | `pek:group:${GroupId}`;
