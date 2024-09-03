import { AuthButton } from '@/components/auth-button';
import { ClientSideProfile } from '@/components/client-side-profile';
import { Navbar } from '@/components/navbar';
import { ServerSideProfile } from '@/components/server-side-profile';
import { ServerPekApi } from '@/network/server-api';

export default async function Home() {
  const pek = await ServerPekApi.getDefault();
  const ping = await pek.ping();
  return (
    <>
      <Navbar />
      <main className='flex min-h-96 flex-col items-center justify-between p-24'>
        <div className='w-full max-w-5xl items-center justify-between font-mono text-sm lg:flex'>
          <p className='left-0 top-0 flex w-full justify-center border-b border-gray-300 bg-gradient-to-b from-zinc-200 pb-6 pt-8 backdrop-blur-2xl dark:border-neutral-800 dark:bg-zinc-800/30 dark:from-inherit lg:static lg:w-auto  lg:rounded-xl lg:border lg:bg-gray-200 lg:p-4 lg:dark:bg-zinc-800/30'>
            Response from the API: <code className='ml-2'>{JSON.stringify(ping)}</code>
          </p>
        </div>

        <div className='mb-32 grid text-center lg:mb-0 lg:w-full lg:max-w-5xl lg:grid-cols-2 lg:text-left'>
          <a
            href='/groups/1'
            className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          >
            <h2 className='mb-3 text-2xl font-semibold'>
              Group 1{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                -&gt;
              </span>
            </h2>
            <p className='m-0 max-w-[30ch] text-sm opacity-50'>Egy random kör profilja</p>
          </a>

          <a
            href='/profiles/1'
            className='group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30'
          >
            <h2 className='mb-3 text-2xl font-semibold'>
              Profile 1{' '}
              <span className='inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none'>
                -&gt;
              </span>
            </h2>
            <p className='m-0 max-w-[30ch] text-sm opacity-50'>Egy random személy profilja</p>
          </a>
        </div>
        <AuthButton />
        <ServerSideProfile />
        <ClientSideProfile />
      </main>
    </>
  );
}
