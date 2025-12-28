import { mutationOptions, queryOptions } from '@tanstack/react-query';
import { createServerFn, json, useServerFn } from '@tanstack/react-start';
import z from 'zod/v4';
import { authGuard, injectService, SCOPE } from '@/middleware';
import { httpSchema } from '@/utils/zod-extra';
import { ContactService } from '../backend/contact.service';
import { ContactBatchSchema, ContactParamsSchema } from './contact.schema';

export const ContactController = {
  /**
   * GET /users/:userId/contacts
   * Get all contacts for a user
   */
  getContacts: createServerFn({ method: 'GET' })
    .inputValidator(httpSchema({ params: ContactParamsSchema }))
    .middleware([
      authGuard([SCOPE.USER_VIEW_PROFILE]),
      injectService(ContactService),
    ])
    .handler(async ({ context, data }) => {
      // TODO: Validate user has viewFullProfile statement on target user
      return json(await context.service.getContacts(data.params.userId));
    }),

  /**
   * POST /users/:userId/contacts
   * Batch update contacts (replace all)
   */
  updateContacts: createServerFn({ method: 'POST' })
    .inputValidator(
      httpSchema({
        params: ContactParamsSchema,
        body: z.object({ contacts: ContactBatchSchema }),
      })
    )
    .middleware([authGuard([SCOPE.USER_EDIT]), injectService(ContactService)])
    .handler(async ({ context, data }) => {
      // TODO: Validate user has editProfile statement on target user
      return json(
        await context.service.replaceContacts(
          data.params.userId,
          data.body.contacts
        )
      );
    }),
} as const;

export const ContactQueryOptions = {
  getContacts: (params: z.infer<typeof ContactParamsSchema>) =>
    queryOptions({
      queryKey: ['contacts', params.userId],
      queryFn: async ({ signal }) =>
        await useServerFn(ContactController.getContacts)({
          signal,
          data: { params, body: undefined, page: undefined },
        }),
    }),

  updateContacts: (
    params: z.infer<typeof ContactParamsSchema>,
    data: z.infer<typeof ContactBatchSchema>
  ) =>
    mutationOptions({
      mutationFn: async () =>
        await useServerFn(ContactController.updateContacts)({
          data: { params, body: { contacts: data }, page: undefined },
        }),
    }),
};
