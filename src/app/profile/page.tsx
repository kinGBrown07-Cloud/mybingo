'use client';

import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Profile } from '@/types/db';
import { useBalance } from '@/hooks/use-balance';
import { Coins, Edit2, Save, Camera, Loader2 } from 'lucide-react';
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar';
import { PromoteButton } from '@/components/admin/promote-button';

export default function ProfilePage() {
  const { toast } = useToast();
  const { coins } = useBalance();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    country: ''
  });

  // Charger les données initiales une seule fois
  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch('/api/profile');
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          setFormData({
            username: userData.profile?.username || '',
            email: userData.email || '',
            phoneNumber: userData.profile?.phoneNumber || '',
            country: userData.profile?.country || ''
          });
        }
      } catch (error) {
        console.error('Error fetching user:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les données du profil.",
        });
      }
    };

    fetchUser();
  }, [toast]); // Ajout de toast comme dépendance

  const handleImageUpload = async (file: File) => {
    try {
      setIsUploading(true);
      const uploadData = new FormData();
      uploadData.append('file', file);

      const response = await fetch('/api/upload', {
        method: 'POST',
        body: uploadData,
      });

      if (response.ok) {
        const { url } = await response.json();
        // Mise à jour du profil avec la nouvelle URL d'image
        const profileResponse = await fetch('/api/profile', {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            ...formData,
            image_url: url
          }),
        });

        if (profileResponse.ok) {
          const updatedUser = await profileResponse.json();
          setUser(updatedUser);
          // Mettre à jour le formData avec les nouvelles données
          setFormData({
            username: updatedUser.profile?.username || '',
            email: updatedUser.email || '',
            phoneNumber: updatedUser.profile?.phoneNumber || '',
            country: updatedUser.profile?.country || ''
          });
          
          // Rafraîchir la session pour mettre à jour l'image dans la navbar
          await fetch('/api/auth/session');
          window.location.reload(); // Forcer le rechargement pour mettre à jour la navbar
          
          toast({
            title: "Succès",
            description: "Photo de profil mise à jour avec succès.",
          });
        }
      } else {
        throw new Error('Erreur lors du téléchargement');
      }
    } catch (error) {
      console.error('Error uploading image:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour la photo de profil.",
      });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return; // Ne rien faire si on n'est pas en mode édition

    try {
      const response = await fetch('/api/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: formData.username,
          email: formData.email,
          phoneNumber: formData.phoneNumber,
          country: formData.country
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        // Mettre à jour le formData avec les nouvelles données
        setFormData({
          username: updatedUser.profile?.username || '',
          email: updatedUser.email || '',
          phoneNumber: updatedUser.profile?.phoneNumber || '',
          country: updatedUser.profile?.country || ''
        });
        setIsEditing(false);
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour le profil.",
      });
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <p>Chargement du profil...</p>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-10">
      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Mon Profil</CardTitle>
          <CardDescription>Gérez vos informations personnelles</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Photo de profil */}
            <div className="flex items-center space-x-4">
              <div className="relative">
                <Avatar className="h-24 w-24">
                  <AvatarImage src={user?.profile?.image_url || ''} />
                  <AvatarFallback>
                    {user?.profile?.username?.charAt(0).toUpperCase() || 'U'}
                  </AvatarFallback>
                </Avatar>
                <Button
                  size="icon"
                  variant="secondary"
                  className="absolute bottom-0 right-0 rounded-full"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  {isUploading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Camera className="h-4 w-4" />
                  )}
                </Button>
                <input
                  type="file"
                  ref={fileInputRef}
                  className="hidden"
                  accept="image/*"
                  onChange={(e) => {
                    const file = e.target.files?.[0];
                    if (file) handleImageUpload(file);
                  }}
                />
              </div>
              <div>
                <h3 className="text-lg font-medium">{user?.profile?.username}</h3>
                <p className="text-sm text-muted-foreground">{user?.email}</p>
              </div>
            </div>

            {/* Solde */}
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-yellow-500/10 to-amber-500/10 rounded-lg">
              <Coins className="w-8 h-8 text-yellow-500" />
              <div>
                <p className="text-sm font-medium">Votre solde</p>
                <p className="text-2xl font-bold">{coins} points</p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid gap-4">
                <div className="space-y-2">
                  <Label htmlFor="username">Nom d'utilisateur</Label>
                  <Input
                    id="username"
                    value={formData.username}
                    onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Téléphone</Label>
                  <Input
                    id="phone"
                    value={formData.phoneNumber}
                    onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="country">Pays</Label>
                  <Input
                    id="country"
                    value={formData.country}
                    onChange={(e) => setFormData({ ...formData, country: e.target.value })}
                    disabled={!isEditing}
                  />
                </div>
                {user?.role !== 'ADMIN' && (
                  <div className="mt-4">
                    <PromoteButton />
                  </div>
                )}
              </div>

              {isEditing ? (
                <Button type="submit" className="w-full">
                  <Save className="w-4 h-4 mr-2" />
                  Enregistrer les modifications
                </Button>
              ) : (
                <Button type="button" onClick={() => setIsEditing(true)} className="w-full">
                  <Edit2 className="w-4 h-4 mr-2" />
                  Modifier le profil
                </Button>
              )}
            </form>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
