import 'server-only';
import './globals.css';

import { axiosInstance } from '@kubb/swagger-client/client';
import { cookies } from 'next/headers';

// Reinitialize the server side axios instance with the correct values
axiosInstance.defaults.baseURL = getBackend({ preferredNetwork: 'private' });
axiosInstance.interceptors.request.use((config) => {
  config.headers.cookie = cookies().toString();
  if (config.url && new RegExp('^/api/v4|/ping').test(config.url)) {
    config.url = getBackend({ preferredNetwork: 'private' }) + config.url;
  }
  return config;
});

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
