"use client";

import React, { useState, useEffect } from 'react';
import { CommunityNav } from '@/components/community-nav';
import { Button } from '@/components/ui/button';
import Image from 'next/image';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';
import Link from 'next/link';

type CommunityMember = {
  id: string;
  userId: string;
  role: string;
  joinedAt: string;
  user: {
    username: string;
    profile: {
      avatarUrl: string | null;
    } | null;
  };
};

type CommunityTransaction = {
  id: string;
  amount: number;
  type: string;
  createdAt: string;
  description: string | null;
  user: {
    username: string;
  };
};

type Community = {
  id: string;
  name: string;
  description: string | null;
  cause: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string | null;
  createdAt: string;
  members: CommunityMember[];
  _count: {
    members: number;
  };
  totalEarnings: number;
};

export default function CommunityDetail({ params }: { params: { id: string } }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [community, setCommunity] = useState<Community | null>(null);
  const [transactions, setTransactions] = useState<CommunityTransaction[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMember, setIsMember] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const fetchCommunity = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/communities/${params.id}`);
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Communauté introuvable');
          }
          throw new Error('Erreur lors du chargement de la communauté');
        }
        
        const data = await response.json();
        setCommunity(data.community);
        
        // Check if user is a member
        if (session?.user?.id) {
          const userMembership = data.community.members.find(
            (member: CommunityMember) => member.userId === session.user.id
          );
          
          setIsMember(!!userMembership);
          setIsAdmin(userMembership?.role === 'ADMIN');
        }
        
        // Fetch transactions
        const transactionsResponse = await fetch(`/api/communities/${params.id}/transactions`);
        if (transactionsResponse.ok) {
          const transactionsData = await transactionsResponse.json();
          setTransactions(transactionsData.transactions);
        }
      } catch (err: Error | unknown) {
        console.error('Error fetching community:', err);
        const errorMessage = err instanceof Error ? err.message : 'Une erreur est survenue';
        setError(errorMessage);
      } finally {
        setLoading(false);
      }
    };

    if (params.id) {
      fetchCommunity();
    }
  }, [params.id, session?.user?.id]);

  const handleJoinCommunity = async () => {
    if (!session) {
      toast.error('Vous devez être connecté pour rejoindre une communauté');
      router.push('/auth/login');
      return;
    }

    try {
      const response = await fetch(`/api/communities/${params.id}/members`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la tentative de rejoindre la communauté');
      }

      toast.success('Vous avez rejoint la communauté avec succès!');
      setIsMember(true);
      
      // Refresh community data
      const communityResponse = await fetch(`/api/communities/${params.id}`);
      if (communityResponse.ok) {
        const communityData = await communityResponse.json();
        setCommunity(communityData.community);
      }
    } catch (err: Error | unknown) {
      console.error('Error joining community:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la tentative de rejoindre la communauté';
      toast.error(errorMessage);
    }
  };

  const handleLeaveCommunity = async () => {
    if (!session) {
      return;
    }

    try {
      const response = await fetch(`/api/communities/${params.id}/members`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la tentative de quitter la communauté');
      }

      toast.success('Vous avez quitté la communauté');
      setIsMember(false);
      setIsAdmin(false);
      
      // Refresh community data
      const communityResponse = await fetch(`/api/communities/${params.id}`);
      if (communityResponse.ok) {
        const communityData = await communityResponse.json();
        setCommunity(communityData.community);
      }
    } catch (err: Error | unknown) {
      console.error('Error leaving community:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la tentative de quitter la communauté';
      toast.error(errorMessage);
    }
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background">
        <CommunityNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="flex justify-center items-center py-20">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-500"></div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !community) {
    return (
      <main className="min-h-screen bg-background">
        <CommunityNav />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
          <div className="text-center py-10">
            <h2 className="text-2xl font-bold text-white mb-4">
              {error || 'Communauté introuvable'}
            </h2>
            <p className="text-gray-400 mb-8">
              La communauté que vous recherchez n'existe pas ou a été supprimée.
            </p>
            <Link href="/communities">
              <Button className="bg-purple-500 hover:bg-purple-600 text-white">
                Retour aux communautés
              </Button>
            </Link>
          </div>
        </div>
      </main>
    );
  }

  const progressPercentage = Math.min(
    Math.round((community.currentAmount / community.targetAmount) * 100),
    100
  );

  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        {/* Community Header */}
        <div className="relative h-64 md:h-80 rounded-xl overflow-hidden mb-8">
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent z-10" />
          <Image
            src={community.imageUrl || '/images/default-community.jpg'}
            alt={community.name}
            fill
            className="object-cover"
            unoptimized
          />
          <div className="absolute bottom-8 left-8 right-8 z-20">
            <div className="flex justify-between items-end">
              <div>
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">{community.name}</h1>
                <p className="text-xl text-purple-300">{community.cause}</p>
              </div>
              <div className="hidden md:block">
                {isMember ? (
                  <Button 
                    onClick={handleLeaveCommunity}
                    className="bg-red-500 hover:bg-red-600 text-white"
                  >
                    Quitter la communauté
                  </Button>
                ) : (
                  <Button 
                    onClick={handleJoinCommunity}
                    className="bg-purple-500 hover:bg-purple-600 text-white"
                  >
                    Rejoindre la communauté
                  </Button>
                )}
              </div>
            </div>
          </div>
        </div>
        
        {/* Mobile Join Button */}
        <div className="md:hidden mb-6">
          {isMember ? (
            <Button 
              onClick={handleLeaveCommunity}
              className="w-full bg-red-500 hover:bg-red-600 text-white py-4"
            >
              Quitter la communauté
            </Button>
          ) : (
            <Button 
              onClick={handleJoinCommunity}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-4"
            >
              Rejoindre la communauté
            </Button>
          )}
        </div>
        
        {/* Community Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Membres</h3>
            <p className="text-3xl font-bold text-white">{community._count.members}</p>
          </div>
          
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Gains totaux</h3>
            <p className="text-3xl font-bold text-emerald-400">{community.totalEarnings.toLocaleString('fr-FR')}€</p>
          </div>
          
          <div className="bg-zinc-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-gray-400 mb-2">Objectif</h3>
            <p className="text-3xl font-bold text-white">{community.targetAmount.toLocaleString('fr-FR')}€</p>
          </div>
        </div>
        
        {/* Progress Bar */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-10">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-lg font-semibold text-white">Progression</h3>
            <span className="text-purple-400 font-bold">{progressPercentage}%</span>
          </div>
          <div className="w-full bg-zinc-700 rounded-full h-4">
            <div 
              className="bg-gradient-to-r from-purple-500 to-indigo-500 h-4 rounded-full" 
              style={{ width: `${progressPercentage}%` }}
            ></div>
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-gray-400">{community.currentAmount.toLocaleString('fr-FR')}€ collectés</span>
            <span className="text-gray-400">Objectif: {community.targetAmount.toLocaleString('fr-FR')}€</span>
          </div>
        </div>
        
        {/* Description */}
        {community.description && (
          <div className="bg-zinc-800 rounded-xl p-6 mb-10">
            <h2 className="text-2xl font-bold text-white mb-4">À propos de cette communauté</h2>
            <p className="text-gray-300 whitespace-pre-wrap">{community.description}</p>
          </div>
        )}
        
        {/* Members */}
        <div className="bg-zinc-800 rounded-xl p-6 mb-10">
          <h2 className="text-2xl font-bold text-white mb-6">Membres ({community._count.members})</h2>
          
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {community.members.map((member) => (
              <div key={member.id} className="flex items-center space-x-3 p-3 bg-zinc-700 rounded-lg">
                <div className="relative w-10 h-10 rounded-full overflow-hidden bg-zinc-600">
                  {member.user.profile?.avatarUrl ? (
                    <Image
                      src={member.user.profile.avatarUrl}
                      alt={member.user.username}
                      fill
                      className="object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full text-white">
                      {member.user.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div>
                  <p className="text-white font-medium">{member.user.username}</p>
                  <p className="text-xs text-gray-400">
                    {member.role === 'ADMIN' ? 'Admin' : 
                     member.role === 'MODERATOR' ? 'Modérateur' : 'Membre'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Transactions */}
        {transactions.length > 0 && (
          <div className="bg-zinc-800 rounded-xl p-6 mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Activité récente</h2>
            
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between p-3 bg-zinc-700 rounded-lg">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      transaction.type === 'GAME_WIN' ? 'bg-emerald-500/20 text-emerald-400' :
                      transaction.type === 'CONTRIBUTION' ? 'bg-blue-500/20 text-blue-400' :
                      transaction.type === 'WITHDRAWAL' ? 'bg-red-500/20 text-red-400' :
                      'bg-purple-500/20 text-purple-400'
                    }`}>
                      {transaction.type === 'GAME_WIN' ? '🎮' :
                       transaction.type === 'CONTRIBUTION' ? '💰' :
                       transaction.type === 'WITHDRAWAL' ? '📤' : '🎁'}
                    </div>
                    <div>
                      <p className="text-white font-medium">
                        {transaction.type === 'GAME_WIN' ? 'Gain de jeu' :
                         transaction.type === 'CONTRIBUTION' ? 'Contribution' :
                         transaction.type === 'WITHDRAWAL' ? 'Retrait' : 'Bonus'}
                      </p>
                      <p className="text-xs text-gray-400">
                        {transaction.user.username} • {new Date(transaction.createdAt).toLocaleDateString('fr-FR')}
                      </p>
                      {transaction.description && (
                        <p className="text-xs text-gray-300 mt-1">{transaction.description}</p>
                      )}
                    </div>
                  </div>
                  <div className={`font-bold ${
                    transaction.type === 'WITHDRAWAL' ? 'text-red-400' : 'text-emerald-400'
                  }`}>
                    {transaction.type === 'WITHDRAWAL' ? '-' : '+'}{transaction.amount.toLocaleString('fr-FR')}€
                  </div>
                </div>
              ))}
            </div>
            
            {transactions.length > 5 && (
              <div className="mt-4 text-center">
                <Button className="bg-zinc-700 hover:bg-zinc-600 text-white">
                  Voir toutes les transactions
                </Button>
              </div>
            )}
          </div>
        )}
        
        {/* Admin Actions */}
        {isAdmin && (
          <div className="bg-zinc-800 rounded-xl p-6 mb-10">
            <h2 className="text-2xl font-bold text-white mb-6">Administration</h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Link href={`/communities/${community.id}/edit`}>
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                  Modifier la communauté
                </Button>
              </Link>
              
              <Link href={`/communities/${community.id}/members`}>
                <Button className="w-full bg-zinc-700 hover:bg-zinc-600 text-white">
                  Gérer les membres
                </Button>
              </Link>
            </div>
          </div>
        )}
        
        {/* Play for this community */}
        <div className="bg-gradient-to-r from-purple-900 to-indigo-900 rounded-xl p-8 text-center">
          <h2 className="text-2xl font-bold text-white mb-4">
            Jouez pour cette communauté !
          </h2>
          <p className="text-gray-300 mb-6 max-w-2xl mx-auto">
            Chaque partie que vous jouez en tant que membre contribue à l'objectif de la communauté.
            Plus vous jouez, plus vous avez de chances de faire gagner votre cause !
          </p>
          <Link href="/game">
            <Button className="bg-purple-500 hover:bg-purple-600 text-white px-8 py-6">
              JOUER MAINTENANT
            </Button>
          </Link>
        </div>
      </div>
    </main>
  );
}
