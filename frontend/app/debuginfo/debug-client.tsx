'use client';
import { ClientPekApi } from '@/network/client-api';

export function PekClientDebug() {
  const api = new ClientPekApi();
  return <>{JSON.stringify(api)}</>;
}
