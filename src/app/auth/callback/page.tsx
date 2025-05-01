'use client';

import { useEffect, Suspense, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2, AlertCircle, CheckCircle } from 'lucide-react';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';

// Composant qui utilise useSearchParams
function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const supabase = createClientComponentClient();
  const { toast } = useToast();
  const [status, setStatus] = useState('loading');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const handleCallback = async () => {
      if (!searchParams) {
        router.push('/auth/login');
        return;
      }
      
      // Vérifier s'il y a une erreur dans les paramètres d'URL
      const error = searchParams.get('error');
      const errorDescription = searchParams.get('error_description');
      const errorCode = searchParams.get('error_code');
      
      if (error) {
        console.error('Erreur de callback:', error, errorDescription);
        setStatus('error');
        setErrorMessage(errorDescription || 'Une erreur est survenue lors de l\'authentification');
        
        // Afficher un toast avec l'erreur
        toast({
          title: "Erreur d'authentification",
          description: errorDescription || "Une erreur s'est produite lors de l'authentification",
          variant: "destructive",
        });
        
        // Si c'est une erreur d'OTP expiré, proposer de renvoyer l'email
        if (errorCode === 'otp_expired') {
          setErrorMessage('Le lien de vérification a expiré. Veuillez demander un nouveau lien.');
        }
        
        return;
      }
      
      const code = searchParams.get('code');
      
      if (code) {
        try {
          await supabase.auth.exchangeCodeForSession(code);
          
          setStatus('success');
          
          // Afficher un toast de succès
          toast({
            title: "Authentification réussie",
            description: "Vous êtes maintenant connecté",
            variant: "default",
          });
          
          // Rediriger vers le tableau de bord après une connexion réussie
          setTimeout(() => {
            router.push('/dashboard');
          }, 1500);
        } catch (error) {
          console.error('Erreur lors de l\'échange de code:', error);
          setStatus('error');
          setErrorMessage('Erreur lors de l\'authentification. Veuillez réessayer.');
          
          // Afficher un toast avec l'erreur
          toast({
            title: "Erreur d'authentification",
            description: "Une erreur s'est produite lors de l'échange de code",
            variant: "destructive",
          });
        }
      } else {
        // Pas de code, rediriger vers la page de connexion
        router.push('/auth/login');
      }
    };

    handleCallback();
  }, [router, searchParams, supabase.auth, toast]);

  return (
    <div className="container flex h-screen items-center justify-center">
      <Card className="w-full max-w-md">
        {status === 'loading' && (
          <>
            <CardHeader className="text-center">
              <CardTitle>Authentification en cours</CardTitle>
              <CardDescription>Veuillez patienter pendant que nous traitons votre demande...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
            </CardContent>
          </>
        )}
        
        {status === 'success' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-8 w-8 text-green-600" />
              </div>
              <CardTitle>Authentification réussie</CardTitle>
              <CardDescription>Vous êtes maintenant connecté. Redirection en cours...</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center py-4">
              <Loader2 className="h-6 w-6 animate-spin text-primary" />
            </CardContent>
          </>
        )}
        
        {status === 'error' && (
          <>
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <AlertCircle className="h-8 w-8 text-red-600" />
              </div>
              <CardTitle>Erreur d'authentification</CardTitle>
              <CardDescription>{errorMessage}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 items-center py-4">
              {errorMessage.includes('expiré') && (
                <Button 
                  onClick={() => router.push('/auth/login')}
                  className="w-full sm:w-auto"
                >
                  Demander un nouveau lien
                </Button>
              )}
              <Button 
                variant="outline"
                onClick={() => router.push('/')}
                className="w-full sm:w-auto"
              >
                Retour à l'accueil
              </Button>
            </CardContent>
          </>
        )}
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
