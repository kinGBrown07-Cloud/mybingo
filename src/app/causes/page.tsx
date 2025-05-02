"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Calendar, Users, DollarSign, Award, HandHeart } from 'lucide-react';
// Définition manuelle de CauseStatus pour éviter l'erreur d'importation
enum CauseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}
import { useSession } from 'next-auth/react';

// Type pour les causes
type Cause = {
  id: string;
  name: string;
  description: string | null;
  targetAmount: number;
  currentAmount: number;
  imageUrl: string | null;
  startDate: string;
  endDate: string | null;
  isActive: boolean;
  maxCommunities: number;
  packPrice: number;
  winningAmount: number;
  status: CauseStatus;
  _count?: {
    competitions: number;
  };
  competitions: Array<{
    id: string;
    communityId: string;
    hasPaid: boolean;
    hasWon: boolean;
    community: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  }>;
};

// Type pour les communautés de l'utilisateur
type UserCommunity = {
  id: string;
  name: string;
  cause: string;
  imageUrl: string | null;
  role: string;
};

export default function CausesPage() {
  const session = useSession();
  const { toast } = useToast();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCause, setJoiningCause] = useState<string | null>(null);
  const [payingForCause, setPayingForCause] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('active');

  // Charger les causes
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const response = await fetch('/api/causes');
        if (!response.ok) {
          throw new Error('Failed to fetch causes');
        }
        const data = await response.json();
        setCauses(data.causes);
      } catch (error) {
        console.error('Error fetching causes:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les causes',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCauses();
  }, [toast]);

  // Charger les communautés de l'utilisateur
  useEffect(() => {
    if (!session?.data?.user) return;

    const fetchUserCommunities = async () => {
      try {
        const response = await fetch('/api/users/me/communities');
        if (!response.ok) {
          throw new Error('Failed to fetch user communities');
        }
        const data = await response.json();
        setUserCommunities(data.communities || []);
      } catch (error) {
        console.error('Error fetching user communities:', error);
      }
    };

    fetchUserCommunities();
  }, [session]);

  // Rejoindre une cause
  const handleJoinCause = async (causeId: string, communityId: string) => {
    if (!session?.data?.user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour rejoindre une cause',
      });
      return;
    }

    setJoiningCause(causeId);
    try {
      const response = await fetch(`/api/causes/${causeId}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ communityId }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join cause');
      }

      const data = await response.json();
      
      // Mettre à jour la liste des causes
      setCauses(causes.map(cause => {
        if (cause.id === causeId) {
          return {
            ...cause,
            competitions: [
              ...cause.competitions,
              {
                id: data.competition.id,
                communityId,
                hasPaid: false,
                hasWon: false,
                community: userCommunities.find(c => c.id === communityId) || {
                  id: communityId,
                  name: 'Communauté',
                  imageUrl: null,
                },
              },
            ],
            _count: {
              competitions: (cause._count?.competitions || 0) + 1,
            },
          };
        }
        return cause;
      }));

      toast({
        title: 'Succès',
        description: 'Votre communauté a rejoint la cause avec succès',
      });
    } catch (error: unknown) {
      console.error('Error joining cause:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage || 'Impossible de rejoindre la cause',
      });
    } finally {
      setJoiningCause(null);
    }
  };

  // Payer pour participer à une cause
  const handlePayForCause = async (competitionId: string) => {
    if (!session?.data?.user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer un paiement',
      });
      return;
    }

    setPayingForCause(competitionId);
    try {
      const response = await fetch(`/api/competitions/${competitionId}/pay`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to process payment');
      }

      const data = await response.json();
      
      // Mettre à jour la liste des causes
      setCauses(causes.map(cause => {
        return {
          ...cause,
          competitions: cause.competitions.map(comp => {
            if (comp.id === competitionId) {
              return {
                ...comp,
                hasPaid: true,
              };
            }
            return comp;
          }),
        };
      }));

      toast({
        title: 'Succès',
        description: 'Paiement effectué avec succès',
      });
    } catch (error: unknown) {
      console.error('Error paying for cause:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage || 'Impossible d\'effectuer le paiement',
      });
    } finally {
      setPayingForCause(null);
    }
  };

  // Filtrer les causes selon l'onglet actif
  const filteredCauses = causes.filter(cause => {
    if (activeTab === 'active') return cause.status === CauseStatus.ACTIVE;
    if (activeTab === 'pending') return cause.status === CauseStatus.PENDING;
    if (activeTab === 'completed') return cause.status === CauseStatus.COMPLETED;
    return true;
  });

  // Formater un montant en euros
  const formatAmount = (amount: number) => {
    return new Intl.NumberFormat('fr-FR', { style: 'currency', currency: 'EUR' }).format(amount);
  };

  // Formater une date
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('fr-FR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Vérifier si l'utilisateur est inscrit à une cause avec une communauté
  const isUserJoinedCause = (causeId: string) => {
    const cause = causes.find(c => c.id === causeId);
    if (!cause) return false;
    
    return cause.competitions.some(comp => 
      userCommunities.some(uc => uc.id === comp.communityId)
    );
  };

  // Trouver la compétition de l'utilisateur pour une cause
  const getUserCompetition = (causeId: string) => {
    const cause = causes.find(c => c.id === causeId);
    if (!cause) return null;
    
    const userCommunityIds = userCommunities.map(uc => uc.id);
    return cause.competitions.find(comp => userCommunityIds.includes(comp.communityId));
  };

  return (
    <div className="container mx-auto py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">Jeux pour une Cause</h1>
        <p className="text-lg text-gray-600 max-w-3xl mx-auto">
          Rejoignez une cause avec votre communauté et participez à des compétitions pour gagner des fonds pour votre cause.
        </p>
      </div>

      <Tabs defaultValue="active" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-3 mb-4 w-full max-w-md mx-auto">
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="pending">À venir</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCauses.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">Aucune cause trouvée dans cette catégorie</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCauses.map((cause) => {
                const userCompetition = getUserCompetition(cause.id);
                const isJoined = !!userCompetition;
                const hasPaid = userCompetition?.hasPaid;
                const isFull = (cause._count?.competitions || 0) >= cause.maxCommunities;
                
                return (
                  <Card key={cause.id} className="overflow-hidden">
                    <div className="relative h-48 w-full">
                      {cause.imageUrl ? (
                        <Image
                          src={cause.imageUrl}
                          alt={cause.name}
                          fill
                          className="object-cover"
                          unoptimized
                        />
                      ) : (
                        <div className="absolute inset-0 bg-gradient-to-r from-purple-500 to-indigo-500 flex items-center justify-center">
                          <span className="text-white text-2xl font-bold">{cause.name.charAt(0)}</span>
                        </div>
                      )}
                    </div>

                    <CardHeader>
                      <CardTitle>{cause.name}</CardTitle>
                      <CardDescription>
                        {cause.description?.substring(0, 100)}
                        {cause.description && cause.description.length > 100 ? '...' : ''}
                      </CardDescription>
                    </CardHeader>

                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <Calendar size={16} className="text-muted-foreground" />
                          <span className="text-sm">
                            Début: {formatDate(cause.startDate)}
                          </span>
                        </div>
                        {cause.endDate && (
                          <div className="flex items-center gap-2">
                            <Calendar size={16} className="text-muted-foreground" />
                            <span className="text-sm">
                              Fin: {formatDate(cause.endDate)}
                            </span>
                          </div>
                        )}
                        <div className="flex items-center gap-2">
                          <Award size={16} className="text-muted-foreground" />
                          <span className="text-sm">
                            Prix à gagner: {formatAmount(cause.winningAmount)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <DollarSign size={16} className="text-muted-foreground" />
                          <span className="text-sm">
                            Prix du pack: {cause.packPrice} points
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-muted-foreground" />
                          <span className="text-sm">
                            Communautés: {cause._count?.competitions || 0} / {cause.maxCommunities}
                          </span>
                        </div>
                      </div>

                      {cause.status === CauseStatus.ACTIVE && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-200 rounded-full h-2.5">
                            <div 
                              className="bg-primary h-2.5 rounded-full" 
                              style={{ width: `${Math.min(((cause._count?.competitions || 0) / cause.maxCommunities) * 100, 100)}%` }}
                            ></div>
                          </div>
                          <p className="text-xs text-gray-500 mt-1">
                            {isFull 
                              ? 'Toutes les places sont prises !' 
                              : `${cause.maxCommunities - (cause._count?.competitions || 0)} places restantes`}
                          </p>
                        </div>
                      )}

                      {cause.status === CauseStatus.COMPLETED && (
                        <div className="mt-4 p-3 bg-green-50 rounded-lg border border-green-200">
                          <p className="text-sm text-green-800 flex items-center">
                            <HandHeart size={16} className="mr-2" />
                            Cette cause a été complétée avec succès !
                          </p>
                        </div>
                      )}
                    </CardContent>

                    <CardFooter>
                      {!session?.data?.user ? (
                        <Link href="/auth/login" className="w-full">
                          <Button variant="outline" className="w-full">
                            Connectez-vous pour participer
                          </Button>
                        </Link>
                      ) : userCommunities.length === 0 ? (
                        <Link href="/communities" className="w-full">
                          <Button variant="outline" className="w-full">
                            Rejoignez une communauté d'abord
                          </Button>
                        </Link>
                      ) : cause.status === CauseStatus.ACTIVE ? (
                        isJoined ? (
                          hasPaid ? (
                            <Button disabled className="w-full bg-green-500">
                              Participation confirmée
                            </Button>
                          ) : (
                            <Button 
                              onClick={() => handlePayForCause(userCompetition.id)}
                              disabled={payingForCause === userCompetition.id}
                              className="w-full"
                            >
                              {payingForCause === userCompetition.id 
                                ? 'Paiement en cours...' 
                                : `Payer ${cause.packPrice} points`}
                            </Button>
                          )
                        ) : isFull ? (
                          <Button disabled className="w-full">
                            Complet
                          </Button>
                        ) : userCommunities.length === 1 ? (
                          <Button 
                            onClick={() => handleJoinCause(cause.id, userCommunities[0].id)}
                            disabled={joiningCause === cause.id}
                            className="w-full"
                          >
                            {joiningCause === cause.id 
                              ? 'Inscription en cours...' 
                              : 'Rejoindre avec votre communauté'}
                          </Button>
                        ) : (
                          <Link href={`/causes/${cause.id}/join`} className="w-full">
                            <Button className="w-full">
                              Choisir une communauté
                            </Button>
                          </Link>
                        )
                      ) : cause.status === CauseStatus.COMPLETED ? (
                        <Link href={`/causes/${cause.id}`} className="w-full">
                          <Button variant="outline" className="w-full">
                            Voir les résultats
                          </Button>
                        </Link>
                      ) : (
                        <Button disabled className="w-full">
                          Bientôt disponible
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                );
              })}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
