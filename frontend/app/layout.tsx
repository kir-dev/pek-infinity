// import './patch-server-axios';
import { axiosInstance } from '@kubb/plugin-client/client';
import { cookies } from 'next/headers';

axiosInstance.interceptors.request.use((config) => {
  config.headers.cookie = cookies().toString();
  if (config.url?.startsWith('/api/v')) {
    const baseURL = getBackend({ preferredNetwork: 'private' });
    config.url = `${baseURL}${config.url}`;
  }
  return config;
});

import './globals.css';

import type { Metadata } from 'next';
import { Inter } from 'next/font/google';

import { getBackend } from '@/lib/get-backend';

import { Providers } from './providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PÉK Infinity',
  description: 'Generated by create next app',
};

export const dynamic = 'force-dynamic';

export default async function RootLayoutServer({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  axiosInstance.defaults.baseURL = getBackend({ preferredNetwork: 'private' });

  return (
    <html lang='hu'>
      <body className={inter.className}>
        <Providers apiBasePath={getBackend({ preferredNetwork: 'public' })}>{children}</Providers>
      </body>
    </html>
  );
}
