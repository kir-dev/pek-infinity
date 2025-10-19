import { createFileRoute, notFound } from '@tanstack/react-router';
import { json } from '@tanstack/react-start';
import { parseBody } from '@/domains/auth/backend/auth.guard';
import { authGuard } from '@/middleware';
import { GroupCreateDto } from './-service';

export const Route = createFileRoute('/api/group/$groupId')({
  server: {
    handlers: ({ createHandlers }) =>
      createHandlers({
        GET: {
          middleware: [authGuard(['GROUP_VIEW'])],

          handler: async ({ context: { prisma }, params }) => {
            const result = await prisma.group.findUnique({
              where: { id: params.groupId },
            });
            if (!result) {
              throw notFound();
            }
            return json(result);
          },
        },
        POST: {
          middleware: [authGuard(['GROUP_CREATE']), parseBody(GroupCreateDto)],

          handler: async ({ context: { prisma, validatedBody } }) => {
            const group = await prisma.group.create({ data: validatedBody });
            return json(group, { status: 201 });
          },
        },
      }),
  },
});
