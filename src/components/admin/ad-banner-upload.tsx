"use client";

import { useState } from 'react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ImageUpload } from '@/components/upload/image-upload';
import { uploadAdBanner } from '@/lib/supabase-storage';
import { useToast } from '@/components/ui/use-toast';
import { useRouter } from 'next/navigation';

interface AdBannerFormData {
  title: string;
  description: string;
  ctaText: string;
  ctaLink: string;
  position: 'top' | 'middle' | 'bottom';
  backgroundColor: string;
  textColor: string;
  startDate: string;
  endDate: string;
  priority: number;
  imageUrl: string;
}

export function AdBannerUpload() {
  const [formData, setFormData] = useState<AdBannerFormData>({
    title: '',
    description: '',
    ctaText: 'En savoir plus',
    ctaLink: '/',
    position: 'middle',
    backgroundColor: '#1e293b', // slate-800
    textColor: '#ffffff',
    startDate: new Date().toISOString().split('T')[0],
    endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // +30 jours
    priority: 50,
    imageUrl: '',
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const router = useRouter();

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleImageUpload = async (file: File) => {
    // Utiliser l'ID de l'administrateur connecté
    const adminId = 'admin'; // À remplacer par l'ID réel de l'administrateur
    const imageUrl = await uploadAdBanner(file, adminId);
    
    if (imageUrl) {
      setFormData(prev => ({ ...prev, imageUrl }));
    }
    
    return imageUrl;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      // Vérifier que l'image a été téléchargée
      if (!formData.imageUrl) {
        toast({
          title: "Image requise",
          description: "Veuillez télécharger une image pour la bannière.",
          variant: "destructive",
        });
        setIsLoading(false);
        return;
      }
      
      // Envoyer les données à l'API
      const response = await fetch('/api/admin/ads/banners', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Une erreur est survenue');
      }
      
      toast({
        title: "Bannière créée",
        description: "La bannière publicitaire a été créée avec succès.",
      });
      
      // Rediriger vers la liste des bannières
      router.push('/admin/ads');
      router.refresh();
    } catch (error) {
      toast({
        title: "Erreur",
        description: error instanceof Error ? error.message : "Une erreur est survenue lors de la création de la bannière.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Nouvelle bannière publicitaire</CardTitle>
        <CardDescription>
          Créez une nouvelle bannière publicitaire qui sera affichée sur la page d'accueil.
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
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="Titre de la bannière"
                  required
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="description">Description</Label>
                <Input
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Description de la bannière"
                  required
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ctaText">Texte du bouton</Label>
                  <Input
                    id="ctaText"
                    name="ctaText"
                    value={formData.ctaText}
                    onChange={handleChange}
                    placeholder="En savoir plus"
                    required
                  />
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="ctaLink">Lien du bouton</Label>
                  <Input
                    id="ctaLink"
                    name="ctaLink"
                    value={formData.ctaLink}
                    onChange={handleChange}
                    placeholder="/promotions"
                    required
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="position">Position</Label>
                <Select
                  value={formData.position}
                  onValueChange={(value) => handleSelectChange('position', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionnez une position" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="top">Haut de page</SelectItem>
                    <SelectItem value="middle">Milieu de page</SelectItem>
                    <SelectItem value="bottom">Bas de page</SelectItem>
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
                      value={formData.backgroundColor}
                      onChange={handleChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.backgroundColor}
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
                      value={formData.textColor}
                      onChange={handleChange}
                      className="w-12 h-10 p-1"
                    />
                    <Input
                      type="text"
                      value={formData.textColor}
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
                    value={formData.startDate}
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
                    value={formData.endDate}
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
                  value={formData.priority}
                  onChange={handleChange}
                  required
                />
              </div>
            </div>
            
            <div>
              <ImageUpload
                onUpload={handleImageUpload}
                currentImageUrl={formData.imageUrl}
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
            onClick={() => router.back()}
          >
            Annuler
          </Button>
          
          <Button type="submit" disabled={isLoading}>
            {isLoading ? 'Création en cours...' : 'Créer la bannière'}
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
}
