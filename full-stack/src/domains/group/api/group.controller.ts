import {
  infiniteQueryOptions,
  keepPreviousData,
  mutationOptions,
  queryOptions,
} from '@tanstack/react-query';
import { createServerFn, json, useServerFn } from '@tanstack/react-start';
import z from 'zod';
import { authGuard, injectService, SCOPE } from '@/middleware';
import { httpSchema } from '@/utils/zod-extra';
import {
  GroupChangeParentDto,
  GroupCreateOrganizationDto,
  GroupCreateSubGroupDto,
  GroupFindDto,
  GroupId,
  GroupUpdateConfigDto,
  GroupUpdateProfileDto,
} from './group.schema';
import { GroupService } from './group.service';

export const GroupController = {
  // GET /groups?skip={skip}&take={take}
  findMany: createServerFn({ method: 'GET' })
    .inputValidator(httpSchema({ pagination: true }))
    .middleware([authGuard([SCOPE.GROUP_VIEW]), injectService(GroupService)])
    .handler(async ({ context, data }) => {
      return json(await context.service.findMany(data.page));
    }),
  // GET /groups/:id
  findById: createServerFn({ method: 'GET' })
    .inputValidator(httpSchema({ params: GroupFindDto }))
    .middleware([authGuard([SCOPE.GROUP_VIEW]), injectService(GroupService)])
    .handler(async ({ context, data }) => {
      return json(context.service.findOne(data.params.id));
    }),
  // POST /groups/:id/profile
  update: createServerFn({ method: 'POST' })
    .inputValidator(
      httpSchema({
        params: { id: GroupId },
        body: GroupUpdateProfileDto,
      })
    )
    .middleware([
      authGuard([SCOPE.GROUP_EDIT_PROFILE]),
      injectService(GroupService),
    ])
    .handler(async ({ context, data: { params, body } }) => {
      return json(context.service.updateProfile(params.id, body));
    }),
  // POST /groups/:id/config
  updateFlags: createServerFn({ method: 'POST' })
    .inputValidator(
      httpSchema({
        params: { id: GroupId },
        body: GroupUpdateConfigDto,
      })
    )
    .middleware([authGuard([SCOPE.GROUP_OWNER]), injectService(GroupService)])
    .handler(async ({ context, data: { params, body } }) => {
      return json(context.service.updateConfig(params.id, body));
    }),
  // POST /groups/:id/parent
  changeParent: createServerFn({ method: 'POST' })
    .inputValidator(
      httpSchema({
        params: { id: GroupId },
        body: GroupChangeParentDto,
      })
    )
    .middleware([authGuard([SCOPE.GROUP_OWNER]), injectService(GroupService)])
    .handler(async ({ context, data: { params, body } }) => {
      return json(context.service.changeParent(params.id, body.parentId));
    }),
  // POST /organizations/:parentId/subgroups
  createSubGroup: createServerFn({ method: 'POST' })
    .inputValidator(
      httpSchema({
        params: { parentId: GroupId },
        body: GroupCreateSubGroupDto,
      })
    )
    .middleware([
      authGuard([SCOPE.GROUP_CREATE_SUBGROUP]),
      injectService(GroupService),
    ])
    .handler(async ({ context, data: { body, params } }) => {
      return json(context.service.createSubGroup(params.parentId, body));
    }),
  // POST /organizations
  createOrganization: createServerFn({ method: 'POST' })
    .inputValidator(httpSchema({ body: GroupCreateOrganizationDto }))
    .middleware([
      authGuard([SCOPE.GROUP_CREATE_TOPLEVEL]),
      injectService(GroupService),
    ])
    .handler(async ({ context, data }) => {
      return json(context.service.createOrganization(data.body));
    }),
  // GET /organizations/:organizationId/groups?skip={skip}&take={take}
  findManyInOrganization: createServerFn({ method: 'GET' })
    .inputValidator(
      httpSchema({ params: { organizationId: z.string() }, pagination: true })
    )
    .middleware([authGuard([SCOPE.GROUP_VIEW]), injectService(GroupService)])
    .handler(async ({ context, data }) => {
      return json(
        context.service.findManyInOrganization(
          data.params.organizationId,
          data.page
        )
      );
    }),
  // POST /groups/:id/archive
  archive: createServerFn({ method: 'POST' })
    .inputValidator(httpSchema({ body: GroupFindDto }))
    .middleware([authGuard([SCOPE.GROUP_OWNER]), injectService(GroupService)])
    .handler(async ({ context, data }) => {
      return json(context.service.archive(data.body.id));
    }),
} as const;

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
        await useServerFn(GroupController.findMany)({
          signal,
          data: {
            page: pageParam,
            body: undefined,
            params: undefined,
          },
        }),
      placeholderData: keepPreviousData,
    }),
  findById: (params: { id: string }) =>
    queryOptions({
      queryKey: ['group', params],
      queryFn: async ({ signal }) =>
        await useServerFn(GroupController.findById)({
          signal,
          data: { params, body: undefined, page: undefined },
        }),
    }),
  update: (id: string, data: z.infer<typeof GroupUpdateProfileDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.update)({
          data: {
            params: { id },
            body: data,
            page: undefined,
          },
        }),
    }),
  updateFlags: (id: string, data: z.infer<typeof GroupUpdateConfigDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.updateFlags)({
          data: {
            params: { id },
            body: data,
            page: undefined,
          },
        }),
    }),
  changeParent: (id: string, data: z.infer<typeof GroupChangeParentDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.changeParent)({
          data: {
            params: { id },
            body: data,
            page: undefined,
          },
        }),
    }),
  createSubGroup: (
    parentId: string,
    data: z.infer<typeof GroupCreateSubGroupDto>
  ) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.createSubGroup)({
          data: {
            params: { parentId },
            body: data,
            page: undefined,
          },
        }),
    }),
  createOrganization: (data: z.infer<typeof GroupCreateOrganizationDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.createOrganization)({
          data: { body: data, params: undefined, page: undefined },
        }),
    }),
  findManyInOrganization: (params: { organizationId: string }, _search = {}) =>
    infiniteQueryOptions({
      initialPageParam: { skip: 0, take: 20 },
      getNextPageParam: (_lastPage, _pages, lastPageParam) => ({
        ...lastPageParam,
        skip: lastPageParam.skip + lastPageParam.take,
      }),
      queryKey: ['groups-in-organization', params, _search],
      queryFn: async ({ signal, pageParam }) =>
        await useServerFn(GroupController.findManyInOrganization)({
          signal,
          data: {
            params: { organizationId: params.organizationId },
            page: pageParam,
            body: undefined,
          },
        }),
      placeholderData: keepPreviousData,
    }),
  archive: (data: z.infer<typeof GroupFindDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(GroupController.archive)({
          data: { body: data, params: undefined, page: undefined },
        }),
    }),
};
