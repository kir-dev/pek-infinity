import AllGuards from './access.guard';
import { RoleDetailsDto } from './dto/access.dto';

// Maybe this should be in a seed.ts
// Then these can be upsert to the db

export const GLOBAL_ROLE = {
  id: '#GLOBAL',
  displayName: 'GLOBAL',
  defaultEnabled: true,
  statements: [
    {
      resources: ['pek:find'],
      actions: ['FindGroups'],
    },
    {
      resources: ['pek:group:*'],
      actions: ['GroupViewDetails'],
    },
  ],
} as const satisfies RoleDetailsDto;

export const SVIE_ROLE = {
  id: '#SVIE',
  displayName: 'SVIE',
  defaultEnabled: true,
  statements: [
    {
      resources: ['pek:find'],
      actions: ['FindProfiles'],
    },
    {
      resources: ['pek:group:*'],
      actions: ['GroupViewMembers'],
    },
    {
      resources: ['pek:profile:*'],
      actions: [
        'ProfileViewPublic',
        'ProfileViewMemberships',
        'ProfileViewHistory',
      ],
    },
  ],
} as const satisfies RoleDetailsDto;

export const SITE_ADMIN_ROLE = {
  id: '#SITE_ADMIN',
  displayName: 'P4K ADMIN',
  defaultEnabled: false,
  statements: [{ resources: ['*'], actions: Object.keys(AllGuards) } as any],
} as const satisfies RoleDetailsDto;
