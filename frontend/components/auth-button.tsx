import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { ServerPekApi } from '@/network/server-api';

export async function AuthButton() {
  const pek = await ServerPekApi.getDefault();
  try {
    await pek.me();
  } catch (e) {
    return (
      <Button asChild>
        <Link href={`${process.env.NEXT_PUBLIC_API_URL}/api/v4/auth/login`}>Login</Link>
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href={`${process.env.NEXT_PUBLIC_API_URL}/api/v4/auth/logout`}>Logout</Link>
    </Button>
  );
}
