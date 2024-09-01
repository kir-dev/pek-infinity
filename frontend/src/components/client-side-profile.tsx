'use client';

import { useContext, useEffect, useState } from 'react';

import { ClientApiContext } from '@/app/providers';
import { type UserDto } from '@/pek';

import { Skeleton } from './ui/skeleton';

export function ClientSideProfile() {
  const pek = useContext(ClientApiContext);
  const [user, setUser] = useState<UserDto | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!pek) return;
    setLoading(true);
    pek
      .me()
      .then(setUser)
      .catch(() => {})
      .finally(() => setTimeout(() => setLoading(false), 1000));
  }, [pek]);

  if (loading)
    return (
      <Skeleton className='mt-1 h-4 min-w-24'>
        <h1> </h1>
      </Skeleton>
    );

  if (!user) {
    return null;
  }

  return <h1>{user.name}</h1>;
}
