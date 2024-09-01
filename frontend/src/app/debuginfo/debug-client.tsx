'use client';
import { useApi } from '@/hooks/use-api';

export function PekClientDebug() {
  const api = useApi();
  return <>{JSON.stringify(api)}</>;
}
