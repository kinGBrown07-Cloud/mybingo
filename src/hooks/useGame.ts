import { useState, useEffect } from 'react';
import { gameService } from '@/lib/supabase';
import type { GameSession, GameType } from '@/types/game';

interface CardFlip {
  id: string;
  session_id: string;
  card_index: number;
  is_winning: boolean;
  prize: number | null;
  created_at: string;
}

export function useGame(userId: string | undefined): {
  gameSession: GameSession | null;
  isLoading: boolean;
  error: Error | null;
  startGame: (gameType: GameType, betAmount: number, useCoins: boolean) => Promise<GameSession | null>;
  flipCard: (sessionId: string, cardIndex: number, isWinning: boolean, prize: number | null) => Promise<CardFlip | null>;
  endGame: (hasWon: boolean, prize: number | null) => Promise<GameSession | null>;
} {
  const [gameSession, setGameSession] = useState<GameSession | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const startGame = async (gameType: GameType, betAmount: number, useCoins: boolean) => {
    if (!userId) return null;

    setIsLoading(true);
    try {
      const session = await gameService.createGameSession(userId, gameType, betAmount, useCoins);
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
    if (!userId) return null;

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

  const endGame = async (hasWon: boolean, prize: number | null) => {
    if (!gameSession) return null;

    setIsLoading(true);
    try {
      const updatedSession = await gameService.completeGameSession(gameSession.id, hasWon, prize);
      setGameSession(updatedSession);
      return updatedSession;
    } catch (err) {
      setError(err as Error);
      return null;
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
