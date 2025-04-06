"use server";

import { GameSession, CardFlip, Transaction, Region, Currency } from "@/types/db";
import { v4 as uuidv4 } from 'uuid';
import { gameConfigs, GameType } from '@/config/gameConfigs';
import { prisma } from '@/lib/prisma';
import { calculatePointCost } from '@/utils/pointCalculator';

// Interface pour les cartes générées
export interface GameCard {
  cardIndex: number;
  isWinning: boolean;
  prize: number;
  revealed: boolean;
}

// Interface pour la session de jeu actuelle avec le client
export interface ClientGameSession {
  id: string;
  gameType: GameType;
  betAmount: number;
  useCoins: boolean; // Indique si la mise est en coins ou en euros
  cards: GameCard[];
  isGameOver: boolean;
  hasWon: boolean;
  prize: number;
  flippedCount: number;
}

/**
 * Crée une nouvelle session de jeu pour un utilisateur
 */
export async function createGameSession(
  userId: string,
  type: 'FOODS' | 'MODE' | 'JACKPOT',
  points: number // Nombre de points à utiliser
): Promise<ClientGameSession> {
  // Vérifier que le nombre de points est suffisant (minimum 2 points)
  if (points < 2) {
    throw new Error('Le minimum est de 2 points par partie');
  }

  // Récupérer le profil de l'utilisateur avec sa région
  const profile = await prisma.profile.findUnique({
    where: { userId },
    select: { id: true, coins: true, region: true }
  });

  if (!profile) {
    throw new Error('Profil utilisateur non trouvé');
  }

  // Vérifier que l'utilisateur a assez de points
  if (profile.coins < points) {
    throw new Error('Solde de points insuffisant');
  }

  // Générer les cartes
  const cards: GameCard[] = [];
  const cardCount = gameConfigs[type].cardCount;
  const prizes = gameConfigs[type].prizes;
  const winChance = gameConfigs[type].winChance;

  // Déterminer si cette partie est gagnante
  const isWinningGame = Math.random() < winChance;

  // Créer les cartes
  for (let i = 0; i < cardCount; i++) {
    cards.push({
      cardIndex: i,
      isWinning: false,
      prize: 0,
      revealed: false
    });
  }

  // Si c'est une partie gagnante, attribuer un prix à une paire de cartes
  if (isWinningGame) {
    // Sélectionner deux positions aléatoires différentes pour la paire gagnante
    const positions = Array.from({ length: cardCount }, (_, i) => i);
    const [pos1, pos2] = positions
      .sort(() => Math.random() - 0.5)
      .slice(0, 2);

    const prizeIndex = Math.floor(Math.random() * prizes.length);
    const prize = prizes[prizeIndex];

    cards[pos1].isWinning = true;
    cards[pos1].prize = prize;
    cards[pos2].isWinning = true;
    cards[pos2].prize = prize;
  }

  // Créer la session en base de données
  const gameSession = await prisma.gameSession.create({
    data: {
      profileId: profile.id,
      type,
      points,
      hasWon: false,
      matchedPairs: 0
    }
  });

  // Déduire les points du solde de l'utilisateur
  await prisma.profile.update({
    where: { id: profile.id },
    data: {
      coins: {
        decrement: points
      }
    }
  });

  // Créer la transaction pour la mise
  await prisma.transaction.create({
    data: {
      profileId: profile.id,
      type: 'BET',
      amount: points,
      currency: 'COINS',
      status: 'COMPLETED'
    }
  });

  // Retourner la session client
  return {
    id: gameSession.id,
    gameType: type,
    betAmount: points,
    useCoins: true,
    cards,
    isGameOver: false,
    hasWon: false,
    prize: 0,
    flippedCount: 0
  };
}

/**
 * Retourne une carte dans une session de jeu
 */
export async function flipCard(
  sessionId: string,
  userId: string,
  cardIndex: number,
  currentSession: ClientGameSession
): Promise<ClientGameSession> {
  // Vérifier que la carte existe
  if (cardIndex < 0 || cardIndex >= currentSession.cards.length) {
    throw new Error('Index de carte invalide');
  }

  // Vérifier que la carte n'a pas déjà été retournée
  if (currentSession.cards[cardIndex].revealed) {
    throw new Error('Cette carte a déjà été retournée');
  }

  // Retourner la carte
  currentSession.cards[cardIndex].revealed = true;
  currentSession.flippedCount++;

  // Trouver la carte précédemment retournée
  const previousCard = currentSession.cards.find(
    (card, index) => card.revealed && index !== cardIndex
  );

  // Vérifier si on a une paire gagnante
  if (previousCard && 
      currentSession.cards[cardIndex].isWinning && 
      previousCard.isWinning &&
      currentSession.cards[cardIndex].prize === previousCard.prize) {
    currentSession.hasWon = true;
    currentSession.prize = currentSession.cards[cardIndex].prize;
    currentSession.isGameOver = true;

    // Mettre à jour la session en base de données
    await prisma.gameSession.update({
      where: { id: sessionId },
      data: {
        hasWon: true,
        matchedPairs: 1,
        points: currentSession.prize
      }
    });

    // Ajouter le gain au solde de l'utilisateur
    const profile = await prisma.profile.findUnique({
      where: { userId }
    });

    if (!profile) {
      throw new Error('Profil utilisateur non trouvé');
    }

    await prisma.profile.update({
      where: { id: profile.id },
      data: {
        coins: {
          increment: currentSession.prize
        }
      }
    });

    // Créer la transaction pour le gain
    await prisma.transaction.create({
      data: {
        profileId: profile.id,
        type: 'WIN',
        amount: currentSession.prize,
        currency: 'COINS',
        status: 'COMPLETED'
      }
    });
  } else if (currentSession.flippedCount >= 2) {
    // Si le joueur a retourné 2 cartes sans trouver de paire, la partie est terminée
    currentSession.isGameOver = true;
  }

  return currentSession;
}

/**
 * Réclame le prix d'une session de jeu gagnante
 */
export async function claimPrize(
  sessionId: string,
  userId: string,
  currentSession: ClientGameSession
): Promise<boolean> {
  // Dans une vraie application, nous récupérerions la session depuis la base de données
  // const session = await db.gameSession.findUnique({ where: { id: sessionId, userId } });

  const session = currentSession;
  if (!session) {
    throw new Error("Session de jeu non trouvée");
  }

  if (!session.hasWon || !session.prize) {
    throw new Error("Cette partie n'a pas été gagnée ou le prix a déjà été réclamé");
  }

  // Dans une vraie application, nous mettrions à jour le solde de l'utilisateur
  // et nous créerions une transaction pour le gain
  // await db.user.update({ where: { id: userId }, data: { balance: { increment: session.prize } } });
  // await db.transaction.create({
  //   userId,
  //   type: 'win',
  //   amount: session.prize,
  //   status: 'completed',
  //   gameSessionId: sessionId
  // });

  return true;
}

/**
 * Révèle toutes les cartes d'une session de jeu
 */
export async function revealAllCards(
  sessionId: string,
  userId: string,
  currentSession: ClientGameSession
): Promise<ClientGameSession> {
  // Dans une vraie application, nous récupérerions la session depuis la base de données
  // const session = await db.gameSession.findUnique({ where: { id: sessionId, userId } });

  const session = { ...currentSession };
  if (!session) {
    throw new Error("Session de jeu non trouvée");
  }

  if (!session.isGameOver) {
    throw new Error("Vous ne pouvez pas révéler toutes les cartes tant que la partie n'est pas terminée");
  }

  // Révéler toutes les cartes
  session.cards = session.cards.map(card => ({
    ...card,
    revealed: true
  }));

  // Dans une vraie application, nous mettrions à jour la session dans la base de données
  // await db.gameSession.update({ ... })

  return session;
}

/**
 * Obtient les statistiques de jeu d'un utilisateur
 */
export async function getUserGameStats(userId: string, gameType?: GameType) {
  // Dans une vraie application, nous récupérerions ces statistiques depuis la base de données
  // return await db.gameSession.aggregate({ ... })

  // Statistiques simulées pour le développement
  return {
    totalGames: 47,
    winCount: 12,
    lossCount: 35,
    totalBetAmount: 470,
    totalWinAmount: 850,
    biggestWin: 250,
    winRate: 25.53,
    totalCoinsEarned: 15000,
    totalCoinsSpent: 8500
  };
}

/**
 * Convertit des Coins en valeur Euro (pour affichage uniquement)
 */
export async function coinsToEuros(coins: number): Promise<number> {
  return coins / 100; // 100 coins = 1€
}

/**
 * Convertit des Euros en Coins
 */
export async function eurosToCoins(euros: number): Promise<number> {
  return euros * 100; // 1€ = 100 coins
}
