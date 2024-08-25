import React from 'react';

import { getBasePath } from '@/pek-api';

export default function Page() {
  const info = {
    NODE_ENV: process.env.NODE_ENV,
    NERCEL_ENV: process.env.VERCEL_ENV,
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    'basePath()': getBasePath(),
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
            <td>{value?.toString()}</td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}
