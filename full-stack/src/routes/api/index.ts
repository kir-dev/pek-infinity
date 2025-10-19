import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';
import { GroupService } from '@/domains/group';
import { authGuard, injectService, SCOPE } from '../../middleware';

export const Route = createFileRoute('/api/')({
  server: {
    middleware: [],
    handlers: {
      GET: async () => {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
      POST: async () => {
        return new Response(JSON.stringify({ ok: true }), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
});
