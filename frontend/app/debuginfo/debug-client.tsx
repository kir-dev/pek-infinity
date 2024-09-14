'use client';
import { axiosInstance } from '@kubb/swagger-client/client';

export function PekClientDebug() {
  return <p>{axiosInstance.defaults.baseURL ?? ''}</p>;
}
