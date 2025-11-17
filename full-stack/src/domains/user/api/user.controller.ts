import {
  infiniteQueryOptions,
  keepPreviousData,
  mutationOptions,
  queryOptions,
} from '@tanstack/react-query';
import { createServerFn, json, useServerFn } from '@tanstack/react-start';
import type z from 'zod/v4';
import { authGuard, injectService, SCOPE } from '@/middleware';
import { httpSchema } from '@/utils/zod-extra';
import {
  UserAttachUsernameDto,
  UserCreateDto,
  UserDeleteDto,
  UserFilterDto,
  UserFindDto,
} from './user.schema';
import { UserService } from './user.service';

export const UserController = {
  // GET /users?skip={skip}&take={take}&humanId={humanId}&createdAtFrom={date}&createdAtTo={date}
  findMany: createServerFn({ method: 'GET' })
    .inputValidator(httpSchema({ body: UserFilterDto, pagination: true }))
    .middleware([
      authGuard([SCOPE.USER_VIEW_BASIC]),
      injectService(UserService),
    ])
    .handler(async ({ context, data }) => {
      return json(await context.service.findMany(data.body, data.page));
    }),

  // GET /users/:id
  findById: createServerFn({ method: 'GET' })
    .inputValidator(httpSchema({ params: UserFindDto }))
    .middleware([
      authGuard([SCOPE.USER_VIEW_BASIC]),
      injectService(UserService),
    ])
    .handler(async ({ context, data }) => {
      return json(await context.service.findById(data.params.id));
    }),

  // POST /users
  create: createServerFn({ method: 'POST' })
    .inputValidator(httpSchema({ body: UserCreateDto }))
    .middleware([authGuard([SCOPE.USER_EDIT]), injectService(UserService)])
    .handler(async ({ context, data }) => {
      return json(await context.service.create(data.body));
    }),

  // POST /users/username
  attachUsername: createServerFn({ method: 'POST' })
    .inputValidator(httpSchema({ body: UserAttachUsernameDto }))
    .middleware([authGuard([SCOPE.USER_EDIT]), injectService(UserService)])
    .handler(async ({ context, data }) => {
      return json(await context.service.attachUsername(data.body));
    }),

  // DELETE /users/:id
  deleteUser: createServerFn({ method: 'POST' })
    .inputValidator(httpSchema({ params: UserDeleteDto }))
    .middleware([authGuard([SCOPE.USER_EDIT]), injectService(UserService)])
    .handler(async ({ context, data }) => {
      return json(await context.service.deleteUser(data.params.id));
    }),
} as const;

// React Query helpers
export const UserQueryOptions = {
  findMany: (filters: z.infer<typeof UserFilterDto> = {}) =>
    infiniteQueryOptions({
      initialPageParam: { skip: 0, take: 20 },
      getNextPageParam: (_lastPage, _pages, lastPageParam) => ({
        ...lastPageParam,
        skip: lastPageParam.skip + lastPageParam.take,
      }),
      queryKey: ['users', filters],
      queryFn: async ({ signal, pageParam }) =>
        await useServerFn(UserController.findMany)({
          signal,
          data: {
            page: pageParam,
            body: filters,
            params: undefined,
          },
        }),
      placeholderData: keepPreviousData,
    }),

  findById: (params: { id: string }) =>
    queryOptions({
      queryKey: ['user', params],
      queryFn: async ({ signal }) =>
        await useServerFn(UserController.findById)({
          signal,
          data: { params, body: undefined, page: undefined },
        }),
    }),

  create: (data: z.infer<typeof UserCreateDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(UserController.create)({
          data: { body: data, params: undefined, page: undefined },
        }),
    }),

  attachUsername: (data: z.infer<typeof UserAttachUsernameDto>) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(UserController.attachUsername)({
          data: { body: data, params: undefined, page: undefined },
        }),
    }),

  deleteUser: (params: { id: string }) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(UserController.deleteUser)({
          data: { params, body: undefined, page: undefined },
        }),
    }),
};
