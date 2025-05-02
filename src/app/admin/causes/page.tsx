"use client";

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { PlusCircle, Edit, Calendar, Users, DollarSign, Award, CheckCircle, XCircle } from 'lucide-react';
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
    community: {
      id: string;
      name: string;
      imageUrl: string | null;
    };
  }>;
};

export default function AdminCausesPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [causes, setCauses] = useState<Cause[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  // Charger les causes
  useEffect(() => {
    const fetchCauses = async () => {
      try {
        const response = await fetch('/api/causes?includeInactive=true');
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

  // Activer une cause
  const handleActivateCause = async (causeId: string) => {
    try {
      const response = await fetch(`/api/causes/${causeId}/activate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error('Failed to activate cause');
      }

      const data = await response.json();
      
      // Mettre à jour la liste des causes
      setCauses(causes.map(cause => 
        cause.id === causeId ? { ...cause, status: CauseStatus.ACTIVE, isActive: true } : cause
      ));

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
    }
  };

  // Filtrer les causes selon l'onglet actif
  const filteredCauses = causes.filter(cause => {
    if (activeTab === 'all') return true;
    if (activeTab === 'pending') return cause.status === CauseStatus.PENDING;
    if (activeTab === 'active') return cause.status === CauseStatus.ACTIVE;
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

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Administration des Causes</h1>
        <Link href="/admin/causes/create">
          <Button className="flex items-center gap-2">
            <PlusCircle size={16} />
            Créer une cause
          </Button>
        </Link>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <TabsList className="grid grid-cols-4 mb-4">
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="pending">En attente</TabsTrigger>
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="completed">Terminées</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab}>
          {loading ? (
            <div className="flex justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : filteredCauses.length === 0 ? (
            <div className="text-center py-12 bg-muted rounded-lg">
              <p className="text-lg text-muted-foreground">Aucune cause trouvée</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredCauses.map((cause) => (
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
                    <div className="absolute top-2 right-2">
                      <Badge className={getStatusBadgeColor(cause.status)}>
                        {getStatusBadgeText(cause.status)}
                      </Badge>
                    </div>
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
                        <DollarSign size={16} className="text-muted-foreground" />
                        <span className="text-sm">
                          Objectif: {formatAmount(cause.targetAmount)}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <Award size={16} className="text-muted-foreground" />
                        <span className="text-sm">
                          Prix à gagner: {formatAmount(cause.winningAmount)}
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
                        <h4 className="text-sm font-medium mb-2">Communautés participantes:</h4>
                        <div className="space-y-2">
                          {cause.competitions.map((competition) => (
                            <div key={competition.id} className="flex items-center justify-between text-sm">
                              <span>{competition.community.name}</span>
                              {competition.hasPaid ? (
                                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                                  Payé
                                </Badge>
                              ) : (
                                <Badge variant="outline" className="bg-yellow-100 text-yellow-800 border-yellow-200">
                                  En attente
                                </Badge>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between">
                    <Link href={`/admin/causes/${cause.id}`}>
                      <Button variant="outline" className="flex items-center gap-2">
                        <Edit size={16} />
                        Détails
                      </Button>
                    </Link>

                    {cause.status === CauseStatus.PENDING && (
                      <Button 
                        onClick={() => handleActivateCause(cause.id)}
                        className="flex items-center gap-2"
                      >
                        <CheckCircle size={16} />
                        Activer
                      </Button>
                    )}
                  </CardFooter>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
