'use client';

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Icons } from '@/components/ui/icons';
import { useToast } from '@/components/ui/use-toast';

export default function VerifyPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    if (!searchParams) return;
    
    const token = searchParams.get('token');
    const email = searchParams.get('email');

    if (!token || !email) {
      setStatus('error');
      setMessage('Le lien de vérification est invalide ou a expiré');
      return;
    }

    // Appeler l'API pour vérifier le token
    fetch('/api/auth/verify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ token, email })
    })
      .then(async (res) => {
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Une erreur est survenue');
        return data;
      })
      .then(data => {
        setStatus('success');
        setMessage('Votre compte a été vérifié avec succès !');
        toast({
          title: "Compte vérifié",
          description: "Vous pouvez maintenant vous connecter pour commencer à jouer !",
          variant: "default",
        });
      })
      .catch((error) => {
        setStatus('error');
        setMessage(error.message || 'Une erreur est survenue lors de la vérification');
        toast({
          title: "Erreur de vérification",
          description: error.message || "Le lien de vérification est invalide ou a expiré",
          variant: "destructive",
        });
      });
  }, [searchParams, toast]);

  return (
    <div className="container relative flex items-center justify-center min-h-[80vh]">
      <Card className="w-full max-w-md mx-auto">
        <CardHeader className="space-y-2">
          <CardTitle className="text-2xl text-center">Vérification du compte</CardTitle>
          <CardDescription className="text-center text-base">
            {status === 'loading' ? 'Vérification de votre compte en cours...' : message}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6 pt-4">
          {status === 'loading' && (
            <div className="flex flex-col items-center space-y-4">
              <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin" />
              <p className="text-sm text-muted-foreground">Veuillez patienter...</p>
            </div>
          )}
          {status === 'success' && (
            <div className="text-center space-y-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-green-100 dark:bg-green-900">
                <Icons.check className="h-10 w-10 text-green-600 dark:text-green-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-green-600 dark:text-green-400">Vérification réussie !</h3>
                <p className="text-sm text-muted-foreground">Votre compte est maintenant actif.</p>
              </div>
              <Button 
                size="lg"
                onClick={() => router.push('/auth/login')}
                className="w-full sm:w-auto"
              >
                Se connecter
              </Button>
            </div>
          )}
          {status === 'error' && (
            <div className="text-center space-y-6">
              <div className="inline-flex h-20 w-20 items-center justify-center rounded-full bg-red-100 dark:bg-red-900">
                <Icons.xCircle className="h-10 w-10 text-red-600 dark:text-red-400" />
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold text-red-600 dark:text-red-400">Échec de la vérification</h3>
                <p className="text-sm text-muted-foreground">{message}</p>
              </div>
              <div className="flex flex-col sm:flex-row gap-3 w-full sm:w-auto">
                <Button 
                  variant="outline" 
                  size="lg"
                  onClick={() => router.push('/')}
                  className="w-full sm:w-auto"
                >
                  Retour à l'accueil
                </Button>
                <Button 
                  variant="default"
                  size="lg"
                  onClick={() => router.push('/auth/login')}
                  className="w-full sm:w-auto"
                >
                  Se connecter
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
