"use client";

import { useState } from "react";
import { useUser } from "@/hooks/useUser";
import { PayPalButton } from "@/components/paypal-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { paypalService } from "@/lib/services/paypalService";
import { pricingService } from "@/lib/services/pricingService";

interface PayPalPaymentDetails {
  id: string;
  payer: {
    email_address: string;
  };
}

export default function PointsPage() {
  const { user } = useUser();
  const [amount, setAmount] = useState("");

  if (!user) {
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

  const pointsToReceive = pricingService.calculatePoints(parseFloat(amount) || 0, user.region);
  const currency = pricingService.getCurrency(user.region);

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
            <p className="text-2xl font-bold">{user.points} points</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Acheter des points</CardTitle>
            <CardDescription>
              Taux de conversion : 1{currency.symbol} = {pricingService.getPointsRate(user.region)} points
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
                  amount={amount}
                  onSuccess={handlePaymentSuccess}
                />
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
