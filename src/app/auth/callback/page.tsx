'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

// Composant qui utilise useSearchParams
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();

  useEffect(() => {
    const handleCallback = async () => {
      if (!searchParams) {
        router.push('/auth/login');
        return;
      }
      
      const code = searchParams.get('code');
      
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          
          // Rediriger vers le tableau de bord après une connexion réussie
          router.push('/dashboard');
        } catch (error) {
          console.error('Erreur lors de l\'échange de code:', error);
          // Rediriger vers la page de connexion en cas d'erreur
          router.push('/auth/login?error=callback_error');
        }
      } else {
        // Pas de code, rediriger vers la page de connexion
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, searchParams, supabase.auth]);

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle>Authentification en cours</CardTitle>
          <CardDescription>Veuillez patienter pendant que nous traitons votre demande...</CardDescription>
        </CardHeader>
        <CardContent className="flex justify-center py-8">
          <Loader2 className="h-12 w-12 animate-spin text-primary" />
        </CardContent>
      </Card>
    </div>
  );
}

// Page principale avec Suspense
export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Authentification en cours</CardTitle>
            <CardDescription>Veuillez patienter...</CardDescription>
          </CardHeader>
          <CardContent className="flex justify-center py-6">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </CardContent>
        </Card>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}
