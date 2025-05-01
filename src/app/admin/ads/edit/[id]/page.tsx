"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/upload/image-upload';
import { uploadAdBanner } from '@/lib/supabase-storage';
import { useToast } from '@/components/ui/use-toast';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';

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

export default function EditAdBannerPage({ params }: { params: { id: string } }) {
  const { id } = params;
  const [banner, setBanner] = useState<AdBanner | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const router = useRouter();
  const { toast } = useToast();
  
  // Charger les détails de la bannière
  useEffect(() => {
    const fetchBanner = async () => {
      try {
        const response = await fetch(`/api/admin/ads/banners/${id}`);
        if (!response.ok) {
          throw new Error('Erreur lors du chargement de la bannière');
        }
        const data = await response.json();
        
        // Formater les dates pour l'affichage dans les champs de type date
        const formattedData = {
          ...data,
          startDate: new Date(data.startDate).toISOString().split('T')[0],
          endDate: new Date(data.endDate).toISOString().split('T')[0],
        };
        
        setBanner(formattedData);
      } catch (error) {
        toast({
          title: 'Erreur',
          description: 'Impossible de charger les détails de la bannière.',
          variant: 'destructive',
        });
        router.push('/admin/ads');
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchBanner();
  }, [id, router, toast]);
  
  // Gérer les changements dans le formulaire
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (banner) {
      setBanner({ ...banner, [name]: value });
    }
  };
  
  // Gérer les changements dans les sélecteurs
  const handleSelectChange = (name: string, value: string) => {
    if (banner) {
      setBanner({ ...banner, [name]: value });
    }
  };
  
  // Gérer le téléchargement d'image
  const handleImageUpload = async (file: File) => {
    // Utiliser l'ID de l'administrateur connecté
    const adminId = 'admin'; // À remplacer par l'ID réel de l'administrateur
    const imageUrl = await uploadAdBanner(file, adminId);
    
    if (imageUrl && banner) {
      setBanner({ ...banner, imageUrl });
    }
    
    return imageUrl;
  };
  
  // Gérer la soumission du formulaire
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!banner) return;
    
    setIsSaving(true);
    
    try {
      // Vérifier que l'image a été téléchargée
      if (!banner.imageUrl) {
        toast({
          title: "Image requise",
          description: "Veuillez télécharger une image pour la bannière.",
          variant: "destructive",
        });
        setIsSaving(false);
        return;
      }
      
      // Envoyer les données à l'API
      const response = await fetch(`/api/admin/ads/banners/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(banner),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Une erreur est survenue');
      }
      
      toast({
        title: "Bannière mise à jour",
        description: "La bannière publicitaire a été mise à jour avec succès.",
      });
      
      // Rediriger vers la liste des bannières
      router.push('/admin/ads');
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la mise à jour de la bannière.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };
  
  // Gérer le changement de statut (actif/inactif)
  const handleStatusChange = (value: string) => {
    if (banner) {
      setBanner({ ...banner, isActive: value === 'active' });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container mx-auto py-6 flex justify-center items-center min-h-[400px]">
        <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full"></div>
      </div>
    );
  }
  
  if (!banner) {
    return (
      <div className="container mx-auto py-6">
        <div className="text-center py-8">
          <h2 className="text-2xl font-bold">Bannière non trouvée</h2>
          <p className="mt-2 text-gray-500">La bannière que vous recherchez n'existe pas ou a été supprimée.</p>
          <Button className="mt-4" onClick={() => router.push('/admin/ads')}>
            Retour à la liste des bannières
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Modifier la Bannière</h1>
      </div>
      
      <Card>
        <CardHeader>
          <CardTitle>Modifier la bannière publicitaire</CardTitle>
          <CardDescription>
            Mettez à jour les informations de la bannière publicitaire.
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="title">Titre</Label>
                  <Input
                    id="title"
                    name="title"
                    value={banner.title}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    name="description"
                    value={banner.description}
                    onChange={handleChange}
                    required
                  />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="ctaText">Texte du bouton</Label>
                    <Input
                      id="ctaText"
                      name="ctaText"
                      value={banner.ctaText}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ctaLink">Lien du bouton</Label>
                    <Input
                      id="ctaLink"
                      name="ctaLink"
                      value={banner.ctaLink}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="position">Position</Label>
                  <Select 
                    value={banner.position} 
                    onValueChange={(value) => handleSelectChange('position', value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner une position" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="top">Haut de page</SelectItem>
                      <SelectItem value="middle">Milieu de page</SelectItem>
                      <SelectItem value="bottom">Bas de page</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="status">Statut</Label>
                  <Select 
                    value={banner.isActive ? 'active' : 'inactive'} 
                    onValueChange={(value) => handleStatusChange(value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionner un statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="backgroundColor">Couleur de fond</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="backgroundColor"
                        name="backgroundColor"
                        type="color"
                        value={banner.backgroundColor || '#1e293b'}
                        onChange={handleChange}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={banner.backgroundColor || '#1e293b'}
                        onChange={handleChange}
                        name="backgroundColor"
                        className="flex-1"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="textColor">Couleur du texte</Label>
                    <div className="flex items-center gap-2">
                      <Input
                        id="textColor"
                        name="textColor"
                        type="color"
                        value={banner.textColor || '#ffffff'}
                        onChange={handleChange}
                        className="w-12 h-10 p-1"
                      />
                      <Input
                        type="text"
                        value={banner.textColor || '#ffffff'}
                        onChange={handleChange}
                        name="textColor"
                        className="flex-1"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Date de début</Label>
                    <Input
                      id="startDate"
                      name="startDate"
                      type="date"
                      value={banner.startDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Date de fin</Label>
                    <Input
                      id="endDate"
                      name="endDate"
                      type="date"
                      value={banner.endDate}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="priority">Priorité (0-100)</Label>
                  <Input
                    id="priority"
                    name="priority"
                    type="number"
                    min="0"
                    max="100"
                    value={banner.priority}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>
              
              <div>
                <ImageUpload
                  onUpload={handleImageUpload}
                  currentImageUrl={banner.imageUrl}
                  label="Image de la bannière"
                />
                <p className="text-sm text-gray-500 mt-2">
                  Téléchargez une image de haute qualité pour votre bannière. Dimensions recommandées: 1200x400px.
                </p>
              </div>
            </div>
          </CardContent>
          
          <CardFooter className="flex justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => router.push('/admin/ads')}
            >
              Annuler
            </Button>
            
            <Button type="submit" disabled={isSaving}>
              {isSaving ? 'Enregistrement...' : 'Enregistrer les modifications'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
