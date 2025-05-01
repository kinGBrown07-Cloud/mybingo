'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthContext } from '@/contexts/AuthContext';

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export default function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { user, loading, checkAuth } = useAuthContext();
  const router = useRouter();

  useEffect(() => {
    const verifyAuth = async () => {
      if (!loading) {
        const result = await checkAuth();
        if (!result.success) {
          router.push('/auth/login');
        }
      }
    };

    verifyAuth();
  }, [loading, checkAuth, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-indigo-500"></div>
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
} 