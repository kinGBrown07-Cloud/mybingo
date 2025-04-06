"use client";

import React from 'react';
import { CommunityNav } from '@/components/community-nav';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

export default function CommunityLeaderboard() {
  const communities = [
    {
      rank: 1,
      name: "Save The Ocean",
      cause: "Protection des océans",
      totalEarnings: "15 320€",
      members: 128,
      weeklyGrowth: "+12%",
      affiliationEarnings: "1 532€"
    },
    {
      rank: 2,
      name: "Green Earth",
      cause: "Reforestation",
      totalEarnings: "12 750€",
      members: 95,
      weeklyGrowth: "+8%",
      affiliationEarnings: "1 275€"
    },
    {
      rank: 3,
      name: "Animal Rescue",
      cause: "Protection animale",
      totalEarnings: "9 840€",
      members: 73,
      weeklyGrowth: "+15%",
      affiliationEarnings: "984€"
    }
  ];

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
        
        <div className="space-y-4">
          {communities.map((community) => (
            <div 
              key={community.rank}
              className="bg-zinc-800 rounded-xl p-6 border border-zinc-700 hover:border-zinc-600 transition-all"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className={`
                    w-12 h-12 rounded-full flex items-center justify-center font-bold text-2xl
                    ${community.rank === 1 ? 'bg-yellow-500 text-black' : 
                      community.rank === 2 ? 'bg-gray-400 text-black' :
                      community.rank === 3 ? 'bg-orange-700 text-white' :
                      'bg-zinc-700 text-white'}
                  `}>
                    {community.rank}
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">{community.name}</h2>
                    <p className="text-gray-400">{community.cause}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-emerald-400">
                    {community.totalEarnings}
                  </div>
                  <div className="flex items-center justify-end space-x-4 mt-2">
                    <div className="text-gray-400">
                      {community.members} membres
                    </div>
                    <div className="text-green-400">
                      {community.weeklyGrowth}
                    </div>
                  </div>
                  <div className="mt-2 text-sm text-yellow-500">
                    Gains d'affiliation : {community.affiliationEarnings}
                  </div>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-700">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <div className="text-sm text-gray-400">Gains totaux</div>
                    <div className="text-lg font-bold text-white">{community.totalEarnings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Gains d'affiliation</div>
                    <div className="text-lg font-bold text-yellow-500">{community.affiliationEarnings}</div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-400">Croissance hebdo</div>
                    <div className="text-lg font-bold text-green-400">{community.weeklyGrowth}</div>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-800/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Comment grimper dans le classement ?</h3>
            <ul className="space-y-2 text-gray-300">
              <li className="flex items-center">
                <span className="text-yellow-500 mr-2">→</span>
                Invitez plus de membres à rejoindre votre communauté
              </li>
              <li className="flex items-center">
                <span className="text-yellow-500 mr-2">→</span>
                Participez régulièrement aux jeux disponibles
              </li>
              <li className="flex items-center">
                <span className="text-yellow-500 mr-2">→</span>
                Profitez des bonus communautaires pour maximiser vos gains
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-lg p-6">
            <h3 className="text-xl font-bold text-white mb-4">Programme d'Affiliation</h3>
            <p className="text-gray-300 mb-4">
              Gagnez 10% sur le premier gain de chaque membre que vous parrainez dans votre communauté.
              Plus votre communauté grandit, plus vos gains augmentent !
            </p>
            <Link href="/communities/create">
              <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                CRÉER MA COMMUNAUTÉ
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
