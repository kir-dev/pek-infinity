'use client';
import { useContext } from 'react';

import { ClientApiContext } from '@/app/providers';

export function useApi() {
  return useContext(ClientApiContext);
}
