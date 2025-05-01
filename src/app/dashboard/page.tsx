'use client';

import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import Image from 'next/image';
import { supabase } from '@/lib/supabase-client';
import { useRouter } from 'next/navigation';
import { Skeleton } from '@/components/ui/skeleton';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowDown, ArrowUp, Clock, CreditCard, DollarSign, RefreshCw } from 'lucide-react';

interface UserProfile {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  points?: number;
  region?: string;
  country?: string;
}

interface Transaction {
  id: string;
  type: string;
  status: string;
  pointsAmount: number;
  bonus?: number;
  createdAt: string;
  description: string;
}

export default function DashboardPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [balance, setBalance] = useState<number>(0);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('mobile_money');
  const [accountInfo, setAccountInfo] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [withdrawalSuccess, setWithdrawalSuccess] = useState<boolean>(false);
  
  useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est authentifié
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        console.log('Utilisateur authentifié:', user.id);
        
        try {
          // Récupérer le profil utilisateur via notre API
          const response = await fetch(`/api/profile?userId=${user.id}`);
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('Profil récupéré avec succès:', profileData);
            setProfile(profileData);
            
            // Récupérer les transactions et le solde
            fetchTransactions(user.id);
          } else {
            // En cas d'erreur, créer un profil temporaire à partir des données utilisateur
            console.warn('Impossible de récupérer le profil, utilisation des données utilisateur de base');
            const userEmail = user.email || '';
            const firstName = userEmail.split('@')[0] || 'Utilisateur';
            
            setProfile({
              id: 'temp-id',
              userId: user.id,
              firstName: firstName,
              lastName: '',
              points: 0
            });
          }
        } catch (profileError) {
          console.error('Erreur lors de la récupération du profil:', profileError);
          // Créer un profil temporaire
          const userEmail = user.email || '';
          const firstName = userEmail.split('@')[0] || 'Utilisateur';
          
          setProfile({
            id: 'temp-id',
            userId: user.id,
            firstName: firstName,
            lastName: '',
            points: 0
          });
        }
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }
    
    checkAuth();
  }, [router]);
  
  // Fonction pour récupérer les transactions et le solde
  const fetchTransactions = async (userId: string) => {
    try {
      const response = await fetch(`/api/transactions?userId=${userId}`);
      
      if (response.ok) {
        const data = await response.json();
        setBalance(data.balance);
        setTransactions(data.transactions);
      } else {
        console.error('Erreur lors de la récupération des transactions');
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des transactions:', error);
    }
  };
  
  // Fonction pour effectuer un retrait
  const handleWithdraw = async () => {
    if (!profile || !profile.userId) return;
    
    // Vérifier que le montant est valide
    if (withdrawAmount <= 0) {
      toast({
        title: "Montant invalide",
        description: "Le montant doit être supérieur à 0",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que le montant ne dépasse pas le solde
    if (withdrawAmount > balance) {
      toast({
        title: "Solde insuffisant",
        description: "Vous n'avez pas assez de points pour effectuer ce retrait",
        variant: "destructive"
      });
      return;
    }
    
    // Vérifier que les informations de compte sont renseignées
    if (!accountInfo) {
      toast({
        title: "Informations manquantes",
        description: "Veuillez renseigner les informations de compte pour le retrait",
        variant: "destructive"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: profile.userId,
          points: withdrawAmount,
          paymentMethod,
          accountInfo
        }),
      });
      
      if (response.ok) {
        const data = await response.json();
        toast({
          title: "Demande de retrait envoyée",
          description: data.message,
        });
        
        // Réinitialiser le formulaire
        setWithdrawAmount(0);
        setAccountInfo('');
        setWithdrawalSuccess(true);
        
        // Rafraîchir les transactions
        fetchTransactions(profile.userId);
      } else {
        const error = await response.json();
        toast({
          title: "Erreur",
          description: error.error || "Une erreur est survenue lors du traitement de votre demande",
          variant: "destructive"
        });
      }
    } catch (error) {
      console.error('Erreur lors du retrait:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement de votre demande",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };
  
  // Fonction pour formater la date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };
  
  // Fonction pour obtenir l'icône et la couleur en fonction du type de transaction
  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'PAYMENT':
        return { icon: <CreditCard className="h-4 w-4" />, color: 'text-blue-500' };
      case 'GAME_WIN':
        return { icon: <DollarSign className="h-4 w-4" />, color: 'text-green-500' };
      case 'WITHDRAWAL':
        return { icon: <ArrowUp className="h-4 w-4" />, color: 'text-red-500' };
      default:
        return { icon: <Clock className="h-4 w-4" />, color: 'text-gray-500' };
    }
  };
  
  // Fonction pour obtenir le libellé du statut
  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return { label: 'Terminé', color: 'bg-green-100 text-green-800' };
      case 'PENDING':
        return { label: 'En attente', color: 'bg-yellow-100 text-yellow-800' };
      case 'FAILED':
        return { label: 'Échoué', color: 'bg-red-100 text-red-800' };
      default:
        return { label: status, color: 'bg-gray-100 text-gray-800' };
    }
  };
  
  if (loading) {
    return (
      <div className="container py-10">
        <Skeleton className="h-12 w-48 mb-6" />
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <Skeleton className="h-40 w-full" />
          <Skeleton className="h-40 w-full" />
        </div>
        
        <Skeleton className="h-8 w-48 mb-4" />
        <Skeleton className="h-32 w-full" />
      </div>
    );
  }
  
  if (!profile) {
    return (
      <div className="container py-10">
        <h1 className="text-3xl font-bold mb-6">Erreur</h1>
        <p>Impossible de charger votre profil. Veuillez vous reconnecter.</p>
        <Button className="mt-4" onClick={() => router.push('/auth/login')}>
          Se connecter
        </Button>
      </div>
    );
  }
  
  return (
    <div className="container py-10">
      <h1 className="text-3xl font-bold mb-6">Tableau de bord</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Bienvenue, {profile.firstName}!</h2>
            <p>Votre compte est actif et prêt à jouer.</p>
            <Button className="mt-4 bg-purple-600 hover:bg-purple-700">
              <Link href="/games">Jouer maintenant</Link>
            </Button>
          </CardContent>
        </Card>
        
        <Card>
          <CardContent className="pt-6">
            <h2 className="text-xl font-semibold mb-4">Votre solde</h2>
            <p className="text-2xl font-bold">{balance} points</p>
            <div className="flex gap-2 mt-4">
              <Button variant="outline">
                <Link href="/points/buy">Acheter des points</Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex items-center gap-1"
                onClick={() => profile.userId && fetchTransactions(profile.userId)}
              >
                <RefreshCw className="h-4 w-4" />
                Actualiser
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
      
      <Tabs defaultValue="games" className="mb-8">
        <TabsList className="mb-4">
          <TabsTrigger value="games">Jeux disponibles</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="withdraw">Retrait des gains</TabsTrigger>
        </TabsList>
        
        <TabsContent value="games">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image 
                  src="/images/games/cards/classic-cards.png"
                  alt="Foods Cards"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent flex items-end">
                  <h3 className="text-xl font-bold text-white p-4">Foods Cards</h3>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-gray-400 mb-4">Gagnez des kits alimentaires de qualité ou leur équivalent en argent.</p>
                <Link href="/games/foods">
                  <Button className="w-full casino-button">Jouer maintenant</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image 
                  src="/images/games/cards/magic-fortune.png"
                  alt="Mode Cards"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-purple-900/70 to-transparent flex items-end">
                  <h3 className="text-xl font-bold text-white p-4">Mode Cards</h3>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-gray-400 mb-4">Remportez des vêtements tendance et accessoires de marque, ou optez pour leur valeur en argent.</p>
                <Link href="/games/mode">
                  <Button className="w-full casino-button">Jouer maintenant</Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="overflow-hidden">
              <div className="relative h-48">
                <Image 
                  src="/images/games/cards/gold-digger.png"
                  alt="Jackpot Cards"
                  fill
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-amber-900/70 to-transparent flex items-end">
                  <h3 className="text-xl font-bold text-white p-4">Jackpot Cards</h3>
                </div>
              </div>
              <CardContent className="pt-4">
                <p className="text-gray-400 mb-4">Tentez votre chance pour gagner des lots exceptionnels : voitures, voyages, électronique haut de gamme!</p>
                <Link href="/games/jackpot">
                  <Button className="w-full casino-button">Jouer maintenant</Button>
                </Link>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
        
        <TabsContent value="transactions">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Historique des transactions</h2>
              
              {transactions.length === 0 ? (
                <p className="text-gray-500 py-4">Aucune transaction trouvée.</p>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => {
                    const { icon, color } = getTransactionIcon(transaction.type);
                    const { label, color: statusColor } = getStatusLabel(transaction.status);
                    
                    return (
                      <div key={transaction.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-full ${color} bg-opacity-10`}>
                            {icon}
                          </div>
                          <div>
                            <p className="font-medium">
                              {transaction.type === 'PAYMENT' ? 'Achat de points' : 
                               transaction.type === 'GAME_WIN' ? 'Gain de jeu' : 
                               transaction.type === 'WITHDRAWAL' ? 'Retrait' : 'Transaction'}
                            </p>
                            <p className="text-xs text-gray-500">{formatDate(transaction.createdAt)}</p>
                            {transaction.description && (
                              <p className="text-xs text-gray-500 mt-1">{transaction.description}</p>
                            )}
                          </div>
                        </div>
                        <div className="text-right">
                          <p className={`font-semibold ${
                            transaction.type === 'WITHDRAWAL' ? 'text-red-500' : 'text-green-500'
                          }`}>
                            {transaction.type === 'WITHDRAWAL' ? '-' : '+'}{transaction.pointsAmount} points
                          </p>
                          {transaction.bonus && transaction.bonus > 0 && (
                            <p className="text-xs text-blue-500">+{transaction.bonus} bonus</p>
                          )}
                          <span className={`text-xs px-2 py-1 rounded-full ${statusColor} mt-1 inline-block`}>
                            {label}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="withdraw">
          <Card>
            <CardContent className="pt-6">
              <h2 className="text-xl font-semibold mb-4">Retrait des gains</h2>
              
              {withdrawalSuccess ? (
                <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-4">
                  <h3 className="text-green-800 font-semibold mb-2">Demande de retrait envoyée avec succès!</h3>
                  <p className="text-green-700 text-sm mb-3">
                    Notre équipe traitera votre demande dans les 24-48 heures. Vous recevrez une notification une fois le traitement terminé.
                  </p>
                  <Button 
                    variant="outline" 
                    className="text-green-700 border-green-300 hover:bg-green-100"
                    onClick={() => setWithdrawalSuccess(false)}
                  >
                    Faire un nouveau retrait
                  </Button>
                </div>
              ) : (
                <>
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                    <p className="text-blue-700 text-sm">
                      Vous pouvez retirer vos gains à tout moment. Le montant minimum de retrait est de 10 points.
                      Les retraits sont traités dans un délai de 24 à 48 heures.
                    </p>
                  </div>
                  
                  <div className="space-y-4 mt-6">
                    <div>
                      <Label htmlFor="withdrawAmount">Montant à retirer (en points)</Label>
                      <Input
                        id="withdrawAmount"
                        type="number"
                        value={withdrawAmount || ''}
                        onChange={(e) => setWithdrawAmount(Number(e.target.value))}
                        min="10"
                        max={balance}
                        className="mt-1"
                      />
                      <p className="text-xs text-gray-500 mt-1">Solde disponible: {balance} points</p>
                    </div>
                    
                    <div>
                      <Label htmlFor="paymentMethod">Méthode de paiement</Label>
                      <Select 
                        value={paymentMethod} 
                        onValueChange={setPaymentMethod}
                      >
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Sélectionnez une méthode de paiement" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="mobile_money">Mobile Money (Orange Money, MTN Mobile Money)</SelectItem>
                          <SelectItem value="bank_transfer">Virement bancaire</SelectItem>
                          <SelectItem value="paypal">PayPal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="accountInfo">Informations de compte</Label>
                      <Input
                        id="accountInfo"
                        value={accountInfo}
                        onChange={(e) => setAccountInfo(e.target.value)}
                        className="mt-1"
                        placeholder={
                          paymentMethod === 'mobile_money' ? 'Numéro de téléphone (ex: +225 07 12 34 56)' :
                          paymentMethod === 'bank_transfer' ? 'IBAN / Informations bancaires' :
                          'Adresse email PayPal'
                        }
                      />
                    </div>
                    
                    <Button 
                      className="w-full mt-4" 
                      onClick={handleWithdraw}
                      disabled={isSubmitting || withdrawAmount <= 0 || withdrawAmount > balance || !accountInfo}
                    >
                      {isSubmitting ? (
                        <>
                          <span className="animate-spin mr-2">⟳</span>
                          Traitement en cours...
                        </>
                      ) : (
                        'Demander le retrait'
                      )}
                    </Button>
                  </div>
                </>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
