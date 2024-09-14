import { axiosInstance } from '@kubb/swagger-client/client';
import { cookies } from 'next/headers';

import { getBackend } from '@/lib/get-backend';

axiosInstance.defaults.baseURL = getBackend({ preferredNetwork: 'private' });
axiosInstance.interceptors.request.use((config) => {
  config.headers.cookie = cookies().toString();
  return config;
});
