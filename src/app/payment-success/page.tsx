'use client';

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';

export default function PaymentSuccessPage() {
  const router = useRouter();

  useEffect(() => {
    // Rediriger automatiquement vers le tableau de bord après 5 secondes
    const timer = setTimeout(() => {
      router.push('/dashboard');
    }, 5000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="border-green-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <CheckCircle className="h-16 w-16 text-green-500" />
          </div>
          <CardTitle className="text-2xl">Paiement réussi !</CardTitle>
          <CardDescription>Votre achat de points a été traité avec succès</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            Les points ont été ajoutés à votre compte. Vous pouvez maintenant les utiliser pour jouer à Bingoo.
          </p>
          <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
            Vous serez redirigé automatiquement vers votre tableau de bord dans quelques secondes...
          </p>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button onClick={() => router.push('/dashboard')}>
            Aller au tableau de bord
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
