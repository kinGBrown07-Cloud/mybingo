import React from 'react';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function GamePage({ params }: { params: { gameId: string } }) {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 text-center">
        <h1 className="text-3xl font-bold text-white mb-6">Jeu en développement</h1>
        <p className="text-gray-400 mb-8">
          Le jeu {params.gameId} est en cours de développement.
          Nous travaillons activement pour vous offrir une expérience de jeu exceptionnelle.
        </p>
        <Link href="/">
          <Button className="casino-button">Retour à l'accueil</Button>
        </Link>
      </div>

      <Footer />
    </main>
  );
}

export function generateStaticParams() {
  return [
    { gameId: 'memory' },
    { gameId: 'blackjack' },
    { gameId: 'slots' },
  ];
}
