import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { getBackend } from '@/lib/get-backend';
import { authMe } from '@/pek-api';

export async function AuthButton() {
  const baseUrl = getBackend({ preferredNetwork: 'public' });
  try {
    await authMe();
  } catch {
    return (
      <Button asChild>
        <Link href={`${baseUrl}/api/v4/auth/login`}>Login</Link>
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href={`${baseUrl}/api/v4/auth/logout`}>Logout</Link>
    </Button>
  );
}
