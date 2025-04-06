'use client';

import { useState } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useTransactions } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { toast } from '@/components/ui/use-toast';

// Ajouter les constantes de conversion selon les régions
const CONVERSION_RATES = {
  BLACK_AFRICA: { rate: 150, currency: 'XOF' }, // 2 points = 300 XOF
  NORTH_AFRICA: { rate: 250, currency: 'XOF' }, // 2 points = 500 XOF
  EUROPE: { rate: 1, currency: '€' },           // 2 points = 2 EUR
  AMERICAS: { rate: 1, currency: '$' },         // 2 points = 2 USD
  ASIA: { rate: 1, currency: '$' }              // 2 points = 2 USD
};

// Ajouter les prix des jeux
const GAME_PRIZES = {
  FOODS: 100,    // 100 EUR
  MODE: 200,     // 200 EUR
  JACKPOT: 3800  // 3800 EUR
};

export default function UserProfile() {
  const { user, profile: authProfile } = useSupabase();
  const { transactions, profile: walletProfile, isLoading, error, deposit, withdraw } = useTransactions(user?.id || '');
  const [amount, setAmount] = useState('');

  if (!user || !authProfile || !walletProfile) {
    return (
      <div className="flex items-center justify-center h-[400px]">
        <p className="text-lg">Connectez-vous pour voir votre profil</p>
      </div>
    );
  }

  const getConversionRate = () => {
    const region = authProfile.region;
    return CONVERSION_RATES[region];
  };

  const formatCurrency = (amount: number) => {
    const { rate, currency } = getConversionRate();
    const convertedAmount = amount * rate;
    return `${convertedAmount.toFixed(2)} ${currency}`;
  };

  const handleDeposit = async () => {
    const value = Number(amount);
    const { rate } = getConversionRate();

    if (isNaN(value) || value <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide",
        variant: "destructive"
      });
      return;
    }

    try {
      // Convertir le montant en points (2 points = taux selon la région)
      const pointsToAdd = Math.floor((value / rate) * 2);
      await deposit(pointsToAdd);
      setAmount('');
      toast({
        title: "Dépôt effectué",
        description: `${formatCurrency(value)} ont été ajoutés à votre compte`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Le dépôt a échoué",
        variant: "destructive"
      });
    }
  };

  const handleWithdraw = async () => {
    const value = Number(amount);
    const { rate } = getConversionRate();

    if (isNaN(value) || value <= 0) {
      toast({
        title: "Erreur",
        description: "Montant invalide",
        variant: "destructive"
      });
      return;
    }

    if (value > walletProfile.coins / 2) { // 2 points = taux selon la région
      toast({
        title: "Erreur",
        description: "Solde insuffisant",
        variant: "destructive"
      });
      return;
    }

    try {
      await withdraw(value);
      setAmount('');
      toast({
        title: "Retrait effectué",
        description: `${formatCurrency(value)} ont été retirés de votre compte`,
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Le retrait a échoué",
        variant: "destructive"
      });
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('fr-FR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const getTransactionLabel = (type: string) => {
    switch (type) {
      case 'DEPOSIT':
        return 'Dépôt';
      case 'WITHDRAWAL':
        return 'Retrait';
      case 'BET':
        return 'Mise';
      case 'WIN':
        return 'Gain';
      case 'REFUND':
        return 'Remboursement';
      default:
        return type;
    }
  };

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Informations du profil */}
      <Card className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-2xl font-bold mb-4">Profil</h2>
            <div className="space-y-2">
              <p>
                <span className="font-semibold">Nom:</span>{' '}
                {authProfile.first_name} {authProfile.last_name}
              </p>
              <p>
                <span className="font-semibold">Email:</span>{' '}
                {user.email}
              </p>
              <p>
                <span className="font-semibold">Pays:</span>{' '}
                {authProfile.country}
              </p>
              {authProfile.phone && (
                <p>
                  <span className="font-semibold">Téléphone:</span>{' '}
                  {authProfile.phone}
                </p>
              )}
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-bold mb-4">Solde</h2>
            <div className="space-y-4">
              <div className="text-3xl font-bold">
                {walletProfile.coins} points
                <span className="text-sm text-muted-foreground ml-2">
                  ({formatCurrency(walletProfile.coins / 2)})
                </span>
              </div>

              <div className="space-y-2">
                <Label htmlFor="amount">Montant</Label>
                <div className="flex space-x-2">
                  <Input
                    id="amount"
                    type="number"
                    min="0"
                    step="0.01"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder="0.00"
                  />
                  <Button onClick={handleDeposit} disabled={isLoading}>
                    Déposer
                  </Button>
                  <Button onClick={handleWithdraw} disabled={isLoading} variant="outline">
                    Retirer
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Historique des transactions */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold mb-4">Historique des transactions</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Date</TableHead>
              <TableHead>Type</TableHead>
              <TableHead className="text-right">Montant</TableHead>
              <TableHead className="text-right">Points</TableHead>
              <TableHead>Statut</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {transactions.map((transaction) => (
              <TableRow key={transaction.id}>
                <TableCell>{formatDate(transaction.created_at)}</TableCell>
                <TableCell>{getTransactionLabel(transaction.type)}</TableCell>
                <TableCell className="text-right">
                  {formatCurrency(transaction.amount)}
                </TableCell>
                <TableCell className="text-right">
                  {transaction.coins_amount}
                </TableCell>
                <TableCell>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs ${
                    transaction.status === 'COMPLETED'
                      ? 'bg-green-100 text-green-800'
                      : transaction.status === 'PENDING'
                      ? 'bg-yellow-100 text-yellow-800'
                      : 'bg-red-100 text-red-800'
                  }`}>
                    {transaction.status}
                  </span>
                </TableCell>
              </TableRow>
            ))}
            {transactions.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                  Aucune transaction
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </Card>

      {error && (
        <div className="text-red-500 mt-4">
          {error.message}
        </div>
      )}
    </div>
  );
}
