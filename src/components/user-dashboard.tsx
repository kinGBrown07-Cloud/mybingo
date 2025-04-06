"use client";

import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import Link from 'next/link';
import type { GameSession, Transaction, GameStats, User } from '@/types/db';
import { GameType } from '@/types/game';
import { getUserGameStats } from '@/services/gameService';
import { useGlobalBalance } from '@/hooks/use-global-balance';

export interface UserDashboardProps {
  user: {
    id: string;
    userId: string;
    username: string;
    firstName: string;
    lastName: string;
    phoneNumber: string | null;
    birthdate: Date | null;
    country: string;
    region: string;
    currency: string;
    coins: number;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    gameSessions: GameSession[];
    transactions: Transaction[];
    email: string;
  };
}

// Tableau des gains possibles par type de jeu
const GAME_PRIZES = [
  { type: 'FOODS' as GameType, prize: 100 },
  { type: 'MODE' as GameType, prize: 200 },
  { type: 'JACKPOT' as GameType, prize: 3800 }
] as const;

export const UserDashboard: React.FC<UserDashboardProps> = ({ user }) => {
  const { setCoins } = useGlobalBalance();
  const [stats, setStats] = useState<GameStats | null>(null);
  const [recentGames, setRecentGames] = useState<GameSession[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Mettre à jour le solde global quand user.coins change
  useEffect(() => {
    setCoins(user.coins);
  }, [user.coins, setCoins]);

  // Charger les données du tableau de bord
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        const stats = await getUserGameStats(user.id);
        setStats(stats);
        setRecentGames(user.gameSessions || []);
        setTransactions(user.transactions || []);
      } catch (error) {
        console.error("Erreur lors du chargement des données:", error);
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, [user.id, user.gameSessions, user.transactions]);

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

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING':
        return 'En attente';
      case 'COMPLETED':
        return 'Terminé';
      case 'FAILED':
        return 'Échoué';
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('fr-CH', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    }).format(date);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6">
      {/* En-tête du tableau de bord */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-white">Tableau de bord</h1>
          <p className="text-gray-400">Bienvenue, {user.firstName}. Gérez vos jeux et transactions.</p>
        </div>
        <div className="mt-4 md:mt-0 flex flex-col items-end">
          <div className="text-gray-400">Votre solde</div>
          <div className="text-2xl font-bold text-yellow-500">{user.coins} Coins</div>
          <Button className="mt-2 casino-button">Déposer des fonds</Button>
        </div>
      </div>

      {/* Statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Parties jouées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{stats?.totalGames || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Parties gagnées</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{stats?.winCount || 0}</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Taux de réussite</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{stats?.winRate.toFixed(2) || '0.00'}%</p>
          </CardContent>
        </Card>

        <Card className="bg-zinc-800 border-zinc-700">
          <CardHeader className="pb-2">
            <CardTitle className="text-white">Plus gros gain</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-500">{stats?.biggestWin || 0} {user.currency}</p>
          </CardContent>
        </Card>
      </div>

      {/* Contenu du tableau de bord */}
      <Tabs defaultValue="games">
        <TabsList className="mb-4">
          <TabsTrigger value="games">Mes jeux</TabsTrigger>
          <TabsTrigger value="transactions">Transactions</TabsTrigger>
          <TabsTrigger value="settings">Paramètres</TabsTrigger>
        </TabsList>

        {/* Section des jeux */}
        <TabsContent value="games">
          <div className="space-y-8">
            {/* Jeux disponibles */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Jeux disponibles</h2>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="h-56 relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/games/cards/foods-cards.png)' }}>
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <span className="absolute top-2 left-2 bg-red-600 text-white text-xs px-2 py-1 rounded">POPULAIRE</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">Foods Cards</h3>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-gray-400 mb-4">Gagnez des kits alimentaires de qualité ou leur équivalent en argent. Trouvez deux images identiques parmi les cartes.</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Kits alimentaires premium
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Équivalent en argent possible
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> 1 point par carte retournée
                      </div>
                    </div>
                    <Link href="/games/foods">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">JOUER MAINTENANT</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="h-56 relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/games/cards/mode-cards.png)' }}>
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <span className="absolute top-2 left-2 bg-purple-600 text-white text-xs px-2 py-1 rounded">MODE</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">Mode Cards</h3>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-gray-400 mb-4">Remportez des vêtements tendance et accessoires de marque, ou optez pour leur valeur en argent.</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Vêtements de marque
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Accessoires premium
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> 1 point par carte retournée
                      </div>
                    </div>
                    <Link href="/games/mode">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">JOUER MAINTENANT</Button>
                    </Link>
                  </CardContent>
                </Card>

                <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
                  <div className="h-56 relative">
                    <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: 'url(/images/games/cards/jackpot-cards.png)' }}>
                      <div className="absolute inset-0 bg-black bg-opacity-40"></div>
                      <span className="absolute top-2 left-2 bg-yellow-600 text-white text-xs px-2 py-1 rounded">LOTS EXCEPTIONNELS</span>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <h3 className="text-xl font-bold text-white drop-shadow-lg">Jackpot Cards</h3>
                    </div>
                  </div>
                  <CardContent className="pt-4">
                    <p className="text-gray-400 mb-4">Tentez votre chance pour gagner des lots exceptionnels : voitures, voyages, électronique haut de gamme!</p>
                    <div className="space-y-2 mb-4">
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Lots de grande valeur
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> Prix exceptionnels garantis
                      </div>
                      <div className="flex items-center text-sm text-gray-400">
                        <span className="text-green-500 mr-2">✓</span> 1 point par carte retournée
                      </div>
                    </div>
                    <Link href="/games/jackpot">
                      <Button className="w-full bg-red-600 hover:bg-red-700 text-white">JOUER MAINTENANT</Button>
                    </Link>
                  </CardContent>
                </Card>
              </div>
            </div>

            {/* Parties récentes */}
            <div>
              <h2 className="text-xl font-bold text-white mb-4">Parties récentes</h2>
              {isLoading ? (
                <div className="text-center py-10">
                  <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto"></div>
                  <p className="mt-4 text-gray-400">Chargement des données...</p>
                </div>
              ) : recentGames.length > 0 ? (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr>
                        <th className="py-2 px-4 text-left">Date</th>
                        <th className="py-2 px-4 text-left">Type</th>
                        <th className="py-2 px-4 text-left">Points</th>
                        <th className="py-2 px-4 text-left">Résultat</th>
                        <th className="py-2 px-4 text-left">Paires</th>
                      </tr>
                    </thead>
                    <tbody>
                      {recentGames.map((game) => (
                        <tr key={game.id} className="border-b border-zinc-800">
                          <td className="py-2 px-4">{game.createdAt ? formatDate(game.createdAt) : '-'}</td>
                          <td className="py-2 px-4 capitalize">{game.type}</td>
                          <td className="py-2 px-4">{game.points} points</td>
                          <td className="py-2 px-4">
                            <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${game.hasWon ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'}`}>
                              {game.hasWon ? 'Gagné' : 'Perdu'}
                            </span>
                          </td>
                          <td className="py-2 px-4">
                            {game.matchedPairs ? (
                              <span className="text-blue-500 font-bold">{game.matchedPairs} paires</span>
                            ) : (
                              '-'
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="text-center py-10 bg-zinc-800 rounded-lg border border-zinc-700">
                  <p className="text-gray-400">Vous n'avez pas encore joué. Essayez un de nos jeux!</p>
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        {/* Section des transactions */}
        <TabsContent value="transactions">
          <div className="space-y-8">
            <div className="flex justify-between items-center">
              <h2 className="text-xl font-bold text-white">Historique des transactions</h2>
              <Button variant="outline">Effectuer un retrait</Button>
            </div>

            {isLoading ? (
              <div className="text-center py-10">
                <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-white mx-auto"></div>
                <p className="mt-4 text-gray-400">Chargement des données...</p>
              </div>
            ) : transactions.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr>
                      <th className="py-2 px-4 text-left">Date</th>
                      <th className="py-2 px-4 text-left">Type</th>
                      <th className="py-2 px-4 text-left">Montant</th>
                      <th className="py-2 px-4 text-left">État</th>
                      <th className="py-2 px-4 text-left">Détails</th>
                    </tr>
                  </thead>
                  <tbody>
                    {transactions.map((tx) => (
                      <tr key={tx.id} className="border-b border-zinc-800">
                        <td className="py-2 px-4">{tx.createdAt ? formatDate(tx.createdAt) : '-'}</td>
                        <td className="py-2 px-4">{getTransactionLabel(tx.type || '')}</td>
                        <td className={`py-2 px-4 font-bold ${(tx.type === 'WIN' || tx.type === 'DEPOSIT' || tx.type === 'REFUND') ? 'text-green-500' : 'text-red-500'}`}>
                          {(tx.type === 'WIN' || tx.type === 'DEPOSIT' || tx.type === 'REFUND') ? '+' : ''}{tx.amount} {tx.currency}
                        </td>
                        <td className="py-2 px-4">
                          <span className={`inline-block px-2 py-1 rounded text-xs font-medium ${tx.status === 'COMPLETED' ? 'bg-green-900 text-green-200' : tx.status === 'PENDING' ? 'bg-yellow-900 text-yellow-200' : 'bg-red-900 text-red-200'}`}>
                            {getStatusLabel(tx.status || '')}
                          </span>
                        </td>
                        <td className="py-2 px-4 text-gray-400">-</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-10 bg-zinc-800 rounded-lg border border-zinc-700">
                <p className="text-gray-400">Aucune transaction à afficher</p>
              </div>
            )}
          </div>
        </TabsContent>

        {/* Section des paramètres */}
        <TabsContent value="settings">
          <div className="space-y-8">
            <h2 className="text-xl font-bold text-white mb-4">Paramètres du compte</h2>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Informations personnelles</CardTitle>
                <CardDescription>Vos informations de base</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Prénom</label>
                    <div className="p-2 bg-zinc-700 rounded text-white">{user.firstName}</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Nom</label>
                    <div className="p-2 bg-zinc-700 rounded text-white">{user.lastName}</div>
                  </div>
                </div>
                <div>
                  <label className="text-sm text-gray-400 block mb-1">Email</label>
                  <div className="p-2 bg-zinc-700 rounded text-white">{user.email}</div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Modifier mes informations</Button>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Limites de jeu</CardTitle>
                <CardDescription>Définissez vos limites pour jouer de manière responsable</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Limite quotidienne</label>
                    <div className="p-2 bg-zinc-700 rounded text-white">50 CHF</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Limite hebdomadaire</label>
                    <div className="p-2 bg-zinc-700 rounded text-white">200 CHF</div>
                  </div>
                  <div>
                    <label className="text-sm text-gray-400 block mb-1">Limite mensuelle</label>
                    <div className="p-2 bg-zinc-700 rounded text-white">500 CHF</div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button variant="outline">Modifier mes limites</Button>
              </CardFooter>
            </Card>

            <Card className="bg-zinc-800 border-zinc-700">
              <CardHeader>
                <CardTitle className="text-white">Sécurité</CardTitle>
                <CardDescription>Options de sécurité pour votre compte</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Authentification à deux facteurs</h3>
                    <p className="text-gray-400 text-sm">Protégez votre compte avec une couche de sécurité supplémentaire</p>
                  </div>
                  <div>
                    <Button variant="outline">Activer</Button>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-white font-medium">Changer le mot de passe</h3>
                    <p className="text-gray-400 text-sm">Mettre à jour votre mot de passe régulièrement renforce la sécurité</p>
                  </div>
                  <div>
                    <Button variant="outline">Modifier</Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
};
