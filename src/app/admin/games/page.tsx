"use client";

import { useState, useEffect, useCallback } from 'react';
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

interface Game {
  id: string;
  userId: string;
  type: 'MEMORY' | 'BLACKJACK' | 'SLOTS';
  bet: number;
  points: number;
  hasWon: boolean;
  createdAt: string;
  user: {
    email: string;
    username: string;
  };
}

export default function GamesPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null>(null);
  const { toast } = useToast();
  const [games, setGames] = useState<Game[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchGames = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/games');
      const data = await response.json();

      if (response.ok) {
        setGames(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les parties",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching games:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des parties",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
        fetchGames();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      }
    }
    
    checkAuth();
  }, [router, fetchGames]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Historique des parties</h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Rechercher une partie..."
            className="w-[300px]"
          />
          <Button>Exporter</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Joueur</TableHead>
                <TableHead>Jeu</TableHead>
                <TableHead>Mise</TableHead>
                <TableHead>Gain</TableHead>
                <TableHead>Résultat</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {games.map((game) => (
                <TableRow key={game.id}>
                  <TableCell className="font-medium">{game.id}</TableCell>
                  <TableCell>{game.user.username}</TableCell>
                  <TableCell>{game.type}</TableCell>
                  <TableCell>{game.bet} XOF</TableCell>
                  <TableCell>{game.points} XOF</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      game.hasWon ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {game.hasWon ? 'Gagné' : 'Perdu'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(game.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <Button variant="ghost" size="sm">
                      Détails
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
