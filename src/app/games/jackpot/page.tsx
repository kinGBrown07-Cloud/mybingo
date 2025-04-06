"use client";

import React, { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { prisma } from '@/lib/prisma';
import { Button } from '@/components/ui/button';
import { ChevronLeft, Euro, Coins, Volume2, VolumeX, Sparkles } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { Card as CardComponent } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/components/ui/use-toast';
import { useGame } from '@/hooks/use-game';
import { useGlobalBalance } from '@/hooks/use-global-balance';
import { GameTypes, type GameType } from '@/types/game';

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

// Configuration du jeu Foods
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

// Configuration du jeu Jackpot
const GAME_CONFIG: GameConfig = {
  name: 'Jackpot Game',
  minBet: 20,
  prize: 500,
  maxAttempts: 10,
  minAttempts: 2,
  costPerFlip: 1,
  winningCard: 'jackpot-cards',
  gridSize: 16,
  adminCashRequirement: 5000,
  cardBack: '/images/card-backs/card-back-jackpot.jpg',
};

// Configuration des cartes
const CARD_IMAGES = {
  foods: '/images/prizes/foods-card.jpg',
  moto: '/images/prizes/mode-cards.jpg',
  montre: '/images/prizes/wheel-cards.jpg',
  argent: '/images/prizes/jackpot-cards.jpg'
} as const;

// Configuration des sons
const SOUND_URLS = {
  flip: '/sounds/card-flip.mp3',
  match: '/sounds/match.mp3',
  win: '/sounds/win.mp3',
  lose: '/sounds/lose.mp3',
  background: '/sounds/background.mp3'
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

export default function JackpotCardsPage() {
  const { toast } = useToast();
  const { gameSession, startGame, flipCard, endGame } = useGame();
  const { coins, setCoins } = useGlobalBalance();
  const [soundEnabled, setSoundEnabled] = useState<boolean>(true);
  const [winningEnabled, setWinningEnabled] = useState<boolean>(false);
  const [adminBalance, setAdminBalance] = useState<number>(0);
  const [volume, setVolume] = useState<number>(0.5);
  const [cards, setCards] = useState<Card[]>([]);
  const [bet, setBet] = useState<number>(GAME_CONFIG.minBet);
  const [gameStarted, setGameStarted] = useState<boolean>(false);
  const [remainingAttempts, setRemainingAttempts] = useState<number>(GAME_CONFIG.maxAttempts);
  const [totalWin, setTotalWin] = useState<number>(0);
  const [gameOver, setGameOver] = useState<boolean>(false);
  const [currentSession, setCurrentSession] = useState<string | null>(null);
  const [showBuyPoints, setShowBuyPoints] = useState<boolean>(false);
  const [pointsToBuy, setPointsToBuy] = useState<number>(100);

  // Fonction pour acheter des points
  const handleBuyPoints = async () => {
    try {
      setCoins(coins + pointsToBuy);
      toast({
        title: "Achat réussi !",
        description: `Vous avez acheté ${pointsToBuy} points.`,
      });
      setShowBuyPoints(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "L'achat a échoué. Veuillez réessayer.",
      });
    }
  };

  // Références audio
  const flipSound = useRef<HTMLAudioElement | null>(null);
  const matchSound = useRef<HTMLAudioElement | null>(null);
  const winSound = useRef<HTMLAudioElement | null>(null);
  const loseSound = useRef<HTMLAudioElement | null>(null);
  const backgroundMusic = useRef<HTMLAudioElement | null>(null);

  // Précharger un son
  const preloadSound = (url: string): HTMLAudioElement => {
    const audio = new Audio(url);
    audio.preload = 'auto';
    return audio;
  };

  // Initialisation des sons
  useEffect(() => {
    // Précharger tous les sons
    flipSound.current = preloadSound(SOUND_URLS.flip);
    matchSound.current = preloadSound(SOUND_URLS.match);
    winSound.current = preloadSound(SOUND_URLS.win);
    loseSound.current = preloadSound(SOUND_URLS.lose);
    backgroundMusic.current = preloadSound(SOUND_URLS.background);

    // Configurer la musique de fond
    if (backgroundMusic.current) {
      backgroundMusic.current.loop = true;
      backgroundMusic.current.volume = volume;
    }

    // Nettoyage lors du démontage
    return () => {
      [flipSound, matchSound, winSound, loseSound, backgroundMusic].forEach(sound => {
        if (sound.current) {
          sound.current.pause();
          sound.current = null;
        }
      });
    };
  }, [volume]);

  // Fonction générique pour jouer un son
  const playSound = async (sound: React.RefObject<HTMLAudioElement | null>) => {
    if (soundEnabled && sound.current) {
      try {
        sound.current.currentTime = 0;
        await sound.current.play();
      } catch (error) {
        console.error('Error playing sound:', error);
      }
    }
  };

  // Gérer le changement de volume
  const handleVolumeChange = (newVolume: number) => {
    setVolume(newVolume);
    if (backgroundMusic.current) {
      backgroundMusic.current.volume = newVolume;
    }
  };

  // Activer/désactiver le son
  const toggleSound = async () => {
    const newSoundEnabled = !soundEnabled;
    setSoundEnabled(newSoundEnabled);
    
    if (backgroundMusic.current) {
      try {
        if (newSoundEnabled) {
          await backgroundMusic.current.play();
        } else {
          backgroundMusic.current.pause();
        }
      } catch (error) {
        console.error('Error toggling sound:', error);
        toast({
          title: "Son désactivé",
          description: "Le navigateur a bloqué la lecture automatique du son.",
        });
      }
    }
  };

  // Initialiser le jeu
  const initializeGame = async () => {
    if (!coins || coins < bet) return;

    // Vérifier le solde admin pour activer/désactiver les gains
    try {
      const adminData = await prisma.profile.findFirst({
        where: {
          user: {
            role: 'ADMIN'
          }
        },
        select: {
          coins: true
        }
      });

      if (!adminData) {
        console.error('Aucun admin trouvé');
        setWinningEnabled(false);
      } else {
        setAdminBalance(adminData.coins);
        // Les gains sont possibles uniquement si l'admin a assez de fonds
        setWinningEnabled(adminData.coins >= GAME_CONFIG.prize * 3);
      }
    } catch (error) {
      console.error('Erreur lors de la vérification du solde admin:', error);
      setWinningEnabled(false);
    }

    // Démarrer une nouvelle partie
    const session = await startGame(GameTypes.GOLD, bet, false);
    if (!session) return;

    setCoins(coins - bet);
    setCurrentSession(session.id);

    // Créer les paires de cartes
    const allCardTypes = [
      { type: 'foods', image: CARD_IMAGES.foods },
      { type: 'moto', image: CARD_IMAGES.moto },
      { type: 'montre', image: CARD_IMAGES.montre },
      { type: 'argent', image: CARD_IMAGES.argent }
    ];

    const cardPairs: Card[] = [];

    // Ajouter deux cartes de chaque type (8 cartes)
    allCardTypes.forEach((cardType, index) => {
      // Les cartes gagnantes ne sont possibles que si winningEnabled est true
      const isWinningType = winningEnabled && cardType.type === 'moto';
      cardPairs.push(
        {
          id: String(index * 2),
          index: index * 2,
          type: GameTypes.GOLD,
          image: cardType.image,
          isFlipped: false,
          isWinning: isWinningType,
          prize: isWinningType ? GAME_CONFIG.prize : null
        },
        {
          id: String(index * 2 + 1),
          index: index * 2 + 1,
          type: GameTypes.GOLD,
          image: cardType.image,
          isFlipped: false,
          isWinning: isWinningType,
          prize: isWinningType ? GAME_CONFIG.prize : null
        }
      );
    });

    // Ajouter la 9ème carte (une carte aléatoire parmi les non-gagnantes)
    const nonWinningTypes = allCardTypes.filter(card => !winningEnabled || card.type !== 'moto');
    const randomType = nonWinningTypes[Math.floor(Math.random() * nonWinningTypes.length)];
    cardPairs.push({
      id: String(cardPairs.length),
      index: cardPairs.length,
      type: GameTypes.GOLD,
      image: randomType.image,
      isFlipped: false,
      isWinning: false,
      prize: null
    });

    // Mélanger les cartes
    const shuffledCards = [...cardPairs].sort(() => Math.random() - 0.5);

    setCards(shuffledCards);
    setGameStarted(true);
    setRemainingAttempts(3);
    setGameOver(false);
    setTotalWin(0);

    // Jouer la musique de fond
    if (backgroundMusic.current && soundEnabled) {
      backgroundMusic.current.play().catch(() => console.log('Autoplay prevented'));
    }
  };

  // Gérer le clic sur une carte
  const handleCardClick = async (clickedCard: Card) => {
    if (clickedCard.isFlipped || gameOver) return;

    // Jouer le son de retournement
    playSound(flipSound);

    // Retourner la carte
    const updatedCards = cards.map(card => 
      card.id === clickedCard.id
        ? { ...card, isFlipped: true }
        : card
    );

    setCards(updatedCards);
    
    // Enregistrer le retournement de carte
    if (currentSession) {
      const result = await flipCard(currentSession || '', parseInt(clickedCard.id.replace('card-', '')), clickedCard.type === GameTypes.JACKPOT, clickedCard.prize || 0);
      if (result && result.is_winning && result.points_earned) {
        // Mettre à jour le solde
        setCoins(coins + result.points_earned);
        setTotalWin(result.points_earned);
        setGameOver(true);
      }
    }

    // Vérifier les correspondances
    const flippedCards = updatedCards.filter(card => card.isFlipped && !card.isWinning);

    if (flippedCards.length === 2) {
      setRemainingAttempts(prev => prev - 1);
      const [firstCard, secondCard] = flippedCards;
      const isMatch = firstCard.image === secondCard.image;

      // Attendre un peu avant de traiter la correspondance
      setTimeout(async () => {
        // Vérifier si c'est une paire de foods-card
        const isWinningPair = isMatch && firstCard.image.includes('foods-card') && secondCard.image.includes('foods-card');

        // Mettre à jour les cartes retournées
        let newCards = cards.map(card => {
          if (card.id === firstCard.id || card.id === secondCard.id) {
            if (isWinningPair) {
              return {
                ...card,
                isWinning: true,
                isFlipped: true
              };
            } else {
              return {
                ...card,
                isFlipped: false
              };
            }
          }
          return card;
        });

        // Si ce n'est pas une paire gagnante, mélanger les cartes non gagnantes
        if (!isWinningPair) {
          // Séparer les cartes gagnantes et non gagnantes
          const winningCards = newCards.filter(card => card.isWinning);
          const nonWinningCards = newCards.filter(card => !card.isWinning);
          
          // Mélanger uniquement les cartes non gagnantes
          const shuffled = shuffleArray([...nonWinningCards]);
          
          // Combiner les cartes gagnantes et les cartes mélangées
          newCards = [...winningCards, ...shuffled];
        }

        // Mettre à jour l'état des cartes
        setCards(newCards);

        if (isWinningPair) {
          playSound(winSound);
          setGameOver(true);
        } else {
          playSound(matchSound);
        }

        setCards(newCards);

        // Vérifier si le jeu est terminé (plus de tentatives)
        if (remainingAttempts <= 1 && !isWinningPair) {
          setGameOver(true);
          playSound(loseSound);
          await endGame(false, 0);
          
          // Afficher la modale de fin de partie
          toast({
            title: "Partie terminée",
            description: "Vous n'avez plus de tentatives. Voulez-vous rejouer ?",
            action: (
              <div className="flex gap-2">
                <Button 
                  onClick={() => {
                    window.location.reload();
                  }}
                  variant="default"
                  className="bg-green-600 hover:bg-green-700"
                >
                  Nouvelle partie
                </Button>
                <Link href="/games">
                  <Button variant="outline">
                    Retour aux jeux
                  </Button>
                </Link>
              </div>
            ),
          });
        }
      }, 1000);
    }
  };

  return (
    <div 
      className="min-h-screen bg-gradient-to-br from-zinc-900 via-zinc-800 to-zinc-900"
      style={{
        backgroundImage: "url('/images/patterns/pattern-food.png')",
        backgroundBlendMode: "soft-light",
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        backgroundAttachment: "fixed"
      }}
    >
      {/* Overlay de fond avec effet de flou */}
      <div className="absolute inset-0 backdrop-blur-sm bg-black/30" />
      
      {/* Contenu principal */}
      <div className="relative w-full pt-20">
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Header avec effet de verre */}
          <div className="flex items-center justify-between mb-8 p-4 rounded-xl bg-white/10 backdrop-blur-md shadow-xl">
            <div className="flex items-center gap-4">
              <Link href="/games">
                <Button variant="ghost" className="text-white hover:bg-white/20">
                  <ChevronLeft className="w-4 h-4 mr-2" />
                  Retour aux jeux
                </Button>
              </Link>
              {/* Sound Controls */}
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5">
                <button
                  onClick={toggleSound}
                  className="p-2 rounded-full hover:bg-white/20 transition-colors"
                >
                  {soundEnabled ? (
                    <Volume2 className="w-6 h-6 text-white" />
                  ) : (
                    <VolumeX className="w-6 h-6 text-white" />
                  )}
                </button>
                {soundEnabled && (
                  <div className="flex items-center gap-2">
                    <Slider
                      value={[volume]}
                      onValueChange={(values: number[]) => handleVolumeChange(values[0])}
                      max={1}
                      step={0.1}
                      className="w-24"
                    />
                    <span className="text-sm text-white">{Math.round(volume * 100)}%</span>
                  </div>
                )}
              </div>
            </div>
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2 px-4 py-2 rounded-lg bg-white/5 backdrop-blur shadow-lg">
                <Coins className="w-5 h-5 text-yellow-400" />
                <span className="font-medium text-white">{coins || 0} points</span>
              </div>
              <Button
                onClick={() => setShowBuyPoints(true)}
                variant="outline"
                className="flex items-center gap-2"
              >
                <Euro className="w-4 h-4" />
                Acheter des points
              </Button>
            </div>
          </div>

          {/* Zone de jeu */}
          {!gameStarted ? (
            <div className="text-center space-y-8">
              {/* En-tête animé */}
              <div className="mb-12 space-y-4">
                <h1 className="text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 animate-gradient">
                  Jackpot Cards
                </h1>
                <p className="text-xl text-gray-300 max-w-2xl mx-auto">
                  Découvrez les paires de cartes magiques et gagnez jusqu'à {GAME_CONFIG.prize} points !
                </p>
              </div>

              {/* Présentation des cartes gagnantes */}
              <div className="mb-12">
                <h2 className="text-2xl font-semibold mb-6 text-white">Cartes Gagnantes</h2>
                <div className="flex justify-center gap-8">
                  <div className="group perspective">
                    <div className="relative w-40 h-56 transition-transform duration-1000 hover:rotate-y-180 preserve-3d">
                      <div className="absolute inset-0 backface-hidden">
                        <Image
                          src={GAME_CONFIG.cardBack}
                          alt="Dos de la carte"
                          fill
                          className="object-cover rounded-xl shadow-2xl"
                        />
                      </div>
                      <div className="absolute inset-0 backface-hidden rotate-y-180">
                        <Image
                          src={CARD_IMAGES.foods}
                          alt="Carte Foods"
                          fill
                          className="object-cover rounded-xl shadow-2xl"
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent rounded-xl flex items-end justify-center p-4">
                          <p className="text-white font-bold text-lg">
                            Gagnez {GAME_CONFIG.prize} points
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Bouton de démarrage */}
              <div className="space-y-4">
                <Button
                  onClick={initializeGame}
                  className="bg-gradient-to-r from-yellow-600 to-amber-600 hover:from-yellow-700 hover:to-amber-700 text-lg px-8 py-6 rounded-xl shadow-lg transform hover:scale-105 transition-transform"
                  disabled={!coins || coins < bet}
                >
                  Commencer la partie ({bet} points)
                </Button>
                {(!coins || coins < bet) && (
                  <p className="text-red-400 mt-2 animate-pulse">
                    Solde insuffisant pour jouer avec cette mise.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div>
              <div className="text-center mb-10">
                <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-2">
                  <Sparkles className="w-6 h-6 text-green-500" />
                  Jackpot Cards
                  <Sparkles className="w-6 h-6 text-green-500" />
                </h1>
                <p className="text-gray-400 max-w-2xl mx-auto">
                  Découvrez les paires de cartes magiques identiques et gagnez jusqu'à {GAME_CONFIG.prize} points !
                  Trouvez les bonnes combinaisons pour des récompenses exceptionnelles.
                </p>
              </div>

              {/* Game Board */}
              <div className="grid grid-cols-3 gap-4 max-w-2xl mx-auto mb-8">
                {cards.map((card) => (
                  <button
                    key={card.id}
                    onClick={() => handleCardClick(card)}
                    disabled={card.isFlipped || remainingAttempts === 0}
                    className={cn(
                      "relative w-full pt-[140%] rounded-lg overflow-hidden transition-transform duration-500 transform perspective-1000",
                      {
                        "cursor-pointer hover:scale-105": !card.isFlipped && remainingAttempts > 0,
                        "cursor-not-allowed": card.isFlipped || remainingAttempts === 0,
                      }
                    )}
                  >
                    <div
                      className={cn(
                        "absolute inset-0 w-full h-full transition-transform duration-500 transform-gpu preserve-3d",
                        {
                          "rotate-y-180": card.isFlipped,
                        }
                      )}
                    >
                      {/* Front of card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden">
                        <Image
                          src={card.isFlipped ? card.image : GAME_CONFIG.cardBack}
                          alt={card.isFlipped ? 'Card Front' : 'Card Back'}
                          priority
                          fill
                          className="object-cover"
                        />
                      </div>

                      {/* Back of card */}
                      <div className="absolute inset-0 w-full h-full backface-hidden rotate-y-180">
                        <Image
                          src={card.image}
                          alt={String(card.id)}
                          fill
                          className="object-cover"
                        />
                        {card.isWinning && (
                          <div className="absolute inset-0 bg-green-500 bg-opacity-20 flex items-center justify-center">
                            <Sparkles className="w-8 h-8 text-yellow-400" />
                          </div>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>

              {/* Game Controls */}
              <div className="text-center">
                <p className="text-lg mb-4 text-white">
                  Tentatives restantes: {remainingAttempts}
                </p>
              </div>
            </div>
          )}

          {/* Buy Points Modal */}
          {showBuyPoints && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-zinc-800 p-8 rounded-lg text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                  Acheter des points
                </h2>
                <p className="text-lg mb-6">
                  Vous pouvez acheter des points pour jouer au jeu.
                </p>
                <div className="flex justify-center gap-4">
                  <Input
                    type="number"
                    value={pointsToBuy}
                    onChange={(e) => setPointsToBuy(parseInt(e.target.value))}
                    className="w-full"
                  />
                  <Button
                    onClick={handleBuyPoints}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Acheter
                  </Button>
                  <Button
                    onClick={() => setShowBuyPoints(false)}
                    variant="outline"
                  >
                    Annuler
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Game Over Modal */}
          {gameOver && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
              <div className="bg-zinc-800 p-8 rounded-lg text-center max-w-md">
                <h2 className="text-2xl font-bold mb-4">
                  {totalWin > 0 ? "Félicitations !" : "Partie terminée"}
                </h2>
                <p className="text-lg mb-6">
                  {totalWin > 0 
                    ? `Vous avez gagné ${totalWin} points !`
                    : "Vous n'avez pas trouvé la paire gagnante. Réessayez !"}
                </p>
                <div className="flex justify-center gap-4">
                  <Button
                    onClick={() => window.location.reload()}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    Nouvelle partie
                  </Button>
                  <Link href="/games">
                    <Button variant="outline">
                      Retour aux jeux
                    </Button>
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
