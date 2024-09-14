import React from 'react';

import { getBackend } from '@/lib/get-backend';

import { PekClientDebug } from './debug-client';

export default async function Page() {
  'use server';
  const publicApi = await getBackend({ preferredNetwork: 'public' });
  const privateApi = await getBackend({ preferredNetwork: 'private' });
  const info = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    api: publicApi,
    privateApi: publicApi === privateApi ? 'same' : 'different',
    'window.pekApi': <PekClientDebug />,
  };
  return (
    <table className='text-center min-w-96 mx-auto'>
      <thead>
        <tr>
          <th>Key</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        {Object.entries(info).map(([key, value]) => (
          <tr key={key} className='border'>
            <td>{key}</td>
            <td>{value}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
