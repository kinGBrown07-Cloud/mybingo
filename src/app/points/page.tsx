"use client";

import { useState, useEffect } from "react";
import { useUser } from "@/hooks/useUser";
import { PayPalButton } from "@/components/paypal-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paypalService } from "@/lib/services/paypalService";
import { pricingService } from "@/lib/services/pricingService";
import { Region } from "@/lib/constants/regions";
import { Profile } from "@/types/db";

// Interface pour les détails de paiement PayPal
interface PayPalPaymentDetails {
  id: string;
  payer: {
    email_address: string;
  };
}

export default function PointsPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");
  const [userProfile, setUserProfile] = useState<Profile | null>(null);

  // Charger le profil complet de l'utilisateur
  useEffect(() => {
    if (user) {
      fetch(`/api/profile?userId=${user.userId}`)
        .then(response => response.json())
        .then(data => {
          setUserProfile(data);
        })
        .catch(error => {
          console.error('Erreur lors du chargement du profil:', error);
        });
    }
  }, [user]);

  if (!user || !userProfile) {
    return (
      <div className="container mx-auto p-6">
        <h1 className="text-2xl font-bold mb-4">Connectez-vous pour acheter des points</h1>
      </div>
    );
  }

  const handlePaymentSuccess = async (details: PayPalPaymentDetails) => {
    try {
      const response = await fetch('/api/points/purchase', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: details.id,
          amount: parseFloat(amount),
          paypalEmail: details.payer.email_address,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to process payment');
      }

      // Rediriger vers la page de succès ou afficher un message
      window.location.href = '/points/success';
    } catch (error) {
      console.error('Payment processing error:', error);
      // Gérer l'erreur (afficher un message, etc.)
    }
  };

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (/^\d*\.?\d*$/.test(value)) {
      setAmount(value);
    }
  };

  // Utiliser le pays de l'utilisateur pour déterminer la région
  const userRegion = userProfile?.region ? userProfile.region as Region : Region.EUROPE;
  const pointsToReceive = pricingService.calculatePoints(parseFloat(amount) || 0, userRegion);
  const currency = pricingService.getCurrency(userRegion);

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Acheter des points</h1>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Points disponibles</CardTitle>
            <CardDescription>
              Votre solde actuel de points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{userProfile.points || 0} points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acheter des points</CardTitle>
            <CardDescription>
              Taux de conversion : 1{currency.symbol} = {userProfile.pointsRate || pricingService.getPointsRate(userRegion)} points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant en {currency.code}</Label>
                <Input
                  id="amount"
                  placeholder="0.00"
                  value={amount}
                  onChange={handleAmountChange}
                />
                {amount && (
                  <p className="text-sm text-muted-foreground">
                    Vous recevrez {pointsToReceive} points
                  </p>
                )}
              </div>

              {amount && parseFloat(amount) >= 1 && (
                <PayPalButton
                  amount={parseFloat(amount)}
                  currency={currency.code}
                  region={userRegion}
                  userId={user.userId}
                  onSuccess={() => {
                    // Rediriger vers la page de succès
                    window.location.href = '/points/success';
                  }}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
