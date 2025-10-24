import type { Prisma as P } from '@prisma/client';
import * as Prisma from '@prisma/client';
import z from 'zod/v4';
import { zDate } from '@/utils/zod-extra';

const BaseGroupId = z.string().nonempty();

export const GroupIdJustName = BaseGroupId.regex(/^[a-zA-Z0-9_-]+$/);

export const GroupId = BaseGroupId.regex(/^[a-zA-Z]@[a-zA-Z0-9_-]+$/);

export const GroupProfile = z.object({
  name: z.string().nonempty(),
  description: z.string(),
  foundationDate: zDate.nullable(),
  webpage: z.url().nullable(),
  mail: z.email().nullable(),
  parentId: GroupId.nullable(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
});

export const GroupConfig = z.object({
  isCommunity: z.boolean(),
  isResort: z.boolean(),
  isTaskForce: z.boolean(),
  hasTransitiveMembership: z.boolean(),
  isArchived: z.boolean(),
});

export const GroupSchema = z
  .object({
    id: GroupId,
    createdAt: z.date(),
    updatedAt: z.date(),
  })
  .safeExtend(GroupConfig.shape)
  .safeExtend(GroupProfile.shape);

// export const GroupCreateDto = GroupSchema.omit({ isArchived: true }).partial() satisfies z.ZodType<P.GroupCreateInput>;

export const GroupFindDto = GroupSchema.pick({
  id: true,
}) satisfies z.ZodType<P.GroupWhereUniqueInput>;

export const GroupUpdateProfileDto = GroupProfile.omit({
  parentId: true,
  foundationDate: true,
}) satisfies z.ZodType<P.GroupUpdateInput>;

export const GroupUpdateConfigDto = GroupConfig.partial().extend(
  GroupFindDto.shape
) satisfies z.ZodType<P.GroupUpdateInput>;

export const GroupChangeParentDto = z.object({
  parentId: GroupId.nullable(),
}) satisfies z.ZodType<P.GroupUpdateArgs['data']>;

export const GroupCreateSubGroupDto = GroupSchema.omit({
  id: true,
  createdAt: true,
  foundationDate: true,
  parentId: true,
  isArchived: true,
}).safeExtend({
  idJustName: GroupIdJustName,
});

export const GroupCreateOrganizationDto = GroupSchema.omit({
  foundationDate: true,
  id: true,
  parentId: true,
}).safeExtend({ idJustName: GroupIdJustName });
