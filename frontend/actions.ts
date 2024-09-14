'use server';

import { getBackend } from './lib/get-backend';

export function getPrivateApi() {
  'use server';
  return getBackend({ preferredNetwork: 'private' });
}
