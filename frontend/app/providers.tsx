'use client';

import { axiosInstance } from '@kubb/swagger-client/client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

const queryClient = new QueryClient();

export function Providers({ children, apiBasePath }: Readonly<{ children: React.ReactNode; apiBasePath: string }>) {
  axiosInstance.defaults.baseURL = apiBasePath;
  axiosInstance.defaults.withCredentials = true;

  return <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>;
}
