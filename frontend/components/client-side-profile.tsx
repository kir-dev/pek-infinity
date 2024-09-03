'use client';

import { useContext, useEffect, useState } from 'react';

import { ClientApiContext } from '@/app/providers';
import { type UserDto } from '@/pek';

export function ClientSideProfile() {
  const pek = useContext(ClientApiContext);
  const [user, setUser] = useState<UserDto | null>(null);

  useEffect(() => {
    if (!pek) return;
    pek
      .me()
      .then(setUser)
      .catch(() => {});
  }, [pek]);

  if (!user) {
    return null;
  }

  return <h1>Client: {user.name}</h1>;
}
