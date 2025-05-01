"use client";

import { useState, useEffect } from "react";
import { PayPalScriptProvider, PayPalButtons } from "@paypal/react-paypal-js";
import type { CreateOrderActions, OnApproveData, OnApproveActions, CreateOrderData } from "@paypal/paypal-js";
import { useToast } from "@/components/ui/use-toast";
import { Button } from "@/components/ui/button";
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
  const [isPayPalReady, setIsPayPalReady] = useState(false);
  const [clientId, setClientId] = useState("");
  const [paypalMode, setPaypalMode] = useState<string>("sandbox");
  const [error, setError] = useState<string | null>(null);
  const [paypalCurrency, setPaypalCurrency] = useState<string>('');
  const [isLoadingCurrency, setIsLoadingCurrency] = useState(true);
  const [convertedAmount, setConvertedAmount] = useState<number>(amount);

  useEffect(() => {
    // Gérer les erreurs de chargement du SDK PayPal
    const handleScriptError = (event: ErrorEvent) => {
      // Vérifier si l'erreur concerne PayPal
      if (event.filename && event.filename.includes('paypal')) {
        console.error("Erreur lors du chargement du SDK PayPal:", event);
        setError(`Erreur PayPal: ${event.message || 'Erreur inconnue'}`);
      }
    };

    window.addEventListener('error', handleScriptError);

    // Récupérer l'ID client PayPal directement depuis les variables d'environnement
    const paypalClientId = process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID;
    const mode = process.env.NEXT_PUBLIC_PAYPAL_MODE || 'sandbox';

    if (!paypalClientId) {
      console.error("PayPal n'est pas correctement configuré. Vérifiez vos variables d'environnement.");
      setError("Configuration PayPal manquante");
      return;
    }

    console.log(`PayPal Button utilise le mode: ${mode}`);
    setClientId(paypalClientId);
    setPaypalMode(mode);
    setIsPayPalReady(true);

    return () => {
      window.removeEventListener('error', handleScriptError);
    };
  }, []);

  // Obtenir la devise compatible PayPal
  useEffect(() => {
    const fetchPaymentCurrency = async () => {
      try {
        setIsLoadingCurrency(true);
        const response = await fetch('/api/payments/get-payment-currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ region }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPaypalCurrency(data.currency);
          
          // Convertir le montant si nécessaire
          if (currency !== data.currency) {
            // Conversion approximative basée sur les taux de change
            let convertedValue = amount;
            
            // Conversion XOF vers EUR (1 EUR ≈ 655.96 XOF)
            if (currency === 'XOF' && data.currency === 'EUR') {
              convertedValue = amount / 655.96;
            } 
            // Conversion MAD vers EUR (1 EUR ≈ 10.85 MAD)
            else if (currency === 'MAD' && data.currency === 'EUR') {
              convertedValue = amount / 10.85;
            }
            // Autres conversions si nécessaire...
            
            // Arrondir à 2 décimales
            convertedValue = Math.round(convertedValue * 100) / 100;
            setConvertedAmount(convertedValue);
            console.log(`Montant converti: ${amount} ${currency} = ${convertedValue} ${data.currency}`);
          }
        } else {
          // En cas d'erreur, utiliser EUR par défaut
          setPaypalCurrency('EUR');
          // Conversion par défaut si nécessaire
          if (currency === 'XOF') {
            const defaultConverted = amount / 655.96;
            setConvertedAmount(Math.round(defaultConverted * 100) / 100);
          }
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la devise PayPal:', error);
        setPaypalCurrency('EUR');
      } finally {
        setIsLoadingCurrency(false);
      }
    };
    
    fetchPaymentCurrency();
  }, [region, currency, amount]);

  // Les options pour le SDK PayPal
  // Note: Le paramètre 'env' n'est plus supporté dans la nouvelle version du SDK
  // L'environnement est déterminé automatiquement en fonction de l'ID client utilisé
  const initialOptions = {
    clientId: clientId,
    currency: paypalCurrency || 'EUR', // Utiliser la devise compatible PayPal
    intent: "capture",
    components: "buttons",
    // Déboguer les problèmes de chargement
    debug: process.env.NODE_ENV === "development",
    // URLs de callback pour PayPal
    // Ces URLs sont utilisées par PayPal pour rediriger l'utilisateur après le paiement
    commit: true, // Afficher le bouton "Pay Now" au lieu de "Continue"
  };

  const handleCreateOrder = async (data: CreateOrderData, actions: CreateOrderActions) => {
    try {
      if (!userId) {
        console.error("ID utilisateur manquant");
        throw new Error("ID utilisateur manquant");
      }

      // Valider l'achat via l'API route
      let validation;
      let order;
      try {
        const validateResponse = await fetch('/api/payments/validate', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ amount, userId }),
        });
        
        if (!validateResponse.ok) {
          throw new Error(`Erreur de validation: ${validateResponse.status}`);
        }
        
        validation = await validateResponse.json();
        
        // Vérifier que la validation a retourné un objet avec des points
        if (!validation || typeof validation.points !== 'number') {
          console.error("Validation incorrecte:", validation);
          throw new Error("Impossible de valider l'achat - format de validation incorrect");
        }
        
        console.log("Validation de l'achat réussie:", validation);

        // Obtenir la devise compatible PayPal à partir du service de tarification
        const paymentCurrency = await fetch('/api/payments/get-payment-currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ region }),
        }).then(res => res.json()).then(data => data.currency);

        console.log("Devise utilisée pour le paiement:", paymentCurrency);

        // Créer une transaction via l'API route
        const createOrderResponse = await fetch('/api/payments/create-order', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            userId,
            amount,
            currency: paymentCurrency || currency, // Utiliser la devise compatible PayPal ou celle fournie par défaut
            points: validation.points,
            bonus: validation.bonus,
            region,
            originalAmount: amount,
            originalCurrency: currency
          }),
        });

        if (!createOrderResponse.ok) {
          throw new Error(`Erreur lors de la création de la commande: ${createOrderResponse.status}`);
        }

        order = await createOrderResponse.json();
        console.log("Commande créée:", order);

      } catch (error) {
        console.error("Erreur lors de la validation ou création de commande:", error);
        throw error;
      }

      // Créer la commande PayPal
      return actions.order.create({
        intent: "CAPTURE",
        purchase_units: [
          {
            amount: {
              value: convertedAmount.toString(), // Utiliser le montant converti
              currency_code: paypalCurrency || currency.toUpperCase(), // Utiliser la devise compatible PayPal
            },
            description: `Achat de ${validation.points} points Bingoo`,
            custom_id: order.transactionId,
          },
        ],
      });
    } catch (error) {
      console.error("Erreur lors de la création de la commande:", error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de créer la commande PayPal";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      throw error;
    }
  };

  const handleApprove = async (data: OnApproveData, actions: OnApproveActions) => {
    try {
      console.log("Paiement approuvé par l'utilisateur:", data);
      
      // Capturer le paiement côté PayPal
      if (!actions.order) {
        throw new Error("Impossible de capturer le paiement: actions.order est indéfini");
      }
      
      const details = await actions.order.capture();
      console.log("Paiement capturé avec succès côté PayPal:", details);
      
      // Récupérer l'ID de transaction depuis l'ID personnalisé
      let transactionId = data.orderID;
      
      // Vérifier si les détails de l'achat sont disponibles
      if (details.purchase_units && details.purchase_units.length > 0 && details.purchase_units[0].custom_id) {
        transactionId = details.purchase_units[0].custom_id;
      }
      
      // Mettre à jour la transaction via l'API route
      const captureResponse = await fetch('/api/payments/capture', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          transactionId: transactionId
        }),
      });
      
      if (!captureResponse.ok) {
        throw new Error(`Erreur lors de la capture: ${captureResponse.status}`);
      }
      
      const transaction = await captureResponse.json();
      console.log("Transaction mise à jour avec succès:", transaction);
      
      toast({
        title: "Succès",
        description: `Paiement effectué avec succès ! ${transaction.pointsAmount} points ajoutés à votre compte.`,
      });
      
      // Déclencher le callback de succès
      onSuccess?.();
    } catch (error) {
      console.error("Erreur lors de la finalisation du paiement:", error);
      const errorMessage = error instanceof Error ? error.message : "Impossible de finaliser le paiement";
      toast({
        variant: "destructive",
        title: "Erreur",
        description: errorMessage,
      });
      
      // Gérer l'erreur via l'API route
      await fetch('/api/payments/error', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          orderId: data.orderID,
          error: { message: errorMessage }
        }),
      }).catch(e => console.error("Erreur lors de l'enregistrement de l'erreur:", e));
    }
  };

  if (error) {
    return (
      <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
        <p className="text-sm font-medium">{error}</p>
        <p className="text-xs mt-1">Veuillez vérifier la configuration de PayPal dans les variables d'environnement.</p>
      </div>
    );
  }

  if (!isPayPalReady || isLoadingCurrency) {
    return (
      <div className="p-4 bg-gray-100 border border-gray-200 rounded-md text-gray-600 animate-pulse">
        <p className="text-sm">Chargement de PayPal...</p>
      </div>
    );
  }
  
  // Le mode PayPal est uniquement loggé dans la console pour les développeurs


  
  return (
    <PayPalScriptProvider options={initialOptions}>
      <div className="relative">
        {error ? (
          <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-600">
            <p className="text-sm font-medium">{error}</p>
            <p className="text-xs mt-1">Détails techniques: Mode={paypalMode}, ClientID={clientId ? clientId.substring(0, 8) + '...' : 'Non défini'}</p>
            <Button 
              variant="outline" 
              size="sm" 
              className="mt-2"
              onClick={() => window.location.reload()}
            >
              Réessayer
            </Button>
          </div>
        ) : (
          <PayPalButtons
            style={{
              layout: "vertical",
              color: "gold",
              shape: "rect",
              label: "pay",
            }}
            createOrder={handleCreateOrder}
            onApprove={handleApprove}
            onCancel={() => {
              console.log("Paiement annulé par l'utilisateur");
              toast({
                title: "Paiement annulé",
                description: "Vous avez annulé le processus de paiement.",
              });
            }}
            onError={(err) => {
              console.error("Erreur PayPal:", err);
              // Afficher plus de détails sur l'erreur
              const errorMessage = err.message || "Une erreur est survenue lors du paiement";
              const errorCode = err.code || "";
              toast({
                variant: "destructive",
                title: "Erreur PayPal",
                description: `${errorMessage}${errorCode ? ` (Code: ${errorCode})` : ""}. Veuillez réessayer.`,
              });
            }}
          />
        )}
      </div>
    </PayPalScriptProvider>
  );
}
