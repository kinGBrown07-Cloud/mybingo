'use client';

import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Loader2, CreditCard, Wallet } from 'lucide-react';
import { paypalService } from '@/lib/services/paypalService';
import { PayPalButton } from '@/components/paypal-button';
import { pricingService } from '@/lib/services/pricingService';
import { Region, Currency } from '@/lib/constants/regions';
import { detectUserRegion, getConversionRate, getCurrencyForRegion } from "@/utils/geo-location";

type PackageType = 'custom';

type PackageInfo = {
  points: number;
  price: number;
  discount: number;
};

type PackagesType = {
  [key in PackageType]: PackageInfo;
};

export default function BuyPointsPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [amount, setAmount] = useState('10');
  const [selectedPackage, setSelectedPackage] = useState<PackageType>('custom');
  const [userId, setUserId] = useState<string | null>(null);
  const [userRegion, setUserRegion] = useState<Region>(Region.BLACK_AFRICA); // Par défaut Afrique subsaharienne
  const [userCurrency, setUserCurrency] = useState<Currency>(Currency.XOF);
  const [conversionRate, setConversionRate] = useState<number>(150); // 1 point = 150 XOF par défaut
  const [paypalCurrency, setPaypalCurrency] = useState<string>('');
  const [paypalCurrencyLoading, setPaypalCurrencyLoading] = useState(true);
  
  // Utilisation d'un montant personnalisé uniquement
  const [packages, setPackages] = useState<PackagesType>({
    custom: { points: 0, price: 0, discount: 0 }, // Les valeurs seront calculées dynamiquement
  });

  useEffect(() => {
    // Récupérer les informations de l'utilisateur connecté
    const fetchUserInfo = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          setUserId(user.id);
          
          // Détecter automatiquement la région de l'utilisateur via son IP
          let detectedRegion: Region;
          try {
            detectedRegion = await detectUserRegion();
            console.log('Région détectée par géolocalisation:', detectedRegion);
          } catch (error) {
            console.error('Erreur lors de la détection de la région:', error);
            detectedRegion = Region.BLACK_AFRICA; // Par défaut
          }
          
          // Récupérer le profil utilisateur pour obtenir la région et la devise
          try {
            const response = await fetch(`/api/profile?userId=${user.id}`);
            
            if (response.ok) {
              const profileData = await response.json();
              // Utiliser la région du profil si disponible, sinon utiliser la région détectée
              const region = profileData.region ? (profileData.region as Region) : detectedRegion;
              setUserRegion(region);
              
              // Obtenir la devise et le taux de conversion pour cette région
              const currency = getCurrencyForRegion(region) as Currency;
              const rate = getConversionRate(region);
              
              setUserCurrency(currency);
              setConversionRate(rate);
              
              // Mettre à jour les prix des packs en fonction du taux de conversion
              setPackages({
                custom: { 
                  points: 0, 
                  price: 0, 
                  discount: 0 
                },
              });
            } else {
              // En cas d'erreur, utiliser la région détectée automatiquement
              console.log('Impossible de récupérer le profil, utilisation de la région détectée:', detectedRegion);
              throw new Error('Profil non disponible');
            }
          } catch (error) {
            // Si le profil n'est pas disponible, utiliser la région détectée
            const region = detectedRegion;
            setUserRegion(region);
            
            // Obtenir la devise et le taux de conversion pour cette région
            const currency = getCurrencyForRegion(region) as Currency;
            const rate = getConversionRate(region);
            
            setUserCurrency(currency);
            setConversionRate(rate);
            
            // Mettre à jour les prix des packs en fonction du taux de conversion
            setPackages({
              custom: { 
                points: 0, 
                price: 0, 
                discount: 0 
              },
            });
          }
        }
      } catch (error) {
        console.error("Erreur lors de la récupération des informations utilisateur:", error);
      }
    };
    
    fetchUserInfo();
  }, []);

  useEffect(() => {
    const fetchPaymentCurrency = async () => {
      try {
        setPaypalCurrencyLoading(true);
        const response = await fetch('/api/payments/get-payment-currency', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ region: userRegion }),
        });
        
        if (response.ok) {
          const data = await response.json();
          setPaypalCurrency(data.currency);
        } else {
          // En cas d'erreur, utiliser EUR par défaut
          setPaypalCurrency('EUR');
        }
      } catch (error) {
        console.error('Erreur lors de la récupération de la devise PayPal:', error);
        setPaypalCurrency('EUR');
      } finally {
        setPaypalCurrencyLoading(false);
      }
    };
    
    fetchPaymentCurrency();
  }, [userRegion]);

  // Calculer le prix final (pas de remise pour le montant personnalisé)
  const calculateFinalPrice = (packageType: PackageType) => {
    return Number(amount);
  };

  // Gérer le paiement direct via PayPal
  const handlePurchase = async () => {
    setIsLoading(true);
    
    try {
      // Vérifier si l'utilisateur est connecté
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Vous devez être connecté pour acheter des points",
        });
        router.push('/auth/login?callbackUrl=/points/buy');
        return;
      }
      
      setUserId(user.id);
      
      // Vérifier que le montant est valide
      const numAmount = Number(amount);
      if (isNaN(numAmount) || numAmount < 5) {
        toast({
          variant: "destructive",
          title: "Montant invalide",
          description: "Le montant minimum est de 5 " + userCurrency,
        });
        setIsLoading(false);
        return;
      }
      
      // Calculer le nombre de points que l'utilisateur recevra
      const pointsToReceive = Math.floor(numAmount / conversionRate);
      
      // Générer les paramètres PayPal
      const paypalParams = paypalService.generatePaypalParams({
        userId: user.id,
        amount: numAmount,
        currency: userCurrency.toString(),
        points: pointsToReceive,
        region: userRegion
      });
      
      // Créer un formulaire et le soumettre manuellement
      const form = document.createElement('form');
      form.method = 'post';
      form.action = paypalService.getPaypalBaseUrl();
      form.target = '_self'; // Ouvrir dans la même fenêtre
      
      // Ajouter tous les paramètres au formulaire
      Object.entries(paypalParams).forEach(([key, value]) => {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = key;
        input.value = value;
        form.appendChild(input);
      });
      
      // Ajouter le formulaire au document et le soumettre
      document.body.appendChild(form);
      console.log('Soumission du formulaire PayPal...');
      form.submit();
      
    } catch (error) {
      console.error("Erreur lors de l'achat:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de l'achat",
      });
      setIsLoading(false);
    }
  };
  
  // Gérer le succès du paiement PayPal
  const handlePayPalSuccess = () => {
    toast({
      title: "Paiement réussi",
      description: "Votre paiement a été traité avec succès!",
    });
    router.push('/dashboard');
  };

  return (
    <div className="container max-w-4xl mx-auto py-8 px-4">
      <div className="space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight">Acheter des points</h1>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            Achetez des points pour jouer à Bingoo et gagner des récompenses
          </p>
        </div>
        
        <Card className="mt-6">
          <CardHeader>
            <CardTitle>Acheter des points</CardTitle>
            <CardDescription>
              Choisissez le montant que vous souhaitez dépenser pour acheter des points
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="amount">Montant ({userCurrency})</Label>
                <Input
                  id="amount"
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  min="5"
                  step="1"
                />
              </div>
              
              <div className="p-4 bg-gray-100 rounded-md dark:bg-gray-800">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Vous recevrez environ {Math.floor(Number(amount) / conversionRate)} points
                </p>
                <p className="text-xs text-gray-500 mt-1 dark:text-gray-400">
                  (Taux de conversion: {conversionRate} {userCurrency} par point)
                </p>
              </div>
              
              <div className="space-y-4 mt-6">
                <h3 className="text-lg font-medium">Méthodes de paiement</h3>
                
                {/* Section PayPal et Carte bancaire */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Méthodes de paiement</h4>
                  <p className="text-sm text-gray-500 mb-4">Choisissez votre mode de paiement préféré</p>
                  
                  {userId && (
                    <div className="w-full">
                      {isLoading ? (
                        <Button className="w-full" disabled>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Traitement en cours...
                        </Button>
                      ) : (
                        <>
                          {/* Afficher la devise compatible PayPal */}
                          <div className="text-center mb-2 text-sm text-gray-500">
                            {paypalCurrencyLoading ? (
                              "Chargement..."
                            ) : (
                              `Vous serez facturé en ${paypalCurrency} (devise compatible PayPal)`
                            )}
                          </div>
                          
                          {/* PayPal Checkout avec SDK officiel */}
                          <div className="mb-4">
                            <PayPalButton
                              amount={Number(amount)}
                              currency={userCurrency.toString()}
                              region={userRegion}
                              userId={userId}
                              onSuccess={() => {
                                toast({
                                  title: "Paiement réussi",
                                  description: `Vous avez acheté ${Math.floor(Number(amount) / conversionRate)} points avec succès !`,
                                });
                                // Rediriger vers la page d'accueil après un court délai
                                setTimeout(() => {
                                  window.location.href = "/";
                                }, 2000);
                              }}
                            />
                          </div>
                        </>
                      )}
                    </div>
                  )}
                </div>
                
                {/* Section Mobile Money (CinetPay) */}
                <div className="border rounded-lg p-4">
                  <h4 className="font-medium mb-2">Mobile Money <span className="text-xs bg-blue-100 text-blue-800 rounded px-2 py-1 ml-2">Bientôt disponible</span></h4>
                  <p className="text-sm text-gray-500 mb-4">Paiement via Mobile Money (Orange Money, MTN Mobile Money, etc.)</p>
                  <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-3 text-sm text-blue-800">
                    <p>Le paiement par Mobile Money sera disponible prochainement.</p>
                  </div>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    disabled={true}
                  >
                    <Wallet className="mr-2 h-4 w-4" />
                    Bientôt disponible
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <div className="mt-8 text-sm text-gray-500 dark:text-gray-400">
          <h3 className="font-medium mb-2">Informations importantes</h3>
          <ul className="list-disc pl-5 space-y-1">
            <li>Les points achetés sont crédités instantanément sur votre compte</li>
            <li>Les points n'expirent pas et peuvent être utilisés à tout moment</li>
            <li>Pour toute question, contactez notre support client</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
