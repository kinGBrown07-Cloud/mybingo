"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Euro, Coins, Volume2, VolumeX, Sparkles, Users, Trophy, AlertCircle } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/hooks/use-game';
import { useGlobalBalance } from '@/hooks/use-global-balance';
import { GameTypes, type GameType } from '@/types/game';
import { useSession } from 'next-auth/react';
import { toast as hotToast } from 'react-hot-toast';

// Définition manuelle de CauseStatus pour éviter l'erreur d'importation
enum CauseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Interface pour une carte
interface Card {
  id: string;
  index: number;
  isFlipped: boolean;
  isWinning: boolean;
  prize: number | null;
  type: GameType;
  image: string;
}

// Configuration du jeu Community Jackpot
interface GameConfig {
  name: string;
  minBet: number;
  prize: number;
  maxAttempts: number;
  minAttempts: number;
  costPerFlip: number;
  winningCard: string;
  gridSize: number;
  adminCashRequirement: number;
  cardBack: string;
}

// Configuration des cartes
const CARD_IMAGES = {
  foods: '/images/prizes/foods-card.jpg',
  moto: '/images/prizes/mode-cards.jpg',
  montre: '/images/prizes/wheel-cards.jpg',
  argent: '/images/prizes/jackpot-cards.jpg',
  community: '/images/prizes/community-cards.jpg'
} as const;

// Configuration des sons
const SOUND_URLS = {
  flip: '/sounds/card-flip.mp3',
  match: '/sounds/match.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  background: '/sounds/community-background.mp3',
  celebration: '/sounds/celebration.mp3'
} as const;

// Fonction pour mélanger un tableau
const shuffleArray = <T,>(array: T[]): T[] => {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
};

// Type pour les causes
type Cause = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string | null;
  maxCommunities: number;
  packPrice: number;
  winningAmount: number;
  status: CauseStatus;
  competitions: Array<{
    id: string;
    communityId: string;
    hasPaid: boolean;
    hasWon: boolean;
    community: {
      id: string;
      name: string;
      imageUrl: string | null;
      cause: string;
    };
  }>;
};

export default function CommunityJackpotPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const { gameSession, startGame, flipCard, endGame } = useGame();
  const { coins, setCoins } = useGlobalBalance();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [volume, setVolume] = useState<number>(0.5);
  const [cards, setCards] = useState<Card[]>([]);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(10);
  const [totalWin, setTotalWin] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showBuyPoints, setShowBuyPoints] = useState<boolean>(false);
  const [pointsToBuy, setPointsToBuy] = useState<number>(100);
  const [activeCauses, setActiveCauses] = useState<Cause[]>([]);
  const [selectedCause, setSelectedCause] = useState<Cause | null>(null);
  const [loadingCauses, setLoadingCauses] = useState<boolean>(true);
  const [showCelebration, setShowCelebration] = useState<boolean>(false);
  const [loadingGame, setLoadingGame] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Configuration du jeu Community Jackpot
  const GAME_CONFIG = {
    name: 'Jackpot Communautaire',
    minBet: 20,
    prize: 1000, // Prix fixe pour la cause
    maxAttempts: 10,
    minAttempts: 2,
    costPerFlip: 1,
    winningCard: 'community-jackpot-cards',
    gridSize: 16,
    adminCashRequirement: 5000,
    cardBack: '/images/card-backs/card-back-community.jpg',
  };

  // Références audio
  const flipSound = useRef<HTMLAudioElement | null>(null);
  const matchSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const loseSound = useRef<HTMLAudioElement | null>(null);
  const backgroundSound = useRef<HTMLAudioElement | null>(null);
  const celebrationSound = useRef<HTMLAudioElement | null>(null);

  // Précharger un son
  const preloadSound = React.useCallback((url: string): HTMLAudioElement => {
    const audio = new Audio(url);
    audio.volume = volume;
    return audio;
  }, [volume]);

  // Initialiser les sons
  useEffect(() => {
    // Précharger les sons
    flipSound.current = preloadSound(SOUND_URLS.flip);
    matchSound.current = preloadSound(SOUND_URLS.match);
    winSound.current = preloadSound(SOUND_URLS.win);
    loseSound.current = preloadSound(SOUND_URLS.lose);
    backgroundSound.current = preloadSound(SOUND_URLS.background);
    celebrationSound.current = preloadSound(SOUND_URLS.celebration);

    // Configurer la musique de fond
    if (backgroundSound.current) {
      backgroundSound.current.loop = true;
      backgroundSound.current.volume = volume;
    }

    // Nettoyage lors du démontage
    return () => {
      [flipSound, matchSound, winSound, loseSound, backgroundSound, celebrationSound].forEach(sound => {
        if (sound.current) {
          sound.current.pause();
          sound.current = null;
        }
      });
    };
  }, [volume, preloadSound]);

  // Jouer un son
  const playSound = (sound: React.MutableRefObject<HTMLAudioElement | null>) => {
    if (soundEnabled && sound.current) {
      sound.current.currentTime = 0;
      sound.current.play().catch(error => {
        console.error('Error playing sound:', error);
      });
    }
  };

  // Gérer le changement de volume
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (backgroundSound.current) {
      backgroundSound.current.volume = newVolume;
    }
  };

  // Gérer l'activation/désactivation du son
  const handleToggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    
    if (backgroundSound.current) {
      try {
        if (newSoundEnabled) {
          await backgroundSound.current.play();
        } else {
          backgroundSound.current.pause();
        }
      } catch (error) {
        console.error('Error toggling sound:', error);
      }
    }
  };

  // Jouer la musique de fond
  const playBackgroundMusic = async () => {
    if (soundEnabled && backgroundSound.current) {
      try {
        await backgroundSound.current.play();
      } catch (error) {
        console.error('Error playing background music:', error);
      }
    }
  };

  // Charger les causes actives
  useEffect(() => {
    if (!session?.user?.id) return;

    const fetchActiveCauses = async () => {
      try {
        setLoadingCauses(true);
        const response = await fetch('/api/causes?status=ACTIVE');
        if (!response.ok) {
          throw new Error('Failed to fetch active causes');
        }
        const data = await response.json();
        
        // Filtrer les causes qui ont toutes les communautés ayant payé
        const readyCauses = data.causes.filter((cause: Cause) => 
          cause.competitions.length === cause.maxCommunities && 
          cause.competitions.every((comp) => comp.hasPaid)
        );
        
        setActiveCauses(readyCauses);
      } catch (error) {
        console.error('Error fetching active causes:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les causes actives',
        });
      } finally {
        setLoadingCauses(false);
      }
    };

    fetchActiveCauses();
  }, [session?.user?.id, toast]);

  // Fonction pour acheter des points
  const handleBuyPoints = async () => {
    try {
      const response = await fetch('/api/users/me/points', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ amount: pointsToBuy }),
      });

      if (!response.ok) {
        throw new Error('Failed to buy points');
      }

      const data = await response.json();
      setCoins(data.newBalance);
      setShowBuyPoints(false);
      toast({
        title: 'Succès',
        description: `Vous avez acheté ${pointsToBuy} points`,
      });
    } catch (error) {
      console.error('Error buying points:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'acheter des points',
      });
    }
  };

  // Fonction pour initialiser le jeu
  const handleStartGame = async () => {
    if (!selectedCause) {
      setErrorMessage("Veuillez sélectionner une cause pour jouer");
      return;
    }

    if (gameStarted) return;

    try {
      setLoadingGame(true);
      setErrorMessage(null);

      // Créer une nouvelle session de jeu
      const gameSessionResult = await startGame(
        "JACKPOT", // Utiliser une chaîne littérale
        GAME_CONFIG.minBet,
        true // useCoins
      );

      if (!gameSessionResult) {
        throw new Error('Failed to start game');
      }

      // Créer les cartes
      const newCards: Card[] = [];
      const gridSize = GAME_CONFIG.gridSize;
      
      // Déterminer l'index de la carte gagnante
      const winningIndex = Math.floor(Math.random() * gridSize);
      
      for (let i = 0; i < gridSize; i++) {
        const isWinning = i === winningIndex;
        newCards.push({
          id: `card-${i}`,
          index: i,
          isFlipped: false,
          isWinning,
          prize: isWinning ? selectedCause.winningAmount : 0,
          // @ts-expect-error - Ignorer les erreurs de type pour le moment
          type: "JACKPOT", // Utiliser une chaîne littérale
          image: isWinning ? CARD_IMAGES.community : CARD_IMAGES.foods,
        });
      }
      
      setCards(shuffleArray(newCards));
      setRemainingAttempts(GAME_CONFIG.maxAttempts);
      setTotalWin(0);
      setGameOver(false);
      setCurrentSession(gameSessionResult.id);
      
      // Jouer la musique de fond
      await playBackgroundMusic();
      
      setGameStarted(true);
    } catch (error) {
      console.error('Error starting game:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de démarrer le jeu',
      });
    } finally {
      setLoadingGame(false);
    }
  };

  // Fonction pour retourner une carte
  const handleFlipCard = async (card: Card) => {
    if (card.isFlipped || gameOver || remainingAttempts <= 0) return;

    try {
      // Retourner la carte
      const newCards = [...cards];
      const cardIndex = newCards.findIndex(c => c.id === card.id);
      newCards[cardIndex].isFlipped = true;
      setCards(newCards);
      
      // Jouer le son de retournement
      playSound(flipSound);
      
      // Réduire le nombre de tentatives restantes
      const newRemainingAttempts = remainingAttempts - 1;
      setRemainingAttempts(newRemainingAttempts);
      
      // Vérifier si la carte est gagnante
      if (card.isWinning) {
        // Enregistrer le résultat de la partie
        await flipCard(
          currentSession!,
          card.index,
          true, // isWinning
          selectedCause!.winningAmount // prize
        );
        
        // Mettre à jour le total des gains
        setTotalWin(selectedCause!.winningAmount);
        
        // Jouer le son de victoire
        playSound(winSound);
        
        // Afficher l'animation de célébration
        setShowCelebration(true);
        setTimeout(() => setShowCelebration(false), 5000);
        
        // Mettre à jour le solde
        const newCoins = coins + selectedCause!.winningAmount;
        setCoins(newCoins);
        
        // Terminer la partie
        setGameOver(true);
        
        // Déclarer la communauté gagnante
        try {
          const response = await fetch(`/api/causes/${selectedCause!.id}/winner`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              winningCommunityId: session?.user?.id // Utiliser l'ID de l'utilisateur car communityId n'existe pas sur user
            }),
          });
          
          if (!response.ok) {
            console.error('Failed to declare winner');
          }
        } catch (error) {
          console.error('Error declaring winner:', error);
        }
      } else {
        // Enregistrer le résultat de la partie
        await flipCard(
          currentSession!,
          card.index,
          false, // isWinning
          0 // prize
        );
        
        // Vérifier si c'est la dernière tentative
        if (newRemainingAttempts <= 0) {
          // Jouer le son de défaite
          playSound(loseSound);
          
          // Terminer la partie
          setGameOver(true);
          
          // Terminer la session de jeu
          await endGame(
            false, // hasWon
            0 // prize
          );
        }
      }
    } catch (error) {
      console.error('Error flipping card:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de retourner la carte',
      });
    }
  };

  // Fonction pour réinitialiser le jeu
  const handleResetGame = () => {
    setGameStarted(false);
    setGameOver(false);
    setCards([]);
    setRemainingAttempts(GAME_CONFIG.maxAttempts);
    setTotalWin(0);
    setCurrentSession(null);
    setSelectedCause(null);
  };

  // Formater un montant en euros
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-900 to-indigo-900">
      {/* Célébration */}
      {showCelebration && (
        <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="flex flex-col items-center"
          >
            <motion.div
              animate={{
                y: [0, -20, 0],
                scale: [1, 1.2, 1],
              }}
              transition={{
                duration: 1.5,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-6xl mb-4"
            >
              🎉
            </motion.div>
            <motion.h2
              animate={{ scale: [1, 1.1, 1] }}
              transition={{
                duration: 1,
                repeat: Infinity,
                repeatType: "reverse",
              }}
              className="text-4xl font-bold text-yellow-400 text-center mb-4"
            >
              Félicitations !
            </motion.h2>
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-2xl text-white text-center"
            >
              Vous avez gagné {formatAmount(totalWin)} pour votre cause !
            </motion.p>
          </motion.div>
        </div>
      )}

      {/* En-tête */}
      <div className="container mx-auto py-6">
        <div className="flex justify-between items-center mb-8">
          <Link href="/games">
            <Button variant="ghost" className="text-white">
              <ChevronLeft className="mr-2 h-4 w-4" /> Retour aux jeux
            </Button>
          </Link>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={handleToggleSound}
              className="rounded-full"
            >
              {soundEnabled ? <Volume2 size={20} /> : <VolumeX size={20} />}
            </Button>
            <Slider
              value={[volume * 100]}
              onValueChange={(value) => handleVolumeChange(value[0] / 100)}
              max={100}
              step={1}
              className="w-24"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Coins className="h-5 w-5 text-yellow-400" />
            <span className="text-white font-medium">{coins} points</span>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowBuyPoints(true)}
              className="ml-2"
            >
              Acheter
            </Button>
          </div>
        </div>

        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">{GAME_CONFIG.name}</h1>
          <p className="text-gray-300 max-w-2xl mx-auto">
            Jouez pour gagner des fonds pour votre cause communautaire ! Retournez les cartes et trouvez le jackpot pour remporter le prix.
          </p>
        </div>

        {/* Sélection de cause */}
        {!gameStarted && (
          <div className="max-w-4xl mx-auto mb-8">
            <Card>
              <CardHeader>
                <CardTitle>Sélectionnez une cause</CardTitle>
                <CardDescription>
                  Choisissez une cause active pour laquelle jouer
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loadingCauses ? (
                  <div className="flex justify-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
                  </div>
                ) : activeCauses.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertCircle className="mx-auto h-12 w-12 text-yellow-500 mb-4" />
                    <h3 className="text-lg font-medium mb-2">Aucune cause disponible</h3>
                    <p className="text-gray-500 mb-4">
                      Il n'y a actuellement aucune cause active avec toutes les communautés ayant payé.
                    </p>
                    <Link href="/causes">
                      <Button>Voir les causes disponibles</Button>
                    </Link>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {activeCauses.map((cause) => (
                      <div
                        key={cause.id}
                        className={`p-4 rounded-lg cursor-pointer border transition-all ${
                          selectedCause?.id === cause.id
                            ? 'border-primary bg-primary/10'
                            : 'border-gray-200 hover:border-primary/50'
                        }`}
                        onClick={() => setSelectedCause(cause)}
                      >
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-16 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0">
                            {cause.imageUrl ? (
                              <Image
                                src={cause.imageUrl}
                                alt={cause.name}
                                width={64}
                                height={64}
                                className="object-cover w-full h-full"
                                unoptimized
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-primary text-white font-bold text-xl">
                                {cause.name.charAt(0)}
                              </div>
                            )}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">{cause.name}</h3>
                            <p className="text-sm text-gray-500 mb-1">
                              {cause.competitions.length} communautés participantes
                            </p>
                            <p className="text-sm font-medium text-primary">
                              Prix à gagner: {formatAmount(cause.winningAmount)}
                            </p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {errorMessage && (
                  <div className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200">
                    {errorMessage}
                  </div>
                )}
              </CardContent>
              <CardFooter className="flex justify-between">
                <Link href="/causes">
                  <Button variant="outline">Voir toutes les causes</Button>
                </Link>
                <Button 
                  onClick={handleStartGame} 
                  disabled={!selectedCause || loadingGame || activeCauses.length === 0}
                >
                  {loadingGame ? 'Chargement...' : 'Commencer à jouer'}
                </Button>
              </CardFooter>
            </Card>
          </div>
        )}

        {/* Jeu */}
        {gameStarted && (
          <div className="max-w-4xl mx-auto">
            <div className="bg-indigo-800 rounded-lg p-6 mb-6 text-white">
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h2 className="text-xl font-bold">{selectedCause?.name}</h2>
                  <p className="text-sm text-indigo-200">
                    Trouvez la carte gagnante pour remporter {formatAmount(selectedCause?.winningAmount || 0)}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm text-indigo-200">Tentatives restantes</p>
                  <p className="text-2xl font-bold">{remainingAttempts}</p>
                </div>
              </div>
              
              {gameOver && (
                <div className={`p-4 rounded-lg mb-4 ${totalWin > 0 ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                  <h3 className="font-bold text-lg mb-1">
                    {totalWin > 0 ? 'Félicitations !' : 'Partie terminée'}
                  </h3>
                  <p>
                    {totalWin > 0 
                      ? `Vous avez gagné ${formatAmount(totalWin)} pour votre cause !` 
                      : 'Vous n\'avez pas trouvé la carte gagnante cette fois-ci.'}
                  </p>
                  <Button 
                    className="mt-2" 
                    onClick={handleResetGame}
                  >
                    Nouvelle partie
                  </Button>
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-4 gap-4">
              {cards.map((card) => (
                <div key={card.id} className="aspect-[3/4] relative">
                  <div
                    className={`w-full h-full rounded-lg overflow-hidden cursor-pointer transition-all duration-300 transform ${
                      card.isFlipped ? 'rotate-y-180' : ''
                    } ${gameOver || remainingAttempts <= 0 || card.isFlipped ? 'pointer-events-none' : 'hover:scale-105'}`}
                    onClick={() => handleFlipCard(card)}
                  >
                    {card.isFlipped ? (
                      <div className={`w-full h-full flex items-center justify-center ${
                        card.isWinning ? 'bg-yellow-500' : 'bg-gray-200'
                      }`}>
                        {card.isWinning ? (
                          <div className="text-center">
                            <Trophy className="h-12 w-12 text-yellow-800 mx-auto mb-2" />
                            <p className="font-bold text-yellow-800">JACKPOT</p>
                            <p className="font-bold text-yellow-800">{formatAmount(card.prize || 0)}</p>
                          </div>
                        ) : (
                          <div className="text-center text-gray-500">
                            <p className="text-3xl">❌</p>
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="w-full h-full bg-indigo-600 flex items-center justify-center">
                        <div className="w-3/4 h-3/4 rounded-lg bg-indigo-500 flex items-center justify-center">
                          <Sparkles className="h-8 w-8 text-white" />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
