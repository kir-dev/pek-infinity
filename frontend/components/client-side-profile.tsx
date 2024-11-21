'use client';

import { useAuthMe } from '@/pek-api';

export function ClientSideProfile() {
  const { data: me, status, error } = useAuthMe({ query: { retry: false } });
  if (status === 'pending') return <h1>Loading...</h1>;
  if (status === 'error' && error.status === 401) return <h1>Client: Anonymous</h1>;
  if (status === 'error') return <h1>Something went wrong {error.response?.data?.message}</h1>;

  return <h1>Client: {me.name}</h1>;
}
