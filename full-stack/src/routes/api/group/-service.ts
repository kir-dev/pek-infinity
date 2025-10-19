import * as Prisma from '@prisma/browser';
import type { GroupCreateInput, GroupUpdateInput } from '@prisma/models/Group';
import {
  infiniteQueryOptions,
  keepPreviousData,
  mutationOptions,
  queryOptions,
} from '@tanstack/react-query';
import { createServerFn, useServerFn } from '@tanstack/react-start';
import z from 'zod/v4';
import { authGuard, SCOPE } from '@/middleware';
import { withPagination } from '../-pagination';

export const GroupSchema = z.object({
  name: z.string().min(1),
  description: z.string(),
  purpose: z.enum(Prisma.$Enums.GroupPurpose),
  isCommunity: z.boolean(),
  isResort: z.boolean(),
  isTaskForce: z.boolean(),
  hasTransitiveMembership: z.boolean(),
  isArchived: z.boolean(),
  id: z.cuid(),
  parentId: z.cuid().nullable(),
}) satisfies z.ZodType<Prisma.Group>;

export const GroupCreateDto = GroupSchema.omit({
  id: true,
  isArchived: true,
}).strict() satisfies z.ZodType<Omit<GroupCreateInput, 'isArchived'>>;

export const GroupUpdateDto = GroupSchema.omit({
  parentId: true,
})
  .partial()
  .required({ id: true })
  .strict() satisfies z.ZodType<GroupUpdateInput>;

const GroupFindSchema = GroupSchema.pick({ id: true }).strict();

export const GroupService = {
  findMany: createServerFn({ method: 'GET' })
    .inputValidator(withPagination(z.object({})))
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .handler(async ({ context, data }) => {
      return context.prisma.group.findMany({
        skip: data?.pageParam?.skip,
        take: data?.pageParam?.take,
      });
    }),
  findById: createServerFn({ method: 'GET' })
    .inputValidator(GroupFindSchema)
    .middleware([authGuard([SCOPE.GROUP_VIEW])])
    .handler(async ({ context: { prisma }, data: { id } }) => {
      return prisma.group.findUnique({ where: { id } });
    }),
  create: createServerFn({ method: 'POST' })
    .inputValidator(GroupCreateDto)
    .middleware([authGuard([SCOPE.GROUP_CREATE])])
    .handler(async ({ context: { prisma }, data }) => {
      return prisma.group.create({ data: { ...data, isArchived: false } });
    }),
  update: createServerFn({ method: 'POST' })
    .inputValidator(GroupUpdateDto)
    .middleware([authGuard([SCOPE.GROUP_EDIT])])
    .handler(async ({ context: { prisma }, data }) => {
      const { id, ...updateData } = data;
      return prisma.group.update({ where: { id }, data: updateData });
    }),
} as const;

declare module 'zod' {
  interface ZodType {
    infer: z.infer<this>;
  }
}

export const GroupQueryOptions = {
  findMany: (_params = {}, _search = {}) =>
    infiniteQueryOptions({
      initialPageParam: { skip: 0, take: 20 },
      getNextPageParam: (_lastPage, _pages, lastPageParam) => ({
        ...lastPageParam,
        skip: lastPageParam.skip + lastPageParam.take,
      }),
      queryKey: ['groups', _params, _search],
      queryFn: async ({ signal, pageParam }) =>
        await useServerFn(GroupService.findMany)({
          signal,
          data: { pageParam },
        }),
      placeholderData: keepPreviousData,
    }),
  findById: (params: { id: string }) =>
    queryOptions({
      queryKey: ['group', params],
      queryFn: async ({ signal }) =>
        await useServerFn(GroupService.findById)({
          signal,
          data: params,
        }),
    }),
  create: (data: typeof GroupCreateDto.infer) =>
    mutationOptions({
      mutationFn: async () => await useServerFn(GroupService.create)({ data }),
    }),
  update: (data: typeof GroupUpdateDto.infer) =>
    mutationOptions({
      mutationFn: async () => await useServerFn(GroupService.update)({ data }),
    }),
};
