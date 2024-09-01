import { ServerPekApi } from '@/network/server-api';
import { type UserDto } from '@/pek';

export async function ServerSideProfile() {
  const pek = await ServerPekApi.getDefault();
  let user: UserDto;
  try {
    user = await pek.me();
  } catch (e) {
    return null;
  }
  return <h1>{user.name}</h1>;
}
