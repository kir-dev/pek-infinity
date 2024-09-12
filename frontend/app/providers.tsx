'use client';

export function Providers({ children, apiBasePath }: Readonly<{ children: React.ReactNode; apiBasePath: string }>) {
  if (typeof window !== 'undefined') (window as any).config = { apiBasePath };

  return children;
}
