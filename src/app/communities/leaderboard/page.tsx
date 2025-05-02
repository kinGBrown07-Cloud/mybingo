"use client";

import React, { useState, useEffect } from 'react';
import { CommunityNav } from '@/components/community-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { toast } from 'react-hot-toast';

type Community = {
  id: string;
  name: string;
  cause: string;
  totalEarnings: number;
  currentAmount: number;
  _count: {
    members: number;
  };
  createdAt: string;
};

export default function CommunityLeaderboard() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/communities/leaderboard?limit=20');
        
        if (!response.ok) {
          throw new Error('Failed to fetch communities leaderboard');
        }
        
        const data = await response.json();
        setCommunities(data.communities);
      } catch (err) {
        console.error('Error fetching communities leaderboard:', err);
        setError('Failed to load communities leaderboard. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  // Fallback data in case API fails
  const fallbackCommunities = [
    {
      id: "1",
      name: "Save The Ocean",
      cause: "Protection des océans",
      totalEarnings: 15320,
      currentAmount: 15320,
      _count: { members: 128 },
      createdAt: new Date().toISOString()
    },
    {
      id: "2",
      name: "Green Earth",
      cause: "Reforestation",
      totalEarnings: 12750,
      currentAmount: 12750,
      _count: { members: 95 },
      createdAt: new Date().toISOString()
    },
    {
      id: "3",
      name: "Animal Rescue",
      cause: "Protection animale",
      totalEarnings: 9840,
      currentAmount: 9840,
      _count: { members: 73 },
      createdAt: new Date().toISOString()
    }
  ];

  // Use fallback data if API fails
  const displayCommunities = communities.length > 0 ? communities : fallbackCommunities;

  // Calculate weekly growth (mock data for now)
  const getWeeklyGrowth = (community: Community) => {
    // In a real implementation, this would compare current earnings with last week's
    // For now, generate a random percentage between 5% and 20%
    const randomGrowth = Math.floor(Math.random() * 16) + 5;
    return `+${randomGrowth}%`;
  };

  // Calculate affiliation earnings (mock data for now)
  const getAffiliationEarnings = (community: Community) => {
    // In a real implementation, this would be calculated from actual affiliation data
    // For now, use 10% of total earnings as a placeholder
    return Math.round(community.totalEarnings * 0.1);
  };

  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Classement des Communautés</h1>
          <Link href="/communities/create">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white">
              Créer une Communauté
            </Button>
          </Link>
        </div>
        
        {loading ? (
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        ) : error ? (
          <div className="text-center py-10">
            <p className="text-red-500">{error}</p>
            <p className="text-gray-400 mt-2">Affichage des communautés par défaut</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayCommunities.map((community, index) => (
              <Link 
                href={`/communities/${community.id}`}
                key={community.id}
              >
                <div className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-all">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <div className={`
                        w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl
                        ${index === 0 ? 'bg-yellow-500 text-black' : 
                          index === 1 ? 'bg-gray-400 text-black' :
                          index === 2 ? 'bg-orange-700 text-white' :
                          'bg-zinc-700 text-white'}
                      `}>
                        {index + 1}
                      </div>
                      <div>
                        <h2 className="text-xl font-bold text-white">{community.name}</h2>
                        <p className="text-gray-400">{community.cause}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold text-emerald-400">
                        {community.totalEarnings.toLocaleString('fr-FR')}€
                      </div>
                      <div className="flex items-center justify-end space-x-4 mt-2">
                        <div className="text-gray-400">
                          {community._count.members} membres
                        </div>
                        <div className="text-green-400">
                          {getWeeklyGrowth(community)}
                        </div>
                      </div>
                      <div className="mt-2 text-sm text-yellow-500">
                        Gains d'affiliation : {getAffiliationEarnings(community).toLocaleString('fr-FR')}€
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t border-zinc-700">
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <div className="text-sm text-gray-400">Gains totaux</div>
                        <div className="text-lg font-bold text-white">{community.totalEarnings.toLocaleString('fr-FR')}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Gains d'affiliation</div>
                        <div className="text-lg font-bold text-yellow-500">{getAffiliationEarnings(community).toLocaleString('fr-FR')}€</div>
                      </div>
                      <div>
                        <div className="text-sm text-gray-400">Date de création</div>
                        <div className="text-lg font-bold text-white">{new Date(community.createdAt).toLocaleDateString('fr-FR')}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
        
        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">
            Rejoignez une communauté et contribuez à une cause qui vous tient à cœur
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/communities">
              <Button className="w-full sm:w-auto bg-zinc-700 hover:bg-zinc-600 text-white px-8 py-4">
                EXPLORER LES COMMUNAUTÉS
              </Button>
            </Link>
            <Link href="/communities/create">
              <Button className="w-full sm:w-auto bg-purple-500 hover:bg-purple-600 text-white px-8 py-4">
                CRÉER UNE COMMUNAUTÉ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
