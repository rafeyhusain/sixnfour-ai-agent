'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { LoginForm } from "@/components/login-form"

export default function LoginPage() {
  const [error, setError] = useState('');
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = (form.elements.namedItem('email') as HTMLInputElement)?.value;
    const password = (form.elements.namedItem('password') as HTMLInputElement)?.value;

    console.log(email, password);

    if (email === 'admin@admin.com' && password === 'admin') {
      document.cookie = `authenticated=true; path=/; max-age=${60 * 60 * 24 * 7}`;
      router.push('/dashboard');
    } else {
      setError('Authentication failed');
    }
  };

  return (
    <div className="bg-muted flex min-h-svh flex-col items-center justify-center p-6 md:p-10">
      {error && (
        <div className="mt-4 text-red-500 text-center">
          {error}
        </div>
      )}
      <div className="w-full max-w-sm md:max-w-3xl">
        <LoginForm onSubmit={handleSubmit} />

      </div>
    </div>
  )
}