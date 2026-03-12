import { cookies } from 'next/headers';

export async function isAdmin() {
  const cookieStore = await cookies();
  const adminKey = process.env.ADMIN_KEY;
  if (!adminKey) return false;
  return cookieStore.get('admin_key')?.value === adminKey;
}
