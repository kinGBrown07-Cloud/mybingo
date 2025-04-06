'use client';

import { useState, useEffect, useMemo } from 'react';
import { useSupabase } from '@/hooks/useSupabase';
import { useGame } from '@/hooks/useGame';
import { useTransactions } from '@/hooks/useTransactions';
import { Card, GAME_CONFIGS, GameConfig, GameType } from '@/types/game';
import { Button } from '@/components/ui/button';
import { Card as UICard } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { cn } from '@/lib/utils';
import { Label } from '@/components/ui/label';
import { toast } from '@/components/ui/use-toast';
import Image from 'next/image';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { Database } from '@/types/database';

interface Treasury {
  id: string;
  balance: number;
}

interface CardFlip {
  card_index: number;
  is_winning: boolean;
  prize: number | null;
}

export default function GameBoard() {
  // Prix fixes par type de jeu
  const FIXED_PRIZES = useMemo(() => ({
    foods: 100,
    mode: 200,
    jackpot: 3800
  } as const), []);

  const { user, profile } = useSupabase();
  const supabase = createClientComponentClient<Database>();
  const { gameSession, isLoading: isGameLoading, error: gameError, startGame, flipCard, endGame } = useGame(user?.id || '');
  const { profile: walletProfile, isLoading: isWalletLoading } = useTransactions(user?.id || '');

  // Déterminer le type de jeu actuel
  const currentGameType = useMemo(() => {
    const currentPath = window.location.pathname;
    return currentPath.includes('foods') ? 'CLASSIC' as const : 
           currentPath.includes('mode') ? 'MAGIC' as const : 'GOLD' as const;
  }, []);

  // État du jeu
  const [selectedGameType, setSelectedGameType] = useState<GameType>(currentGameType);
  const [selectedGame, setSelectedGame] = useState<GameConfig>(GAME_CONFIGS[currentGameType]);
  const [useCoins, setUseCoins] = useState(false);
  const [cards, setCards] = useState<Card[]>([]);
  const [canPlay, setCanPlay] = useState(false);
  const [cardFlips, setCardFlips] = useState<CardFlip[]>([]);
  const [isGameOver, setIsGameOver] = useState(false);
  const [hasWon, setHasWon] = useState(false);
  const [currentPrize, setCurrentPrize] = useState({ name: 'Prize', value: 0 });

  // Initialiser le jeu au chargement
  useEffect(() => {
    setSelectedGame(GAME_CONFIGS[selectedGameType]);
  }, [selectedGameType]);

  // Générer les cartes pour le jeu
  useEffect(() => {
    if (selectedGame) {
      // Fonction pour mélanger un tableau
      const shuffleArray = <T,>(array: T[]): T[] => {
        const newArray = [...array];
        for (let i = newArray.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
        }
        return newArray;
      };

      // Générer les cartes pour le jeu
      const generateCards = (gameType: GameType): Card[] => {
        const config = GAME_CONFIGS[gameType];
        const totalCards = config.gridSize;
        
        // Créer un tableau de cartes avec des images variées
        const cards: Card[] = [];
        
        // Ajouter les 2 cartes gagnantes
        cards.push(
          {
            index: 0,
            type: gameType,
            isFlipped: false,
            isWinning: true,
            prize: config.prize / 2,
            image: config.winningImage
          },
          {
            index: 1,
            type: gameType,
            isFlipped: false,
            isWinning: true,
            prize: config.prize / 2,
            image: config.winningImage
          }
        );
        
        // Ajouter les cartes restantes avec des images différentes
        const otherImages = ['foods-card', 'mode-card', 'jackpot-card'].filter(img => img !== config.winningImage);
        for (let i = 2; i < totalCards; i++) {
          const randomImage = otherImages[Math.floor(Math.random() * otherImages.length)];
          cards.push({
            index: i,
            type: gameType,
            isFlipped: false,
            isWinning: false,
            prize: 0,
            image: randomImage
          });
        }
        
        // Mélanger les cartes
        return shuffleArray(cards);
      };

      setCards(generateCards(selectedGame.type));
    }
  }, [selectedGame]);

  // Vérifier si l'utilisateur peut jouer
  useEffect(() => {
    if (!walletProfile) return;
    setCanPlay(true); // Plus besoin de vérifier la mise
  }, [walletProfile]);

  // Mettre à jour les cartes quand il y a un nouveau flip
  useEffect(() => {
    if (cardFlips.length > 0) {
      const newCards = [...cards];
      cardFlips.forEach(flip => {
        newCards[flip.card_index] = {
          ...newCards[flip.card_index],
          isFlipped: true,
          isWinning: flip.is_winning,
          prize: flip.prize
        } as Card;
      });
      setCards(newCards);
    }
  }, [cardFlips, cards]);

  const handleGameTypeChange = (type: GameType) => {
    setSelectedGameType(type);
  };

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
      await startGame(selectedGame.type, selectedGame.minBet, useCoins);
      setCardFlips([]);
      setIsGameOver(false);
      setHasWon(false);
      setCurrentPrize({ name: 'Prize', value: 0 });
      toast({
        title: "Partie démarrée",
        description: "Retournez les cartes pour tenter de gagner !",
      });
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de démarrer la partie",
        variant: "destructive"
      });
    }
  };

  const handleCardClick = async (cardIndex: number) => {
    if (!gameSession || isGameOver || cards[cardIndex].isFlipped) {
      return;
    }

    // Vérifier si on n'a pas dépassé le nombre maximum de cartes à retourner
    const flippedCount = cards.filter(card => card.isFlipped).length;
    if (flippedCount >= selectedGame.maxFlips) {
      setIsGameOver(true);
      return;
    }

    // Retourner la carte
    const updatedCards = [...cards];
    updatedCards[cardIndex].isFlipped = true;
    setCards(updatedCards);

    // Vérifier les cartes retournées
    const flippedCards = updatedCards.filter(card => card.isFlipped);
    const matchingWinningCards = flippedCards.filter(card => card.image === GAME_CONFIGS[selectedGame.type].winningImage);

    // Si on a trouvé 2 cartes gagnantes identiques
    if (matchingWinningCards.length === 2) {
      const prize = GAME_CONFIGS[selectedGame.type].prize;
      await endGame(true, prize);
      setIsGameOver(true);
      setHasWon(true);
      setCurrentPrize({ name: 'Prize', value: prize });
      toast({
        title: "Félicitations !",
        description: `Vous avez gagné ${prize} ${useCoins ? 'coins' : '€'}!`
      });
    }
    // Si on a atteint le nombre minimum de cartes sans gagner
    else if (flippedCards.length >= selectedGame.minFlips && !matchingWinningCards.length) {
      setIsGameOver(true);
      setHasWon(false);
      await endGame(false, 0);
      toast({
        title: "Pas de chance",
        description: "Essayez encore !",
      });
    }
  };

  if (!user || !profile) {
    return (
      <div className="flex items-center justify-center h-[600px]">
        <p className="text-lg">Connectez-vous pour jouer</p>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 space-y-8">
      {/* Contrôles du jeu */}
      <UICard className="p-6">
        <div className="flex justify-between items-center gap-4">
          <div className="space-y-2">
            <Label>Type de jeu</Label>
            <Select
              value={selectedGameType}
              onValueChange={handleGameTypeChange}
              disabled={!!gameSession}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.entries(GAME_CONFIGS) as [GameType, GameConfig][]).map(([key, config]) => (
                  <SelectItem key={key} value={key}>
                    {config.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Utiliser les coins</Label>
            <div className="flex items-center space-x-2">
              <Switch
                checked={useCoins}
                onCheckedChange={setUseCoins}
                disabled={!!gameSession}
              />
              <span className="text-sm text-muted-foreground">
                Solde: {useCoins ? `${walletProfile?.coins || 0} coins` : 'EUR'}
              </span>
            </div>
          </div>

          <div className="flex items-end">
            <Button
              onClick={handleStartGame}
              disabled={!!gameSession || !canPlay || isGameLoading}
              className="w-full"
            >
              {isGameLoading ? "Chargement..." : "Démarrer la partie"}
            </Button>
          </div>
        </div>
      </UICard>

      {/* Grille de jeu */}
      <div className={`grid gap-4 ${
        selectedGame.gridSize === 9 ? 'grid-cols-3' :
        selectedGame.gridSize === 16 ? 'grid-cols-4' :
        'grid-cols-5'
      }`}>
        {cards.map((card) => (
          <UICard
            key={card.index}
            className={`aspect-square cursor-pointer transition-all transform hover:scale-105 ${
              card.isFlipped
                ? card.isWinning
                  ? 'bg-green-100 dark:bg-green-900'
                  : 'bg-red-100 dark:bg-red-900'
                : 'bg-primary/5 hover:bg-primary/10'
            }`}
            onClick={() => handleCardClick(card.index)}
          >
            <div className="w-full h-full flex items-center justify-center">
              {card.isFlipped ? (
                <div className="text-center">
                  {card.isWinning ? (
                    <>
                      <Image
                        src={card.image}
                        alt={card.type}
                        width={200}
                        height={200}
                        className="w-full h-full object-cover"
                      />
                      <span className="absolute bottom-2 left-1/2 transform -translate-x-1/2 text-xl font-bold bg-black/50 text-white px-2 py-1 rounded">
                        {card.prize} {useCoins ? 'coins' : '€'}
                      </span>
                    </>
                  ) : (
                    <Image
                      src={card.image}
                      alt={card.type}
                      width={200}
                      height={200}
                      className="w-full h-full object-cover opacity-50"
                    />
                  )}
                </div>
              ) : (
                <span className="text-4xl">?</span>
              )}
            </div>
          </UICard>
        ))}
      </div>

      {/* Messages d'erreur */}
      {gameError && (
        <div className="text-red-500 mt-4">
          {gameError.message}
        </div>
      )}
    </div>
  );
}
