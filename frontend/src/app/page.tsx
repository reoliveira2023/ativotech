'use client';
import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';

export default function Home() {
  const { user, loading } = useAuth();
  const router = useRouter();
  useEffect(() => {
    if (!loading) {
      router.replace(user ? '/dashboard' : '/auth/login');
    }
  }, [user, loading]);
  return <div className="min-h-screen bg-indigo-600 flex items-center justify-center">
    <div className="text-white text-xl font-bold animate-pulse">AtivoTech</div>
  </div>;
}
