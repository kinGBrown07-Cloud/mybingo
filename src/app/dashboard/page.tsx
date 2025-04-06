import React from 'react';
import { UserDashboard } from '@/components/user-dashboard';
import { prisma } from '@/lib/db';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { redirect } from 'next/navigation';
import type { Transaction, GameSession } from '@/types/db';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

interface DashboardUser {
  id: string;
  userId: string;
  username: string;
  firstName: string;
  lastName: string;
  phoneNumber: string | null;
  birthdate: Date | null;
  country: string;
  region: string;
  currency: string;
  coins: number;
  isActive: boolean;
  transactions: Transaction[];
  gameSessions: GameSession[];
  createdAt: Date;
  updatedAt: Date;
  email: string;
}

// Indique à Next.js que cette page doit être rendue dynamiquement
export const dynamic = 'force-dynamic';

// Cette page est rendue côté serveur pour vérifier l'authentification
export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user) {
    redirect('/auth/login');
  }

  const userProfile = await prisma.profile.findUnique({
    where: { userId: session.user.id },
    include: {
      user: true,
      referrer: true,
      referrals: true,
      transactions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      },
      gameSessions: {
        orderBy: { createdAt: 'desc' },
        take: 5
      }
    }
  });

  if (!userProfile) {
    redirect('/auth/login');
  }

  const userWithActive: DashboardUser = {
    ...userProfile,
    isActive: true,
    email: userProfile.user.email,
    transactions: userProfile.transactions.map(t => ({
      id: t.id,
      profileId: t.profileId,
      type: t.type,
      amount: Number(t.amount),
      pointsAmount: t.pointsAmount,
      status: t.status,
      currency: t.currency,
      gameSessionId: t.gameSessionId || undefined,
      createdAt: t.createdAt,
      updatedAt: t.updatedAt
    })),
    gameSessions: userProfile.gameSessions.map(g => ({
      id: g.id,
      profileId: g.profileId,
      type: g.type === 'CLASSIC' ? 'FOODS' : g.type === 'MAGIC' ? 'MODE' : 'JACKPOT',
      points: g.points,
      hasWon: g.hasWon,
      matchedPairs: g.matchedPairs,
      createdAt: g.createdAt,
      updatedAt: g.updatedAt,
      cardFlips: []
    }))
  };

  return (
    <main className="min-h-screen bg-zinc-900">
      <div className="container mx-auto py-8">
        <UserDashboard user={userWithActive} />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-red-900 to-red-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">Foods Cards</h3>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-400 mb-4">Gagnez des kits alimentaires de qualité ou leur équivalent en argent. Trouvez deux images identiques parmi les cartes.</p>
              <Link href="/games/foods">
                <Button className="w-full casino-button">Jouer maintenant</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-purple-900 to-purple-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">Mode Cards</h3>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-400 mb-4">Remportez des vêtements tendance et accessoires de marque, ou optez pour leur valeur en argent.</p>
              <Link href="/games/mode">
                <Button className="w-full casino-button">Jouer maintenant</Button>
              </Link>
            </CardContent>
          </Card>

          <Card className="bg-zinc-800 border-zinc-700 overflow-hidden">
            <div className="h-40 bg-gradient-to-r from-yellow-900 to-amber-700 relative">
              <div className="absolute inset-0 flex items-center justify-center">
                <h3 className="text-xl font-bold text-white">Jackpot Cards</h3>
              </div>
            </div>
            <CardContent className="pt-4">
              <p className="text-gray-400 mb-4">Tentez votre chance pour gagner des lots exceptionnels : voitures, voyages, électronique haut de gamme!</p>
              <Link href="/games/jackpot">
                <Button className="w-full casino-button">Jouer maintenant</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    </main>
  );
}
