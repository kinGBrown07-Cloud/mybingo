"use client";

import { PayPalButtons } from "@paypal/react-paypal-js";
import { toast } from "sonner";
import confetti from "canvas-confetti";
import { processPurchase } from "@/services/packService";
import { detectUserRegion, REGION_CONFIGS, type Region } from "@/services/regionService";
import { useEffect, useState } from "react";

interface PayPalPurchaseProps {
  packId: string;
  price: number;
}

export default function PayPalPurchase({ packId, price }: PayPalPurchaseProps) {
  const [userRegion, setUserRegion] = useState<Region>("EUROPE");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadUserRegion() {
      try {
        const region = await detectUserRegion();
        setUserRegion(region);
      } catch (error) {
        console.error("Error detecting region:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadUserRegion();
  }, []);

  const launchConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 }
    });
  };

  const handleSuccess = async (paymentId: string) => {
    try {
      await processPurchase(packId, paymentId, userRegion);
      launchConfetti();
      toast.success("Achat réussi ! Vos points ont été crédités.");
    } catch (error) {
      console.error("Purchase error:", error);
      toast.error("Une erreur est survenue lors de l'achat.");
    }
  };

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  const config = REGION_CONFIGS[userRegion];

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="mb-4 text-center text-sm text-gray-600">
        Prix: {price.toLocaleString()} {config.currencySymbol}
      </div>
      <PayPalButtons
        style={{ layout: "vertical" }}
        createOrder={(data, actions) => {
          return actions.order.create({
            intent: "CAPTURE",
            purchase_units: [
              {
                amount: {
                  currency_code: config.currency,
                  value: price.toString()
                }
              }
            ]
          });
        }}
        onApprove={async (data, actions) => {
          if (actions.order) {
            const order = await actions.order.capture();
            await handleSuccess(order.id);
          }
        }}
      />
    </div>
  );
}
