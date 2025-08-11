import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';

export default async function Home() {
  const cookieStore = await cookies();
  const authenticatedCookie = cookieStore.get('authenticated');
  const isAuthenticated = authenticatedCookie?.value === 'true';

  if (isAuthenticated) {
    redirect('/dashboard');
  } else {
    redirect('/login');
  }
}
