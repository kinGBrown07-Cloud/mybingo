"use client";

import React from 'react';
import { CommunityNav } from '@/components/community-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import VIPSection from '@/components/community/vip-section';
import RankingSection from '@/components/community/ranking-section';
import AffiliationSection from '@/components/community/affiliation-section';

export default function Communities() {
  const communities = [
    {
      name: "Save The Ocean",
      cause: "Protection des océans",
      members: 128,
      totalEarnings: "15 320€",
      image: "https://ext.same-assets.com/8901234000/9012345000.jpeg"
    },
    {
      name: "Green Earth",
      cause: "Reforestation",
      members: 95,
      totalEarnings: "12 750€",
      image: "https://ext.same-assets.com/9012345000/0123456000.jpeg"
    },
    {
      name: "Animal Rescue",
      cause: "Protection animale",
      members: 73,
      totalEarnings: "9 840€",
      image: "https://ext.same-assets.com/0123456000/1234567000.jpeg"
    }
  ];

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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {communities.map((community, index) => (
            <div key={index} className="bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 hover:border-zinc-600 transition-all">
              <div className="relative h-48">
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent z-10" />
                <Image
                  src={community.image}
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
                    {community.members} membres
                  </div>
                  <div className="text-emerald-400 font-bold">
                    {community.totalEarnings}
                  </div>
                </div>
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                  Rejoindre
                </Button>
              </div>
            </div>
          ))}
        </div>

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
