"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';

type Community = {
  id: string;
  name: string;
  cause: string;
  totalEarnings: number;
};

export function TopCommunities() {
  const [communities, setCommunities] = useState<Community[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopCommunities = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/communities/leaderboard?limit=2');
        
        if (!response.ok) {
          throw new Error('Failed to fetch top communities');
        }
        
        const data = await response.json();
        setCommunities(data.communities);
      } catch (err) {
        console.error('Error fetching top communities:', err);
        setError('Failed to load top communities');
      } finally {
        setLoading(false);
      }
    };

    fetchTopCommunities();
  }, []);

  // Fallback data in case API fails
  const fallbackCommunities = [
    {
      id: "1",
      name: "Save The Ocean",
      cause: "Protection des océans",
      totalEarnings: 15320
    },
    {
      id: "2",
      name: "Green Earth",
      cause: "Reforestation",
      totalEarnings: 12750
    }
  ];

  // Use fallback data if API fails
  const displayCommunities = communities.length > 0 ? communities : fallbackCommunities;

  if (loading) {
    return (
      <div className="flex justify-center items-center py-4">
        <div className="animate-spin rounded-full h-6 w-6 border-t-2 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <>
      {displayCommunities.map((community, index) => (
        <Link href={`/communities/${community.id}`} key={community.id}>
          <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg hover:bg-black/50 transition-colors cursor-pointer">
            <div className="flex items-center">
              <span className={`${index === 0 ? 'text-yellow-500' : 'text-gray-400'} font-bold mr-3`}>{index + 1}</span>
              <div>
                <p className="text-white font-medium">{community.name}</p>
                <p className="text-sm text-gray-400">{community.cause}</p>
              </div>
            </div>
            <div className="flex items-center">
              <Image
                src="/images/icons/money/coins.png"
                alt="Coins Icon"
                width={24}
                height={24}
                className="mr-2"
              />
              <span className="text-emerald-400 font-bold">{community.totalEarnings.toLocaleString('fr-FR')}€</span>
            </div>
          </div>
        </Link>
      ))}
    </>
  );
}
