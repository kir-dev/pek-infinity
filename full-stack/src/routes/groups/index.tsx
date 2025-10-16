import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';
import {
  authGuard,
  injectService,
  type RequestContext,
  SCOPE,
} from '../../middleware';
import { GroupService } from '../../services/group.service';

export const Route = createFileRoute('/groups/')({
  server: {
    middleware: [injectService(GroupService), authGuard([SCOPE.GROUP_VIEW])],
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as RequestContext;

        const groups = await ctx.service.findAll();

        return new Response(JSON.stringify(groups), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
      POST: async ({ request, context }) => {
        const ctx = context as RequestContext;

        // Check if user has create permission
        if (!ctx.user?.scopes.includes(SCOPE.GROUP_CREATE)) {
          return new Response(
            JSON.stringify({ error: 'Insufficient permissions' }),
            {
              status: 403,
              headers: { 'Content-Type': 'application/json' },
            }
          );
        }

        const body = await request.json();
        const group = await ctx.service.create(body);

        return new Response(JSON.stringify(group), {
          status: 201,
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
  component: GroupsComponent,
});

function GroupsComponent() {
  return (
    <div className='min-h-screen bg-slate-900 text-white p-8'>
      <div className='max-w-4xl mx-auto'>
        <h1 className='text-3xl font-bold mb-4'>Groups</h1>
        <p className='text-gray-400 mb-8'>
          This is an example route demonstrating group management with
          dependency injection.
        </p>

        <div className='grid md:grid-cols-2 gap-6'>
          <div className='p-6 bg-slate-800 rounded-lg border border-slate-700'>
            <h2 className='text-xl font-semibold mb-3'>API Endpoints</h2>
            <ul className='space-y-2 text-gray-300'>
              <li className='flex items-start gap-2'>
                <span className='font-mono text-cyan-400'>GET</span>
                <span>/groups - List all groups</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='font-mono text-cyan-400'>POST</span>
                <span>/groups - Create a new group</span>
              </li>
            </ul>
          </div>

          <div className='p-6 bg-slate-800 rounded-lg border border-slate-700'>
            <h2 className='text-xl font-semibold mb-3'>Required Scopes</h2>
            <ul className='space-y-2 text-gray-300'>
              <li className='flex items-start gap-2'>
                <span className='text-green-400'>✓</span>
                <span>GROUP_VIEW - View groups</span>
              </li>
              <li className='flex items-start gap-2'>
                <span className='text-green-400'>✓</span>
                <span>GROUP_CREATE - Create groups</span>
              </li>
            </ul>
          </div>
        </div>

        <div className='mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700'>
          <h2 className='text-xl font-semibold mb-2'>Service Architecture</h2>
          <div className='text-gray-300 space-y-2'>
            <p>
              The GroupService is automatically injected into the route handlers
              via the <code className='text-cyan-400'>injectService</code>{' '}
              middleware.
            </p>
            <p>
              Authentication and authorization are handled by the{' '}
              <code className='text-cyan-400'>authGuard</code> middleware, which
              also sets up the PrismaService per-request.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
