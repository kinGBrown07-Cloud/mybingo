"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Calendar, Users, DollarSign, Award, CheckCircle, Trophy } from 'lucide-react';
// Définition manuelle de CauseStatus pour éviter l'erreur d'importation
enum CauseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

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

export default function CauseDetailPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const { toast } = useToast();
  const [cause, setCause] = useState<Cause | null>(null);
  const [loading, setLoading] = useState(true);
  const [activatingCause, setActivatingCause] = useState(false);
  const [declaringWinner, setDeclaringWinner] = useState(false);

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

  // Activer une cause
  const handleActivateCause = async () => {
    if (!cause) return;
    
    setActivatingCause(true);
    try {
      const response = await fetch(`/api/causes/${cause.id}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to activate cause');
      }

      const data = await response.json();
      
      // Mettre à jour la cause
      setCause({
        ...cause,
        status: CauseStatus.ACTIVE,
        isActive: true
      });

      toast({
        title: 'Succès',
        description: 'La cause a été activée avec succès',
      });
    } catch (error) {
      console.error('Error activating cause:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible d\'activer la cause',
      });
    } finally {
      setActivatingCause(false);
    }
  };

  // Déclarer une communauté gagnante
  const handleDeclareWinner = async (competitionId: string) => {
    setDeclaringWinner(true);
    try {
      const response = await fetch(`/api/competitions/${competitionId}/winner`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to declare winner');
      }

      const data = await response.json();
      
      // Mettre à jour la cause
      if (cause) {
        setCause({
          ...cause,
          status: CauseStatus.COMPLETED,
          competitions: cause.competitions.map(comp => 
            comp.id === competitionId 
              ? { ...comp, hasWon: true } 
              : comp
          )
        });
      }

      toast({
        title: 'Succès',
        description: 'Le gagnant a été déclaré avec succès',
      });
    } catch (error) {
      console.error('Error declaring winner:', error);
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: 'Impossible de déclarer le gagnant',
      });
    } finally {
      setDeclaringWinner(false);
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

  // Obtenir la couleur du badge selon le statut
  const getStatusBadgeColor = (status: CauseStatus) => {
    switch (status) {
      case CauseStatus.PENDING:
        return 'bg-yellow-500';
      case CauseStatus.ACTIVE:
        return 'bg-green-500';
      case CauseStatus.COMPLETED:
        return 'bg-blue-500';
      case CauseStatus.CANCELLED:
        return 'bg-red-500';
      default:
        return 'bg-gray-500';
    }
  };

  // Obtenir le texte du badge selon le statut
  const getStatusBadgeText = (status: CauseStatus) => {
    switch (status) {
      case CauseStatus.PENDING:
        return 'En attente';
      case CauseStatus.ACTIVE:
        return 'Active';
      case CauseStatus.COMPLETED:
        return 'Terminée';
      case CauseStatus.CANCELLED:
        return 'Annulée';
      default:
        return 'Inconnu';
    }
  };

  // Vérifier si toutes les communautés ont payé
  const allCommunitiesPaid = cause?.competitions.every(comp => comp.hasPaid) && 
                           cause?.competitions.length === cause?.maxCommunities;

  // Vérifier si un gagnant a été déclaré
  const hasWinner = cause?.competitions.some(comp => comp.hasWon);

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
          <Link href="/admin/causes">
            <Button className="mt-4">Retour à la liste</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/causes">
          <Button variant="ghost" className="mr-4">
            <ChevronLeft size={16} className="mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">{cause.name}</h1>
        <Badge className={`ml-4 ${getStatusBadgeColor(cause.status)}`}>
          {getStatusBadgeText(cause.status)}
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

                {cause.status === CauseStatus.PENDING && (
                  <div className="mt-8">
                    <Button 
                      onClick={handleActivateCause}
                      disabled={activatingCause}
                      className="w-full"
                    >
                      <CheckCircle size={16} className="mr-2" />
                      {activatingCause ? 'Activation en cours...' : 'Activer cette cause'}
                    </Button>
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
                      
                      {cause.status === CauseStatus.ACTIVE && 
                       competition.hasPaid && 
                       !hasWinner && 
                       allCommunitiesPaid && (
                        <div className="mt-3">
                          <Button 
                            onClick={() => handleDeclareWinner(competition.id)}
                            disabled={declaringWinner}
                            size="sm"
                            className="w-full"
                          >
                            <Trophy size={16} className="mr-2" />
                            Déclarer gagnant
                          </Button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

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
