"use client";

import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, CreateOrderData } from "@paypal/paypal-js";
import { useToast } from "@/components/ui/use-toast";
import { paypalService } from "@/lib/services/paypalService";
import { pricingService } from "@/lib/services/pricingService";
import { Region } from "@/lib/constants/regions";

interface PayPalButtonProps {
  amount: number;
  currency: string;
  region: Region;
  userId: string;
  onSuccess?: () => void;
}

export function PayPalButton({ amount, currency, region, userId, onSuccess }: PayPalButtonProps) {
  const { toast } = useToast();

  const initialOptions = {
    clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
    currency,
    intent: "capture",
  };

  const handleCreateOrder = async (_data: CreateOrderData, actions: CreateOrderActions) => {
    try {
      // Valider l'achat avant de créer la commande
      const validation = await pricingService.validatePurchase(amount, userId);
      
      const order = await paypalService.createOrder({
        userId,
        amount,
        currency,
        points: validation.points,
        bonus: validation.bonus,
        region,
      });

      return order.transactionId;
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de créer la commande PayPal";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleApprove = async (data: OnApproveData) => {
    try {
      const transaction = await paypalService.capturePayment(data.orderID, data.orderID);
      
      toast({
        title: "Succès",
        description: `Paiement effectué avec succès ! ${transaction.pointsAmount} points ajoutés à votre compte.`,
      });
      
      onSuccess?.();
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Impossible de finaliser le paiement";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      await paypalService.handlePaymentError(data.orderID, { message: errorMessage });
    }
  };

  return (
    <PayPalScriptProvider options={initialOptions}>
      <PayPalButtons
        style={{
          layout: "vertical",
          color: "gold",
          shape: "rect",
          label: "pay",
        }}
        createOrder={handleCreateOrder}
        onApprove={handleApprove}
        onError={(err) => {
          toast({
            variant: "destructive",
            title: "Erreur PayPal",
            description: "Une erreur est survenue lors du paiement",
          });
          console.error("Erreur PayPal:", err);
        }}
      />
    </PayPalScriptProvider>
  );
}
