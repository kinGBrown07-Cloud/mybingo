"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PlusIcon, PencilIcon, TrashIcon } from '@heroicons/react/24/outline';
import { useToast } from '@/components/ui/use-toast';
import { format } from 'date-fns';
import { fr } from 'date-fns/locale';

interface AdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
  startDate: string;
  endDate: string;
  priority: number;
}

export default function AdsPage() {
  const [banners, setBanners] = useState<AdBanner[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();
  const { toast } = useToast();
  
  // Fonction pour charger les bannières
  const loadBanners = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/ads/banners');
      if (!response.ok) {
        throw new Error('Erreur lors du chargement des bannières');
      }
      const data = await response.json();
      setBanners(data);
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de charger les bannières publicitaires.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, setBanners]);
  
  // Charger les bannières au chargement de la page
  useEffect(() => {
    loadBanners();
  }, [loadBanners]);
  
  // Fonction pour supprimer une bannière
  const deleteBanner = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette bannière ?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/admin/ads/banners/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Erreur lors de la suppression');
      }
      
      toast({
        title: 'Bannière supprimée',
        description: 'La bannière a été supprimée avec succès.',
      });
      
      // Recharger la liste des bannières
      loadBanners();
    } catch (error) {
      toast({
        title: 'Erreur',
        description: 'Impossible de supprimer la bannière.',
        variant: 'destructive',
      });
    }
  };
  
  // Fonction pour formater une date
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd MMM yyyy', { locale: fr });
    } catch (e) {
      return 'Date invalide';
    }
  };
  
  // Fonction pour traduire la position
  const translatePosition = (position: string) => {
    switch (position) {
      case 'top': return 'Haut';
      case 'middle': return 'Milieu';
      case 'bottom': return 'Bas';
      default: return position;
    }
  };
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Gestion des Bannières Publicitaires</h1>
        <Button onClick={() => router.push('/admin/ads/new')}>
          <PlusIcon className="h-4 w-4 mr-2" />
          Nouvelle Bannière
        </Button>
      </div>
      
      <Tabs defaultValue="all">
        <TabsList>
          <TabsTrigger value="all">Toutes</TabsTrigger>
          <TabsTrigger value="active">Actives</TabsTrigger>
          <TabsTrigger value="inactive">Inactives</TabsTrigger>
        </TabsList>
        
        <TabsContent value="all" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Toutes les Bannières</CardTitle>
              <CardDescription>
                Liste de toutes les bannières publicitaires disponibles sur le site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : banners.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune bannière trouvée. Créez votre première bannière publicitaire.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead>Statut</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banners.map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded bg-cover bg-center" 
                                style={{ backgroundImage: `url(${banner.imageUrl})` }}
                              />
                              <div>
                                <div>{banner.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{translatePosition(banner.position)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>Début: {formatDate(banner.startDate)}</div>
                              <div>Fin: {formatDate(banner.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{banner.priority}</TableCell>
                          <TableCell>
                            {banner.isActive ? (
                              <Badge variant="success">Active</Badge>
                            ) : (
                              <Badge variant="secondary">Inactive</Badge>
                            )}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/admin/ads/edit/${banner.id}`)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteBanner(banner.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="active" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bannières Actives</CardTitle>
              <CardDescription>
                Bannières actuellement actives et visibles sur le site.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : banners.filter(b => b.isActive).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune bannière active trouvée.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banners.filter(b => b.isActive).map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded bg-cover bg-center" 
                                style={{ backgroundImage: `url(${banner.imageUrl})` }}
                              />
                              <div>
                                <div>{banner.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{translatePosition(banner.position)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>Début: {formatDate(banner.startDate)}</div>
                              <div>Fin: {formatDate(banner.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{banner.priority}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/admin/ads/edit/${banner.id}`)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteBanner(banner.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="inactive" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Bannières Inactives</CardTitle>
              <CardDescription>
                Bannières actuellement inactives ou expirées.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
                </div>
              ) : banners.filter(b => !b.isActive).length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Aucune bannière inactive trouvée.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Titre</TableHead>
                        <TableHead>Position</TableHead>
                        <TableHead>Période</TableHead>
                        <TableHead>Priorité</TableHead>
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {banners.filter(b => !b.isActive).map((banner) => (
                        <TableRow key={banner.id}>
                          <TableCell className="font-medium">
                            <div className="flex items-center gap-3">
                              <div 
                                className="h-10 w-10 rounded bg-cover bg-center" 
                                style={{ backgroundImage: `url(${banner.imageUrl})` }}
                              />
                              <div>
                                <div>{banner.title}</div>
                                <div className="text-xs text-gray-500 truncate max-w-[200px]">{banner.description}</div>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>{translatePosition(banner.position)}</TableCell>
                          <TableCell>
                            <div className="text-xs">
                              <div>Début: {formatDate(banner.startDate)}</div>
                              <div>Fin: {formatDate(banner.endDate)}</div>
                            </div>
                          </TableCell>
                          <TableCell>{banner.priority}</TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-2">
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => router.push(`/admin/ads/edit/${banner.id}`)}
                              >
                                <PencilIcon className="h-4 w-4" />
                              </Button>
                              <Button 
                                variant="outline" 
                                size="sm"
                                onClick={() => deleteBanner(banner.id)}
                              >
                                <TrashIcon className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
