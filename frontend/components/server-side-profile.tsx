import { authMe } from '@/pek-api';

export async function ServerSideProfile() {
  let name: string;
  try {
    const response = await authMe();
    name = response.name;
  } catch {
    name = 'Anonymous';
  }
  return <h1>{name}</h1>;
}
