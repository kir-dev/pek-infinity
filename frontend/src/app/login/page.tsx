'use client';

import { useEffect } from 'react';

import { useApi } from '@/hooks/use-api';

export default function Page() {
  const pek = useApi();
  const url = pek?.loginPath;

  useEffect(() => {
    if (url) window.location.href = url;
  }, [url]);

  <p>Redirecting to {url ?? 'backend/login'}</p>;
}
