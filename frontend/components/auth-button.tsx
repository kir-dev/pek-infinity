import Link from 'next/link';

import { Button } from '@/components/ui/button';
import { authMe } from '@/pek-api';

export async function AuthButton() {
  try {
    await authMe();
  } catch {
    return (
      <Button asChild>
        <Link href='http://localhost:3300/api/v4/auth/login'>Login</Link>
      </Button>
    );
  }
  return (
    <Button asChild>
      <Link href='http://localhost:3300/api/v4/auth/logout'>Logout</Link>
    </Button>
  );
}
