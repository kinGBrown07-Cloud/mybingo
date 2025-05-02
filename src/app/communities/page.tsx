"use client";

import React, { useState, useEffect } from 'react';
import { CommunityNav } from '@/components/community-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import VIPSection from '@/components/community/vip-section';
import RankingSection from '@/components/community/ranking-section';
import AffiliationSection from '@/components/community/affiliation-section';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

type Community = {
  id: string;
  name: string;
  cause: string;
  imageUrl: string | null;
  _count: {
    members: number;
  };
  totalEarnings: number;
};

export default function Communities() {
  const { data: session } = useSession();
  const router = useRouter();
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/communities?limit=6');
        
        if (!response.ok) {
          throw new Error('Failed to fetch communities');
        }
        
        const data = await response.json();
        setCommunities(data.communities);
      } catch (err) {
        console.error('Error fetching communities:', err);
        setError('Failed to load communities. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    fetchCommunities();
  }, []);

  const handleJoinCommunity = async (communityId: string) => {
    if (!session) {
      toast.error('Vous devez être connecté pour rejoindre une communauté');
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${communityId}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join community');
      }

      toast.success('Vous avez rejoint la communauté avec succès!');
      router.push(`/communities/${communityId}`);
    } catch (err: Error | unknown) {
      console.error('Error joining community:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la tentative de rejoindre la communauté';
      toast.error(errorMessage);
    }
  };

  // Fallback data in case API fails
  const fallbackCommunities = [
    {
      id: "1",
      name: "Save The Ocean",
      cause: "Protection des océans",
      _count: { members: 128 },
      totalEarnings: 15320,
      imageUrl: "https://ext.same-assets.com/8901234000/9012345000.jpeg"
    },
    {
      id: "2",
      name: "Green Earth",
      cause: "Reforestation",
      _count: { members: 95 },
      totalEarnings: 12750,
      imageUrl: "https://ext.same-assets.com/9012345000/0123456000.jpeg"
    },
    {
      id: "3",
      name: "Animal Rescue",
      cause: "Protection animale",
      _count: { members: 73 },
      totalEarnings: 9840,
      imageUrl: "https://ext.same-assets.com/0123456000/1234567000.jpeg"
    }
  ];

  // Use fallback data if API fails
  const displayCommunities = communities.length > 0 ? communities : fallbackCommunities;

  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-4xl font-bold text-white">Communautés</h1>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {displayCommunities.map((community) => (
              <div key={community.id} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all">
                <div className="relative h-48">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                  <Image
                    src={community.imageUrl || '/images/default-community.jpg'}
                    alt={community.name}
                    fill
                    className="object-cover"
                    unoptimized
                  />
                  <div className="absolute bottom-4 left-4 right-4 z-20">
                    <h3 className="text-xl font-bold text-white mb-1">{community.name}</h3>
                    <p className="text-gray-300">{community.cause}</p>
                  </div>
                </div>
                
                <div className="p-4">
                  <div className="flex justify-between items-center mb-4">
                    <div className="text-gray-400">
                      {community._count.members} membres
                    </div>
                    <div className="text-emerald-400 font-bold">
                      {community.totalEarnings.toLocaleString('fr-FR')}€
                    </div>
                  </div>
                  <Button 
                    className="w-full bg-zinc-700 hover:bg-zinc-600 text-white"
                    onClick={() => handleJoinCommunity(community.id)}
                  >
                    Rejoindre
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}

        <div className="mt-12 bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Envie de créer votre propre communauté ?
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Rassemblez vos amis, choisissez une cause qui vous tient à cœur et commencez à jouer ensemble.
            Profitez de nos packs communautaires exclusifs avec jusqu'à 40% de réduction !
          </p>
          <Link href="/communities/create">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6">
              LANCER MA COMMUNAUTÉ
            </Button>
          </Link>
        </div>
      </div>
      
      <VIPSection />
      <RankingSection />
      <AffiliationSection />
    </main>
  );
}
