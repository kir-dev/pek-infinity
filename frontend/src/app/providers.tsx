'use client';

import { createContext, useEffect } from 'react';

import { ClientPekApi } from '@/network/client-api';

export const ClientApiContext = createContext<ClientPekApi | null>(null);

export function Providers({ children, apiBasePath }: Readonly<{ children: React.ReactNode; apiBasePath: string }>) {
  const apiInstance = new ClientPekApi(apiBasePath);
  useEffect(() => {
    if (typeof window !== 'undefined') (window as any).pekApi = apiInstance;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiBasePath]);

  return <ClientApiContext.Provider value={apiInstance}>{children}</ClientApiContext.Provider>;
}
