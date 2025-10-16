import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';
import { injectService, authGuard, SCOPE, type RequestContext } from '../../middleware';
import { UserService } from '../../services/user.service';

export const Route = createFileRoute('/user/profile')({
  server: {
    middleware: [
      injectService(UserService),
      authGuard([SCOPE.USER_EDIT_PROFILE]),
    ],
    handlers: {
      GET: async ({ context }) => {
        const ctx = context as RequestContext;
        
        // Type-safe service access
        const result = await ctx.service.getUserProfile(ctx.user!.id);

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
      POST: async ({ request, context }) => {
        const ctx = context as RequestContext;
        const body = await request.json();

        // Type-safe service access
        const result = await ctx.service.updateUserProfile(ctx.user!.id, body);

        return new Response(JSON.stringify(result), {
          headers: { 'Content-Type': 'application/json' },
        });
      },
    },
  },
  component: UserProfileComponent,
});

function UserProfileComponent() {
  // Client-side component
  return (
    <div className='min-h-screen bg-slate-900 text-white p-8'>
      <div className='max-w-2xl mx-auto'>
        <h1 className='text-3xl font-bold mb-4'>User Profile</h1>
        <p className='text-gray-400'>
          This is an example route demonstrating NestJS-style dependency injection
          in TanStack Start.
        </p>
        <div className='mt-8 p-6 bg-slate-800 rounded-lg border border-slate-700'>
          <h2 className='text-xl font-semibold mb-2'>Features:</h2>
          <ul className='list-disc list-inside text-gray-300 space-y-2'>
            <li>Type-safe dependency injection using tsyringe</li>
            <li>Request-scoped Prisma service</li>
            <li>Authentication and authorization middleware</li>
            <li>Automatic resource cleanup after request</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
