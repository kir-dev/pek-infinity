'use client';

import { axiosInstance } from '@kubb/plugin-client/client';

export function PekClientDebug() {
  return <p>{axiosInstance.defaults.baseURL ?? ''}</p>;
}
