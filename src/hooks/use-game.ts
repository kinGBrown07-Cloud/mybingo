'use client';

import { useState } from 'react';
import type { GameSession, CardFlip } from '@/types/game';
import type { Database } from '@/types/database';

type GameType = Database['public']['Enums']['game_type'];

interface GameService {
  createGameSession: (userId: string, gameType: GameType, betAmount: number, useCoins: boolean) => Promise<GameSession>;
  flipCard: (sessionId: string, cardIndex: number, isWinning: boolean, prize: number | null) => Promise<CardFlip>;
  endGame: (sessionId: string, hasWon: boolean, prize: number) => Promise<void>;
}

const gameService: GameService = {
  createGameSession: async (userId, gameType, betAmount, useCoins) => {
    // Mock implementation
    return {
      id: 'mock-session-id',
      user_id: userId,
      game_type: gameType,
      bet_amount: betAmount,
      use_coins: useCoins,
      has_won: false,
      prize: null,
      created_at: new Date().toISOString(),
      completed_at: null
    };
  },

  flipCard: async (sessionId, cardIndex, isWinning, prize) => {
    // Mock implementation
    return {
      id: 'mock-flip-id',
      session_id: sessionId,
      card_index: cardIndex,
      is_winning: isWinning,
      prize: prize,
      points_earned: isWinning ? 100 : 0,
      created_at: new Date().toISOString()
    };
  },

  endGame: async (sessionId, hasWon, prize) => {
    // Mock implementation
    console.log('Game ended:', { sessionId, hasWon, prize });
  }
};

export function useGame() {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startGame = async (gameType: GameType, betAmount: number, useCoins: boolean) => {
    setIsLoading(true);
    try {
      const session = await gameService.createGameSession('mock-user-id', gameType, betAmount, useCoins);
      setGameSession(session);
      return session;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const flipCard = async (sessionId: string, cardIndex: number, isWinning: boolean, prize: number | null): Promise<CardFlip | null> => {
    setIsLoading(true);
    try {
      const flip = await gameService.flipCard(sessionId, cardIndex, isWinning, prize);
      return flip;
    } catch (err) {
      setError(err as Error);
      return null;
    } finally {
      setIsLoading(false);
    }
  };

  const endGame = async (hasWon: boolean, prize: number) => {
    if (!gameSession) return;

    setIsLoading(true);
    try {
      await gameService.endGame(gameSession.id, hasWon, prize);
      setGameSession(null);
    } catch (err) {
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  return {
    gameSession,
    isLoading,
    error,
    startGame,
    flipCard,
    endGame
  };
}