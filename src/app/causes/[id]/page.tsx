"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Calendar, Users, DollarSign, Award, Trophy, CheckCircle } from 'lucide-react';
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
  createdAt: string;
  updatedAt: string;
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
    joinedAt: string;
    paymentDate: string | null;
    community: {
      id: string;
      name: string;
      imageUrl: string | null;
      cause: string;
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

export default function CauseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { data: session } = useSession();
  const { toast } = useToast();
  const [cause, setCause] = useState<Cause | null>(null);
  const [userCommunities, setUserCommunities] = useState<UserCommunity[]>([]);
  const [loading, setLoading] = useState(true);
  const [joiningCause, setJoiningCause] = useState(false);
  const [payingForCause, setPayingForCause] = useState(false);
  const [selectedCommunity, setSelectedCommunity] = useState<string | null>(null);

  // Charger les détails de la cause
  useEffect(() => {
    const fetchCause = async () => {
      try {
        const response = await fetch(`/api/causes/${params.id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch cause');
        }
        const data = await response.json();
        setCause(data.cause);
      } catch (error) {
        console.error('Error fetching cause:', error);
        toast({
          variant: 'destructive',
          title: 'Erreur',
          description: 'Impossible de charger les détails de la cause',
        });
      } finally {
        setLoading(false);
      }
    };

    fetchCause();
  }, [params.id, toast]);

  // Charger les communautés de l'utilisateur
  useEffect(() => {
    if (!session?.user) return;

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
  const handleJoinCause = async () => {
    if (!session?.user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour rejoindre une cause',
      });
      return;
    }

    if (!selectedCommunity) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Veuillez sélectionner une communauté',
      });
      return;
    }

    if (!cause) return;

    setJoiningCause(true);
    try {
      const response = await fetch(`/api/causes/${cause.id}/join`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ communityId: selectedCommunity }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to join cause');
      }

      const data = await response.json();
      
      // Mettre à jour la cause
      setCause({
        ...cause,
        competitions: [
          ...cause.competitions,
          {
            id: data.competition.id,
            communityId: selectedCommunity,
            hasPaid: false,
            hasWon: false,
            joinedAt: new Date().toISOString(),
            paymentDate: null,
            community: userCommunities.find(c => c.id === selectedCommunity) || {
              id: selectedCommunity,
              name: 'Communauté',
              imageUrl: null,
              cause: '',
            },
          },
        ],
        _count: {
          competitions: (cause._count?.competitions || 0) + 1,
        },
      });

      toast({
        title: 'Succès',
        description: 'Votre communauté a rejoint la cause avec succès',
      });
    } catch (error: Error | unknown) {
      console.error('Error joining cause:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage || 'Impossible de rejoindre la cause',
      });
    } finally {
      setJoiningCause(false);
    }
  };

  // Payer pour participer à une cause
  const handlePayForCause = async (competitionId: string) => {
    if (!session?.user) {
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Vous devez être connecté pour effectuer un paiement',
      });
      return;
    }

    if (!cause) return;

    setPayingForCause(true);
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
      
      // Mettre à jour la cause
      setCause({
        ...cause,
        competitions: cause.competitions.map(comp => {
          if (comp.id === competitionId) {
            return {
              ...comp,
              hasPaid: true,
              paymentDate: new Date().toISOString(),
            };
          }
          return comp;
        }),
      });

      toast({
        title: 'Succès',
        description: 'Paiement effectué avec succès',
      });
    } catch (error: Error | unknown) {
      console.error('Error paying for cause:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage || 'Impossible d\'effectuer le paiement',
      });
    } finally {
      setPayingForCause(false);
    }
  };

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

  // Vérifier si l'utilisateur est inscrit à cette cause avec une communauté
  const getUserCompetition = () => {
    if (!cause || !userCommunities.length) return null;
    
    const userCommunityIds = userCommunities.map(uc => uc.id);
    return cause.competitions.find(comp => userCommunityIds.includes(comp.communityId));
  };

  // Vérifier si la cause est complète
  const isCauseFull = cause && (cause._count?.competitions || 0) >= cause.maxCommunities;

  // Récupérer la compétition de l'utilisateur
  const userCompetition = getUserCompetition();

  // Vérifier si toutes les communautés ont payé
  const allCommunitiesPaid = cause?.competitions.every(comp => comp.hasPaid) && 
                           cause?.competitions.length === cause?.maxCommunities;

  // Vérifier si un gagnant a été déclaré
  const hasWinner = cause?.competitions.some(comp => comp.hasWon);

  // Récupérer la communauté gagnante
  const winnerCommunity = cause?.competitions.find(comp => comp.hasWon)?.community;

  if (loading) {
    return (
      <div className="container mx-auto py-8">
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      </div>
    );
  }

  if (!cause) {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center py-12 bg-muted rounded-lg">
          <p className="text-lg text-muted-foreground">Cause non trouvée</p>
          <Link href="/causes">
            <Button className="mt-4">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/causes">
          <Button variant="ghost" className="mr-4">
            <ChevronLeft size={16} className="mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{cause.name}</h1>
        <Badge className={`ml-4 ${
          cause.status === CauseStatus.PENDING ? 'bg-yellow-500' :
          cause.status === CauseStatus.ACTIVE ? 'bg-green-500' :
          cause.status === CauseStatus.COMPLETED ? 'bg-blue-500' :
          'bg-red-500'
        }`}>
          {cause.status === CauseStatus.PENDING ? 'À venir' :
           cause.status === CauseStatus.ACTIVE ? 'Active' :
           cause.status === CauseStatus.COMPLETED ? 'Terminée' :
           'Annulée'}
        </Badge>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <div className="relative h-64 w-full">
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
                  <span className="text-white text-4xl font-bold">{cause.name.charAt(0)}</span>
                </div>
              )}
            </div>

            <CardContent className="pt-6">
              <div className="prose max-w-none">
                <h2 className="text-2xl font-bold mb-4">Description</h2>
                <p className="text-gray-700">
                  {cause.description || "Aucune description disponible."}
                </p>

                <h2 className="text-2xl font-bold mt-8 mb-4">Détails</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <Calendar size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Date de début</p>
                      <p className="text-gray-600">{formatDate(cause.startDate)}</p>
                    </div>
                  </div>
                  
                  {cause.endDate && (
                    <div className="flex items-center gap-3">
                      <Calendar size={20} className="text-primary" />
                      <div>
                        <p className="font-medium">Date de fin</p>
                        <p className="text-gray-600">{formatDate(cause.endDate)}</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Montant cible</p>
                      <p className="text-gray-600">{formatAmount(cause.targetAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Award size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Prix à gagner</p>
                      <p className="text-gray-600">{formatAmount(cause.winningAmount)}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <Users size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Communautés</p>
                      <p className="text-gray-600">{cause._count?.competitions || 0} / {cause.maxCommunities}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <DollarSign size={20} className="text-primary" />
                    <div>
                      <p className="font-medium">Prix du pack</p>
                      <p className="text-gray-600">{cause.packPrice} points</p>
                    </div>
                  </div>
                </div>

                {cause.status === CauseStatus.COMPLETED && winnerCommunity && (
                  <div className="mt-8 p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
                    <h3 className="text-xl font-bold text-yellow-800 flex items-center mb-4">
                      <Trophy size={24} className="text-yellow-600 mr-2" />
                      Communauté gagnante
                    </h3>
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden bg-gray-200">
                        {winnerCommunity.imageUrl ? (
                          <Image
                            src={winnerCommunity.imageUrl}
                            alt={winnerCommunity.name}
                            width={64}
                            height={64}
                            className="object-cover"
                            unoptimized
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-yellow-500">
                            <span className="text-white text-2xl font-bold">{winnerCommunity.name.charAt(0)}</span>
                          </div>
                        )}
                      </div>
                      <div>
                        <h4 className="text-lg font-bold">{winnerCommunity.name}</h4>
                        <p className="text-gray-600">{winnerCommunity.cause}</p>
                        <p className="text-yellow-700 font-medium mt-1">
                          A remporté {formatAmount(cause.winningAmount)}
                        </p>
                      </div>
                    </div>
                    <Link href={`/communities/${winnerCommunity.id}`} className="mt-4 inline-block">
                      <Button variant="outline" className="mt-4">
                        Voir la communauté
                      </Button>
                    </Link>
                  </div>
                )}

                {cause.status === CauseStatus.ACTIVE && !userCompetition && !isCauseFull && (
                  <div className="mt-8">
                    <h3 className="text-xl font-bold mb-4">Rejoindre cette cause</h3>
                    
                    {!session ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 mb-4">
                          Connectez-vous pour rejoindre cette cause avec votre communauté.
                        </p>
                        <Link href="/auth/login">
                          <Button>Se connecter</Button>
                        </Link>
                      </div>
                    ) : userCommunities.length === 0 ? (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 mb-4">
                          Vous devez d'abord rejoindre ou créer une communauté pour participer.
                        </p>
                        <Link href="/communities">
                          <Button>Explorer les communautés</Button>
                        </Link>
                      </div>
                    ) : (
                      <div className="p-4 bg-gray-50 rounded-lg">
                        <p className="text-gray-700 mb-4">
                          Sélectionnez une communauté pour participer à cette cause:
                        </p>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                          {userCommunities.map((community) => (
                            <div
                              key={community.id}
                              className={`p-4 rounded-lg cursor-pointer flex items-center ${
                                selectedCommunity === community.id
                                  ? 'bg-primary-50 border border-primary-200'
                                  : 'bg-white border border-gray-200 hover:border-primary-200'
                              }`}
                              onClick={() => setSelectedCommunity(community.id)}
                            >
                              <div className="w-12 h-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                                {community.imageUrl ? (
                                  <Image
                                    src={community.imageUrl}
                                    alt={community.name}
                                    width={48}
                                    height={48}
                                    className="object-cover"
                                    unoptimized
                                  />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-primary">
                                    <span className="text-white font-bold">{community.name.charAt(0)}</span>
                                  </div>
                                )}
                              </div>
                              <div className="flex-1">
                                <h4 className="font-medium">{community.name}</h4>
                                <p className="text-sm text-gray-500">{community.cause}</p>
                              </div>
                              <div className="ml-2">
                                <div className={`w-6 h-6 rounded-full flex items-center justify-center ${
                                  selectedCommunity === community.id
                                    ? 'bg-primary text-white'
                                    : 'border border-gray-300'
                                }`}>
                                  {selectedCommunity === community.id && (
                                    <CheckCircle size={16} />
                                  )}
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                        <Button
                          onClick={handleJoinCause}
                          disabled={!selectedCommunity || joiningCause}
                          className="w-full"
                        >
                          {joiningCause ? 'Inscription en cours...' : 'Rejoindre la cause'}
                        </Button>
                        <p className="text-sm text-gray-500 mt-2">
                          En rejoignant, vous vous engagez à payer {cause.packPrice} points pour participer.
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {userCompetition && !userCompetition.hasPaid && (
                  <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <h3 className="text-xl font-bold text-blue-800 mb-2">Finaliser votre participation</h3>
                    <p className="text-blue-700 mb-4">
                      Votre communauté est inscrite à cette cause. Pour confirmer votre participation, veuillez effectuer le paiement.
                    </p>
                    <Button
                      onClick={() => handlePayForCause(userCompetition.id)}
                      disabled={payingForCause}
                      className="w-full"
                    >
                      {payingForCause ? 'Paiement en cours...' : `Payer ${cause.packPrice} points`}
                    </Button>
                  </div>
                )}

                {userCompetition && userCompetition.hasPaid && (
                  <div className="mt-8 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h3 className="text-xl font-bold text-green-800 mb-2">Participation confirmée</h3>
                    <p className="text-green-700">
                      Votre communauté participe à cette cause. {
                        allCommunitiesPaid
                          ? 'La compétition est prête à commencer !'
                          : 'Nous attendons que toutes les communautés complètent leur paiement.'
                      }
                    </p>
                    {allCommunitiesPaid && (
                      <div className="mt-4">
                        <Link href="/games/community-jackpot">
                          <Button className="w-full">
                            Jouer au Jackpot Communautaire
                          </Button>
                        </Link>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card>
            <CardHeader>
              <CardTitle>Communautés participantes</CardTitle>
            </CardHeader>
            <CardContent>
              {cause.competitions.length === 0 ? (
                <p className="text-gray-500 text-center py-4">
                  Aucune communauté inscrite pour le moment.
                </p>
              ) : (
                <div className="space-y-4">
                  {cause.competitions.map((competition) => (
                    <div 
                      key={competition.id} 
                      className={`p-4 rounded-lg border ${competition.hasWon ? 'border-yellow-400 bg-yellow-50' : 'border-gray-200'}`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full overflow-hidden bg-gray-200 flex-shrink-0">
                          {competition.community.imageUrl ? (
                            <Image
                              src={competition.community.imageUrl}
                              alt={competition.community.name}
                              width={40}
                              height={40}
                              className="object-cover"
                              unoptimized
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-primary">
                              <span className="text-white font-bold">{competition.community.name.charAt(0)}</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-1">
                          <h3 className="font-medium">{competition.community.name}</h3>
                          <p className="text-sm text-gray-500">{competition.community.cause}</p>
                        </div>
                        {competition.hasWon && (
                          <Trophy size={24} className="text-yellow-500" />
                        )}
                      </div>
                      
                      <div className="mt-3 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-gray-500">
                            Inscrit le {formatDate(competition.joinedAt)}
                          </p>
                          {competition.paymentDate && (
                            <p className="text-xs text-gray-500">
                              Payé le {formatDate(competition.paymentDate)}
                            </p>
                          )}
                        </div>
                        <Badge variant={competition.hasPaid ? "success" : "outline"}>
                          {competition.hasPaid ? 'Payé' : 'En attente'}
                        </Badge>
                      </div>
                      
                      <div className="mt-3">
                        <Link href={`/communities/${competition.community.id}`}>
                          <Button variant="outline" size="sm" className="w-full">
                            Voir la communauté
                          </Button>
                        </Link>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              <div className="mt-6">
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-primary h-2.5 rounded-full" 
                    style={{ width: `${Math.min(((cause._count?.competitions || 0) / cause.maxCommunities) * 100, 100)}%` }}
                  ></div>
                </div>
                <p className="text-sm text-gray-500 mt-2">
                  {cause._count?.competitions || 0} / {cause.maxCommunities} communautés participantes
                </p>
              </div>

              {cause.status === CauseStatus.ACTIVE && (
                <div className="mt-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
                  <h3 className="font-medium text-blue-800 mb-2">État de la compétition</h3>
                  {allCommunitiesPaid ? (
                    <p className="text-blue-700 text-sm">
                      Toutes les communautés ont payé. La compétition peut commencer !
                    </p>
                  ) : (
                    <p className="text-blue-700 text-sm">
                      En attente du paiement de toutes les communautés ({cause.competitions.filter(c => c.hasPaid).length}/{cause.maxCommunities}).
                    </p>
                  )}
                </div>
              )}

              {cause.status === CauseStatus.COMPLETED && (
                <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                  <h3 className="font-medium text-green-800 mb-2">Compétition terminée</h3>
                  <p className="text-green-700 text-sm">
                    Cette cause a été complétée avec succès.
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
