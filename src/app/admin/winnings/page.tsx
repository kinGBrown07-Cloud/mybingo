"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Trophy, CreditCard, CheckCircle, XCircle } from "lucide-react";

// Définition locale du composant Textarea pour éviter les problèmes d'importation
const Textarea = React.forwardRef<
  HTMLTextAreaElement, 
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={`flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${className || ''}`}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

interface Winning {
  id: string;
  userId: string;
  gameType: 'MEMORY' | 'BLACKJACK' | 'SLOTS';
  bet: number;
  winAmount: number;
  createdAt: string;
  email: string;
  username: string;
  playerName: string;
}

interface Withdrawal {
  id: string;
  userId: string;
  pointsAmount: number;
  createdAt: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  description?: string;
  email: string;
  username: string;
  playerName: string;
}

export default function WinningsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null>(null);
  const { toast } = useToast();
  const [winnings, setWinnings] = useState<Winning[]>([]);
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isWithdrawalsLoading, setIsWithdrawalsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedWithdrawal, setSelectedWithdrawal] = useState<Withdrawal | null>(null);
  const [withdrawalStatus, setWithdrawalStatus] = useState<'COMPLETED' | 'FAILED'>('COMPLETED');
  const [withdrawalDescription, setWithdrawalDescription] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const fetchWinnings = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/winnings');
      const data = await response.json();

      if (response.ok) {
        setWinnings(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les gains",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching winnings:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des gains",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);
  
  const fetchWithdrawals = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/withdrawals');
      const data = await response.json();

      if (response.ok) {
        setWithdrawals(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les demandes de retrait",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching withdrawals:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des demandes de retrait",
        variant: "destructive",
      });
    } finally {
      setIsWithdrawalsLoading(false);
    }
  }, [toast]);
  
  const processWithdrawal = async (transactionId: string, status: 'COMPLETED' | 'FAILED', description?: string) => {
    setIsProcessing(true);
    try {
      const response = await fetch('/api/admin/withdrawals', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          transactionId,
          status,
          description
        }),
      });

      const data = await response.json();

      if (response.ok) {
        toast({
          title: "Succès",
          description: status === 'COMPLETED' ? "Retrait validé avec succès" : "Retrait refusé avec succès",
        });
        // Rafraîchir la liste des retraits
        fetchWithdrawals();
      } else {
        toast({
          title: "Erreur",
          description: data.error || "Une erreur est survenue lors du traitement du retrait",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error processing withdrawal:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du traitement du retrait",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
      setIsDialogOpen(false);
    }
  };

  useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est authentifié
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        
        if (error || !supabaseUser) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        // Vérifier si l'utilisateur est admin
        const isAdmin = 
          supabaseUser.user_metadata?.role === 'ADMIN' || 
          supabaseUser.app_metadata?.role === 'ADMIN';
        
        if (!isAdmin) {
          console.log('Utilisateur non admin, redirection vers dashboard');
          router.push('/dashboard');
          return;
        }
        
        setUser(supabaseUser);
        fetchWinnings();
        fetchWithdrawals();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      }
    }
    
    checkAuth();
  }, [router, fetchWinnings, fetchWithdrawals]);

  const getGameTypeLabel = (type: string) => {
    switch (type) {
      case 'MEMORY':
        return 'Memory';
      case 'BLACKJACK':
        return 'Blackjack';
      case 'SLOTS':
        return 'Machine à sous';
      default:
        return type;
    }
  };

  const getGameTypeBadgeColor = (type: string) => {
    switch (type) {
      case 'MEMORY':
        return 'bg-blue-500';
      case 'BLACKJACK':
        return 'bg-green-500';
      case 'SLOTS':
        return 'bg-amber-500';
      default:
        return 'bg-gray-500';
    }
  };

  const filteredWinnings = winnings.filter(win => 
    win.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    win.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    win.playerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    win.gameType.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleWithdrawalAction = (withdrawal: Withdrawal, action: 'approve' | 'reject') => {
    setSelectedWithdrawal(withdrawal);
    setWithdrawalStatus(action === 'approve' ? 'COMPLETED' : 'FAILED');
    setWithdrawalDescription(action === 'approve' ? 
      `Retrait validé le ${new Date().toLocaleDateString()}` : 
      'Retrait refusé');
    setIsDialogOpen(true);
  };

  const filteredWithdrawals = withdrawals.filter(withdrawal => 
    withdrawal.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    withdrawal.playerName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="container mx-auto py-10">
      <Tabs defaultValue="winnings" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="winnings" className="flex items-center">
            <Trophy className="mr-2 h-4 w-4" />
            Gains des joueurs
          </TabsTrigger>
          <TabsTrigger value="withdrawals" className="flex items-center">
            <CreditCard className="mr-2 h-4 w-4" />
            Demandes de retrait
          </TabsTrigger>
        </TabsList>
        
        <TabsContent value="winnings">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Gains des joueurs</h1>
            <div className="w-1/3">
              <Input
                placeholder="Rechercher par joueur, email ou type de jeu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>

          <Card>
            <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Joueur</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Type de jeu</TableHead>
                <TableHead className="text-right">Mise</TableHead>
                <TableHead className="text-right">Gain</TableHead>
                <TableHead className="text-right">Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Chargement des gains...
                  </TableCell>
                </TableRow>
              ) : filteredWinnings.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-10">
                    Aucun gain trouvé
                  </TableCell>
                </TableRow>
              ) : (
                filteredWinnings.map((win) => (
                  <TableRow key={win.id}>
                    <TableCell className="font-medium">
                      {win.playerName}
                      <div className="text-sm text-gray-500">@{win.username}</div>
                    </TableCell>
                    <TableCell>{win.email}</TableCell>
                    <TableCell>
                      <Badge className={getGameTypeBadgeColor(win.gameType)}>
                        {getGameTypeLabel(win.gameType)}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">{win.bet.toLocaleString()} points</TableCell>
                    <TableCell className="text-right font-bold text-green-600">
                      +{win.winAmount.toLocaleString()} points
                    </TableCell>
                    <TableCell className="text-right">
                      {new Date(win.createdAt).toLocaleDateString()} {new Date(win.createdAt).toLocaleTimeString()}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
        </TabsContent>
        
        <TabsContent value="withdrawals">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-3xl font-bold">Demandes de retrait en attente</h1>
            <div className="w-1/3">
              <Input
                placeholder="Rechercher par joueur ou email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full"
              />
            </div>
          </div>
          
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Joueur</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead className="text-right">Montant</TableHead>
                    <TableHead className="text-right">Date de demande</TableHead>
                    <TableHead className="text-center">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isWithdrawalsLoading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Chargement des demandes de retrait...
                      </TableCell>
                    </TableRow>
                  ) : filteredWithdrawals.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-10">
                        Aucune demande de retrait en attente
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredWithdrawals.map((withdrawal) => (
                      <TableRow key={withdrawal.id}>
                        <TableCell className="font-medium">
                          {withdrawal.playerName}
                          <div className="text-sm text-gray-500">@{withdrawal.username}</div>
                        </TableCell>
                        <TableCell>{withdrawal.email}</TableCell>
                        <TableCell className="text-right font-bold">
                          {withdrawal.pointsAmount.toLocaleString()} points
                        </TableCell>
                        <TableCell className="text-right">
                          {new Date(withdrawal.createdAt).toLocaleDateString()} {new Date(withdrawal.createdAt).toLocaleTimeString()}
                        </TableCell>
                        <TableCell>
                          <div className="flex justify-center gap-2">
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center text-green-600 hover:text-green-800 hover:bg-green-50"
                              onClick={() => handleWithdrawalAction(withdrawal, 'approve')}
                            >
                              <CheckCircle className="mr-1 h-4 w-4" />
                              Valider
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="flex items-center text-red-600 hover:text-red-800 hover:bg-red-50"
                              onClick={() => handleWithdrawalAction(withdrawal, 'reject')}
                            >
                              <XCircle className="mr-1 h-4 w-4" />
                              Refuser
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
      
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {withdrawalStatus === 'COMPLETED' ? 'Valider le retrait' : 'Refuser le retrait'}
            </DialogTitle>
            <DialogDescription>
              {withdrawalStatus === 'COMPLETED' 
                ? 'Confirmez-vous avoir effectué le paiement au joueur?' 
                : 'Le montant sera remboursé sur le compte du joueur.'}
            </DialogDescription>
          </DialogHeader>
          
          {selectedWithdrawal && (
            <div className="py-4">
              <p><strong>Joueur:</strong> {selectedWithdrawal.playerName}</p>
              <p><strong>Montant:</strong> {selectedWithdrawal.pointsAmount.toLocaleString()} points</p>
              
              <div className="mt-4">
                <label htmlFor="description" className="block text-sm font-medium mb-2">
                  Commentaire (optionnel)
                </label>
                <Textarea
                  id="description"
                  value={withdrawalDescription}
                  onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setWithdrawalDescription(e.target.value)}
                  placeholder="Ajouter un commentaire..."
                  className="w-full"
                />
              </div>
            </div>
          )}
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isProcessing}>
              Annuler
            </Button>
            <Button 
              onClick={() => selectedWithdrawal && processWithdrawal(selectedWithdrawal.id, withdrawalStatus, withdrawalDescription)}
              disabled={isProcessing}
              variant={withdrawalStatus === 'COMPLETED' ? 'default' : 'destructive'}
            >
              {isProcessing ? 'Traitement en cours...' : withdrawalStatus === 'COMPLETED' ? 'Confirmer le paiement' : 'Refuser le retrait'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
