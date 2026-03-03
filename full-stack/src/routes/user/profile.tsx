import 'reflect-metadata';
import { createFileRoute } from '@tanstack/react-router';

export const Route = createFileRoute('/user/profile')({
  component: UserProfileComponent,
});

function UserProfileComponent() {
  // Client-side component
  return (
    <div className='min-h-screen bg-slate-900 p-8 text-white'>
      <div className='mx-auto max-w-2xl'>
        <h1 className='mb-4 font-bold text-3xl'>User Profile</h1>
        <p className='text-gray-400'>
          This is an example route demonstrating NestJS-style dependency
          injection in TanStack Start.
        </p>
        <div className='mt-8 rounded-lg border border-slate-700 bg-slate-800 p-6'>
          <h2 className='mb-2 font-semibold text-xl'>Features:</h2>
          <ul className='list-inside list-disc space-y-2 text-gray-300'>
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
