import 'server-only';

export function getBackend({
  preferredNetwork,
}: { preferredNetwork: 'private' | 'public' }): string {
  const PRIVATE_API = process.env.NEXT_PUBLIC_PRIVATE_API_URL;
  const PUBLIC_API = process.env.NEXT_PUBLIC_API_URL;

  const hasPrivateApi = Boolean(PRIVATE_API);

  if (preferredNetwork === 'private' && hasPrivateApi) {
    return PRIVATE_API!;
  }

  // If this is a vercel preview, use the compiled backend via page router
  if (process.env.VERCEL_ENV === 'preview') {
    return `https://${process.env.VERCEL_URL}`;
  }

  if (PUBLIC_API) {
    return PUBLIC_API;
  }

  throw new Error('NEXT_PUBLIC_API_URL is not set');
}
