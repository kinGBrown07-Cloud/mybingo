"use client";

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Sidebar } from '@/components/admin/sidebar';
import { supabase } from '@/lib/supabase-client';

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est authentifié
        const { data: { user }, error } = await supabase.auth.getUser();
        
        if (error || !user) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        console.log('Utilisateur authentifié:', user.id);
        
        // Vérifier si l'utilisateur est admin
        const isUserAdmin = 
          user.user_metadata?.role === 'ADMIN' || 
          user.app_metadata?.role === 'ADMIN';
        
        if (!isUserAdmin) {
          console.log('Utilisateur non admin, redirection vers dashboard');
          router.push('/dashboard');
          return;
        }
        
        setIsAdmin(true);
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Chargement...</div>;
  }

  if (!isAdmin) {
    return null;
  }

  return (
    <div className="flex h-screen">
      <Sidebar />
      <main className="flex-1 overflow-y-auto bg-zinc-50 dark:bg-zinc-900">
        {children}
      </main>
    </div>
  );
}
