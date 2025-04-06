import { useEffect, useState, useCallback, useMemo } from 'react';
import { useUser } from '@/hooks/useUser';
import { useGlobalBalance } from '@/hooks/use-global-balance';
import { FlipCard } from './flip-card';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "@/components/ui/use-toast";
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { PrizeVerification } from '@/utils/prize-verification';
import type { GameType, GameResult } from '@/types/game';
import { gameService, transactionService } from '@/lib/db-service';

// Images des cartes (verso)
const cardBackImages = [
  '/cards/back-1.jpg',
  '/cards/back-2.jpg',
  '/cards/back-3.jpg'
];

export const gameTypes = {
  classic: {
    name: 'Classic',
    minBet: 5,
    maxPrize: 500,
    cardCount: 9,
    description: 'Le jeu classique avec des prix jusqu\'à 500€'
  },
  magic: {
    name: 'Magic',
    minBet: 10,
    maxPrize: 1000,
    cardCount: 12,
    description: 'Le jeu magique avec des prix jusqu\'à 1000€'
  },
  gold: {
    name: 'Gold',
    minBet: 20,
    maxPrize: 5000,
    cardCount: 16,
    description: 'Le jeu premium avec des prix jusqu\'à 5000€'
  },
  foods: {
    name: 'Foods',
    minBet: 5,
    maxPrize: 500,
    cardCount: 9,
    description: 'Gagnez des kits alimentaires ou leur équivalent'
  },
  mode: {
    name: 'Mode',
    minBet: 10,
    maxPrize: 1000,
    cardCount: 12,
    description: 'Remportez des vêtements tendance'
  },
  jackpot: {
    name: 'Jackpot',
    minBet: 20,
    maxPrize: 5000,
    cardCount: 16,
    description: 'Tentez de gagner le jackpot'
  }
} as const;

type GameTypeKey = keyof typeof gameTypes;

interface GameSession {
  id: string;
  userId: string;
  type: GameType;
  points: number;
  hasWon: boolean;
  matchedPairs: number;
  createdAt: Date;
  updatedAt: Date;
}

interface Prize {
  value: number;
}

interface Card {
  id: string;
  image: string;
  isFlipped: boolean;
  isWinning: boolean;
  prize: Prize | null;
}

export function CardGame() {
  const { user } = useUser();
  const { coins, updateCoins, fetchBalance, syncBalance } = useGlobalBalance();
  
  const [gameType, setGameType] = useState<GameTypeKey>('classic');
  const [betAmount, setBetAmount] = useState(5);
  const [useCoins, setUseCoins] = useState(true);
  const [isPlaying, setIsPlaying] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [flippedCount, setFlippedCount] = useState(0);
  const [gameResult, setGameResult] = useState<GameResult | null>(null);
  const [gameSession, setGameSession] = useState<GameSession | null>(null);

  // Charger le solde au montage du composant
  useEffect(() => {
    if (user?.id) {
      fetchBalance(user.id);
      
      // Synchroniser le solde toutes les 5 secondes
      const interval = setInterval(() => {
        syncBalance();
      }, 5000);
      
      return () => clearInterval(interval);
    }
  }, [user?.id, fetchBalance, syncBalance]);

  const gameConfig = gameTypes[gameType];
  const playerBalance = coins;

  // Déplacer l'initialisation de PrizeVerification dans un useMemo
  const prizeVerification = useMemo(() => new PrizeVerification(gameConfig.maxPrize), [gameConfig.maxPrize]);

  const initializeGame = useCallback(async () => {
    const winningCardCount = Math.floor(Math.random() * 3) + 1;
    const cardCount = gameConfig.cardCount;
    const winningIndices = new Set<number>();
    
    // Sélectionner les cartes gagnantes
    while (winningIndices.size < winningCardCount) {
      winningIndices.add(Math.floor(Math.random() * cardCount));
    }

    // Générer les cartes
    const prizes = prizeVerification.generatePrizes(winningCardCount, betAmount);
    let prizeIndex = 0;

    const newCards = Array.from({ length: cardCount }, (_, index) => {
      const isWinning = winningIndices.has(index);
      const prize = isWinning ? { value: prizes[prizeIndex++] } : null;

      return {
        id: index.toString(),
        image: cardBackImages[Math.floor(Math.random() * cardBackImages.length)],
        isFlipped: false,
        isWinning,
        prize
      };
    });

    setCards(newCards);
    setFlippedCount(0);
    setGameResult(null);
  }, [gameConfig.cardCount, prizeVerification, betAmount]);

  const handleStartGame = async () => {
    if (!user) {
      toast({
        title: "Erreur",
        description: "Vous devez être connecté pour jouer",
        variant: "destructive"
      });
      return;
    }

    try {
      // Vérifier le solde
      if (coins < betAmount) {
        toast({
          title: "Erreur",
          description: "Solde insuffisant",
          variant: "destructive"
        });
        return;
      }

      // Créer la transaction BET
      const betTransaction = await transactionService.createTransaction(
        user.id,
        'BET',
        betAmount,
        useCoins
      );
      if (!betTransaction) throw new Error("Impossible de créer la transaction");

      // Démarrer la session de jeu
      const newSession = await gameService.createGameSession(
        user.id,
        gameType.toUpperCase() as GameType,
        betAmount,
        useCoins
      );
      if (!newSession) throw new Error("Impossible de démarrer la session");

      await transactionService.updateTransactionStatus(betTransaction.id, 'COMPLETED');
      await updateCoins(-betAmount); // Déduire les points du solde
      
      setIsPlaying(true);
      setGameSession({
        id: newSession.id,
        userId: newSession.userId,
        type: newSession.type,
        points: betAmount,
        hasWon: false,
        matchedPairs: 0,
        createdAt: new Date(newSession.createdAt),
        updatedAt: new Date(newSession.updatedAt)
      });
      initializeGame();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la partie",
        variant: "destructive"
      });
    }
  };

  const handleCardFlip = async (cardId: string) => {
    if (!isPlaying || !user || !gameSession) return;

    const cardIndex = parseInt(cardId, 10);
    const card = cards[cardIndex];
    
    try {
      const isWinning = card.prize !== null;
      const prize = card.prize?.value || null;
      
      // Enregistrer le retournement de carte
      await gameService.flipCard(gameSession.id, cardIndex, isWinning, prize);

      const updatedCards = [...cards];
      updatedCards[cardIndex].isFlipped = true;
      setCards(updatedCards);

      if (isWinning && prize) {
        // Créer la transaction WIN
        const winTransaction = await transactionService.createTransaction(
          user.id,
          'WIN',
          prize,
          useCoins
        );

        if (winTransaction) {
          await transactionService.updateTransactionStatus(winTransaction.id, 'COMPLETED');
          await updateCoins(prize); // Ajouter les points gagnés au solde
        }

        await gameService.completeGameSession(gameSession.id, true, prize);
        setGameResult({ won: true, prize });
        setIsPlaying(false);
        toast({
          title: "Félicitations !",
          description: `Vous avez gagné ${prize} ${useCoins ? 'coins' : '€'} !`
        });
      } else {
        const revealedCount = updatedCards.filter(c => c.isFlipped).length;
        if (revealedCount >= 3) {
          await gameService.completeGameSession(gameSession.id, false, null);
          setGameResult({ won: false });
          setIsPlaying(false);
          toast({
            title: "Perdu !",
            description: "Vous n'avez pas trouvé de carte gagnante",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de retourner la carte",
        variant: "destructive"
      });
    }
  };

  return (
    <div className="p-4 md:p-6 bg-zinc-900 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Entête du jeu */}
        <div className="mb-6 flex flex-col md:flex-row justify-between items-start md:items-center">
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{gameConfig.name}</h1>
            <p className="text-gray-400">{gameConfig.description}</p>
          </div>
          <div className="mt-4 md:mt-0">
            <Link href="/games">
              <Button variant="outline" className="mr-2">Retour aux jeux</Button>
            </Link>
            <Button
              className="casino-button"
              onClick={handleStartGame}
              disabled={!user || coins < betAmount}
            >
              Nouvelle partie
            </Button>
          </div>
        </div>

        {/* Info panel avec les stats */}
        <div className="game-info-panel grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Mise</h3>
            <div className="flex items-center">
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBetAmount(Math.max(gameConfig.minBet, betAmount - 5))}
                disabled={!user || betAmount <= gameConfig.minBet}
              >-</Button>
              <Badge variant="outline" className="mx-2">{betAmount} {useCoins ? 'coins' : '€'}</Badge>
              <Button
                size="sm"
                variant="outline"
                onClick={() => setBetAmount(Math.min(coins, betAmount + 5))}
                disabled={!user || betAmount >= coins}
              >+</Button>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-semibold text-white mb-2">Votre solde</h3>
            <div className="text-xl font-bold text-yellow-500">{coins} {useCoins ? 'coins' : '€'}</div>
          </div>

          {gameResult && (
            <div className="prize-display col-span-1 md:col-span-1">
              <h3 className="text-lg font-semibold text-white mb-2">Résultat</h3>
              <div className="flex items-center justify-between">
                <div className="text-xl font-bold text-yellow-300">
                  {gameResult.won 
                    ? `Vous avez gagné ${gameResult.prize} ${useCoins ? 'coins' : '€'}` 
                    : 'Vous avez perdu'}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Grille de cartes */}
        <div className="my-8">
          <div className="game-grid-cards">
            {cards.map(card => (
              <div key={card.id} className="game-card-container">
                <FlipCard
                  id={card.id}
                  frontImage={card.image}
                  backImage={card.prize?.value ? '/prizes/default.jpg' : card.image}
                  isWinning={card.isWinning}
                  prize={card.prize || undefined}
                  isFlipped={card.isFlipped}
                  onFlip={handleCardFlip}
                />
              </div>
            ))}
          </div>
        </div>

        {/* Section Tableau de bord */}
        <div className="mt-8">
          <Tabs defaultValue="history">
            <TabsList className="mb-4">
              <TabsTrigger value="history">Historique</TabsTrigger>
              <TabsTrigger value="stats">Statistiques</TabsTrigger>
              <TabsTrigger value="rules">Règles</TabsTrigger>
            </TabsList>

            <TabsContent value="history" className="dashboard-stats">
              <h3 className="text-lg font-semibold text-white mb-4">Historique des parties</h3>
              {/* TODO: Afficher l'historique des parties */}
            </TabsContent>

            <TabsContent value="stats" className="dashboard-stats">
              <h3 className="text-lg font-semibold text-white mb-4">Vos statistiques</h3>
              {/* TODO: Afficher les statistiques */}
            </TabsContent>

            <TabsContent value="rules" className="dashboard-stats">
              <h3 className="text-lg font-semibold text-white mb-4">Règles du jeu</h3>
              <div className="space-y-3">
                <p className="text-gray-300">1. Misez le montant de votre choix (minimum {gameConfig.minBet} {useCoins ? 'coins' : '€'}). </p>
                <p className="text-gray-300">2. Retournez les cartes une par une pour trouver le prix caché.</p>
                <p className="text-gray-300">3. Si vous trouvez la carte gagnante dans vos 3 premiers essais, vous remportez le prix indiqué.</p>
                <p className="text-gray-300">4. Après avoir gagné, vous pouvez réclamer votre prix qui sera immédiatement ajouté à votre solde.</p>
                <p className="text-gray-300">5. Jouez de manière responsable et fixez-vous des limites.</p>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
}
