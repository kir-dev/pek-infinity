import { dehydrate, QueryClient, useQuery } from '@tanstack/react-query';
import { createFileRoute } from '@tanstack/react-router';
import { useServerFn } from '@tanstack/react-start';
import { listGroups } from '../api/group/-service';

export const Route = createFileRoute('/demo/start/api-request')({
  component: Home,
  loader: async () => {
    const queryClient = new QueryClient();

    await queryClient.prefetchQuery({
      queryKey: ['groups'],
      queryFn: () => listGroups(),
    });

    return {
      dehydratedState: dehydrate(queryClient),
    };
  },
});

function Home() {
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: useServerFn(listGroups),
  });

  return (
    <div
      className='flex items-center justify-center min-h-screen p-4 text-white'
      style={{
        backgroundColor: '#000',
        backgroundImage:
          'radial-gradient(ellipse 60% 60% at 0% 100%, #444 0%, #222 60%, #000 100%)',
      }}
    >
      <div className='w-full max-w-2xl p-8 rounded-xl backdrop-blur-md bg-black/50 shadow-xl border-8 border-black/10'>
        <h1 className='text-2xl mb-4'>Start API Request Demo - Names List</h1>
        <ul className='mb-4 space-y-2'>
          {groups.map((group) => (
            <li
              key={group.id}
              className='bg-white/10 border border-white/20 rounded-lg p-3 backdrop-blur-sm shadow-md'
            >
              <span className='text-lg text-white'>{group.name}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
