import type { Prisma as P } from '@prisma/client';
import z from 'zod/v4';
import { zDate } from '@/utils/zod-extra';

// ===== User Schemas =====

export const UserIdSchema = z.string().cuid();

export const UserSchema = z.object({
  id: UserIdSchema,
  authSchId: z.string().nonempty(),
  createdAt: z.date().nullable(),
  updatedAt: z.date().nullable(),
  lastLogin: z.date().nullable(),
}) satisfies z.ZodType<
  Pick<P.User, 'id' | 'authSchId' | 'createdAt' | 'updatedAt' | 'lastLogin'>
>;

// ===== Username Schemas =====

export const UsernameSchema = z.object({
  humanId: z.string().nonempty(),
  userId: UserIdSchema,
  createdAt: z.date(),
}) satisfies z.ZodType<P.Username>;

// ===== Input DTOs =====

export const UserFindDto = z.object({
  id: UserIdSchema,
}) satisfies z.ZodType<P.UserWhereUniqueInput>;

export const UserFindByAuthSchIdDto = z.object({
  authSchId: z.string().nonempty(),
}) satisfies z.ZodType<P.UserWhereUniqueInput>;

export const UserFilterDto = z
  .object({
    authSchId: z.string().optional(),
    humanId: z.string().optional(),
    createdAtFrom: zDate.optional(),
    createdAtTo: zDate.optional(),
  })
  .optional();

export const UserCreateSystemDto = z.object({
  authSchId: z.string().nonempty(),
});

export const UserAttachUsernameDto = z.object({
  userId: UserIdSchema,
  humanId: z
    .string()
    .nonempty()
    .regex(/^[a-zA-Z0-9_-]+$/),
});

export const UserRecordLoginDto = z.object({
  userId: UserIdSchema,
  timestamp: zDate.optional(),
});

export const UserDeleteDto = z.object({
  id: UserIdSchema,
});

// ===== Output DTOs =====

// Safe projection for list responses
export const UserListItemSchema = UserSchema.extend({
  usernames: z.array(UsernameSchema).optional(),
});

// Safe projection for detail responses
export const UserDetailSchema = UserSchema.extend({
  usernames: z.array(UsernameSchema),
  profile: z
    .object({
      id: z.string(),
    })
    .nullable()
    .optional(),
});

// ===== Type Exports =====

export type User = z.infer<typeof UserSchema>;
export type Username = z.infer<typeof UsernameSchema>;
export type UserFindDto = z.infer<typeof UserFindDto>;
export type UserFilterDto = z.infer<typeof UserFilterDto>;
export type UserCreateSystemDto = z.infer<typeof UserCreateSystemDto>;
export type UserAttachUsernameDto = z.infer<typeof UserAttachUsernameDto>;
export type UserRecordLoginDto = z.infer<typeof UserRecordLoginDto>;
export type UserDeleteDto = z.infer<typeof UserDeleteDto>;
export type UserListItem = z.infer<typeof UserListItemSchema>;
export type UserDetail = z.infer<typeof UserDetailSchema>;
