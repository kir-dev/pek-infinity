'use client';

import { useEffect, useState } from 'react';

import { ClientPekApi } from '@/network/client-api';
import { type UserDto } from '@/pek';

const pek = new ClientPekApi();

export function ClientSideProfile() {
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    pek
      .me()
      .then(setUser)
      .catch(() => {});
  }, []);

  if (!user) {
    return null;
  }

  return <h1>Client: {user.name}</h1>;
}
