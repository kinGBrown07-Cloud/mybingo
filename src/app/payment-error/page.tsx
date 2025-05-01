'use client';

import React, { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { AlertTriangle } from 'lucide-react';

// Composant qui utilise useSearchParams
function PaymentErrorContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // Ajouter une vérification pour s'assurer que searchParams n'est pas null
  const reason = searchParams ? searchParams.get('reason') || 'unknown' : 'unknown';

  // Traduire la raison de l'erreur en message compréhensible
  const getErrorMessage = () => {
    switch (reason) {
      case 'missing-params':
        return 'Paramètres manquants dans la requête de paiement.';
      case 'transaction-not-found':
        return 'La transaction n\'a pas été trouvée dans notre système.';
      case 'server-error':
        return 'Une erreur serveur est survenue lors du traitement du paiement.';
      default:
        return 'Une erreur inconnue est survenue lors du traitement de votre paiement.';
    }
  };

  return (
    <div className="container max-w-md mx-auto py-12">
      <Card className="border-red-200">
        <CardHeader className="text-center">
          <div className="flex justify-center mb-4">
            <AlertTriangle className="h-16 w-16 text-red-500" />
          </div>
          <CardTitle className="text-2xl">Erreur de paiement</CardTitle>
          <CardDescription>Un problème est survenu lors du traitement de votre paiement</CardDescription>
        </CardHeader>
        <CardContent className="text-center">
          <p className="text-gray-600 dark:text-gray-400">
            {getErrorMessage()}
          </p>
          <p className="text-sm text-gray-500 mt-4 dark:text-gray-400">
            Aucun montant n'a été débité de votre compte. Vous pouvez réessayer l'achat ou contacter notre support si le problème persiste.
          </p>
        </CardContent>
        <CardFooter className="flex justify-center gap-4">
          <Button variant="outline" onClick={() => router.push('/points/buy')}>
            Réessayer
          </Button>
          <Button onClick={() => router.push('/dashboard')}>
            Retour au tableau de bord
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}

// Page principale avec Suspense
export default function PaymentErrorPage() {
  return (
    <Suspense fallback={<div className="container max-w-md mx-auto py-12">Chargement...</div>}>
      <PaymentErrorContent />
    </Suspense>
  );
}
