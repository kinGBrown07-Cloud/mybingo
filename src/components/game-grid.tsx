"use client";

import React from 'react';
import Image from 'next/image';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

// Define the game type
interface Game {
  id: string;
  title: string;
  image: string;
  minBet: string;
  maxBet: string;
}

// Sample game data
const gamesData: Game[] = [
  {
    id: '1',
    title: 'Gold Digger',
    image: 'https://ext.same-assets.com/659082293/1969560824.jpeg',
    minBet: '0,20',
    maxBet: '30,00'
  },
  {
    id: '2',
    title: 'Parthenon: Quest for Immortality',
    image: 'https://ext.same-assets.com/3586919665/4239634785.jpeg',
    minBet: '0,20',
    maxBet: '108,00'
  },
  {
    id: '3',
    title: 'Magic Spins',
    image: 'https://ext.same-assets.com/1552588343/1770970808.jpeg',
    minBet: '0,10',
    maxBet: '50.000,00'
  },
  {
    id: '4',
    title: 'Dragon Gold 88',
    image: 'https://ext.same-assets.com/3517954159/895731163.jpeg',
    minBet: '0,10',
    maxBet: '10.000,00'
  },
  {
    id: '5',
    title: 'Lucky Lady\'s Charm deluxe 6',
    image: 'https://ext.same-assets.com/4169767919/1002008284.jpeg',
    minBet: '0,01',
    maxBet: '40,00'
  },
  {
    id: '6',
    title: 'Blue Wizard',
    image: 'https://ext.same-assets.com/1218931879/3638404281.jpeg',
    minBet: '0,10',
    maxBet: '250,00'
  },
  {
    id: '7',
    title: 'Lucky Strike',
    image: 'https://ext.same-assets.com/2553960647/915608931.jpeg',
    minBet: '0,10',
    maxBet: '100,00'
  },
  {
    id: '8',
    title: 'Sweet Bonanza',
    image: 'https://ext.same-assets.com/925054881/13215675.jpeg',
    minBet: '0,20',
    maxBet: '2.200,00'
  }
];

// Game card component
const GameCard: React.FC<{ game: Game }> = ({ game }) => {
  return (
    <Card className="game-card overflow-hidden border-0">
      <CardContent className="p-0 relative">
        <div className="relative aspect-[4/3] overflow-hidden">
          <Image
            src={game.image}
            alt={game.title}
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            className="object-cover transition-transform hover:scale-110"
          />
        </div>
        <div className="px-2 py-1 bg-gray-900">
          <h3 className="text-sm text-white truncate">{game.title}</h3>
          <div className="text-xs text-gray-400">{game.minBet} | {game.maxBet}</div>
        </div>
      </CardContent>
    </Card>
  );
};

export const GameGrid = () => {
  return (
    <section className="py-10 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Tabs defaultValue="popular" className="w-full">
          <div className="mb-6 border-b border-zinc-800">
            <TabsList className="bg-transparent h-auto p-0">
              <TabsTrigger
                value="popular"
                className="text-white data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 px-4 py-2 rounded-none bg-transparent data-[state=active]:shadow-none"
              >
                Jeux Populaires
              </TabsTrigger>
              <TabsTrigger
                value="slots"
                className="text-white data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 px-4 py-2 rounded-none bg-transparent data-[state=active]:shadow-none"
              >
                Machines à sous
              </TabsTrigger>
              <TabsTrigger
                value="live"
                className="text-white data-[state=active]:text-red-500 data-[state=active]:border-b-2 data-[state=active]:border-red-500 px-4 py-2 rounded-none bg-transparent data-[state=active]:shadow-none"
              >
                Jeux Spéciaux
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="popular" className="mt-0">
            <h2 className="text-2xl font-bold text-white mb-4">Jeux de Cartes Tendance</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gamesData.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="slots" className="mt-0">
            <h2 className="text-2xl font-bold text-white mb-4">Machines à sous populaires</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gamesData.map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value="live" className="mt-0">
            <h2 className="text-2xl font-bold text-white mb-4">Jeux Spéciaux</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {gamesData.slice(0, 6).map((game) => (
                <GameCard key={game.id} game={game} />
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
};
