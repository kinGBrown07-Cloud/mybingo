'use client';

import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { User, Profile } from '@/types/db';
import { useBalance } from '@/hooks/use-balance';
import { Coins, Edit2, Save, Loader2 } from 'lucide-react';
import { PromoteButton } from '@/components/admin/promote-button';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { useRouter } from 'next/navigation';
import { ProfileImageUpload } from '@/components/profile-image-upload';

export default function ProfilePage() {
  const { toast } = useToast();
  const { coins } = useBalance();
  const router = useRouter();
  const supabase = createClientComponentClient();
  const [isEditing, setIsEditing] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    username: '',
    email: '',
    phoneNumber: '',
    country: ''
  });

  // Charger les données initiales une seule fois
  useEffect(() => {
    async function checkAuth() {
      setLoading(true);
      try {
        // Vérifier si l'utilisateur est authentifié avec Supabase
        const { data: { user: supabaseUser } } = await supabase.auth.getUser();
        
        if (!supabaseUser) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        console.log('Utilisateur authentifié:', supabaseUser.id);
        
        try {
          // Récupérer le profil utilisateur via notre API
          const response = await fetch(`/api/profile?userId=${supabaseUser.id}`);
          
          if (response.ok) {
            const profileData = await response.json();
            console.log('Profil récupéré avec succès:', profileData);
            setUser(profileData);
            
            // Mettre à jour le formulaire avec les données reçues
            setFormData({
              username: profileData?.username || '',
              email: profileData?.email || '',
              phoneNumber: profileData?.profile?.phoneNumber || '',
              country: profileData?.profile?.country || ''
            });
          } else {
            // En cas d'erreur, créer un profil temporaire à partir des données utilisateur
            console.warn('Impossible de récupérer le profil, utilisation des données utilisateur de base');
            const userEmail = supabaseUser.email || '';
            const username = userEmail.split('@')[0] || 'Utilisateur';
            
            // Utiliser les données de base de l'utilisateur avec toutes les propriétés requises
            setUser({
              id: supabaseUser.id,
              email: supabaseUser.email || '',
              emailVerified: null,
              authProvider: 'EMAIL',
              role: supabaseUser.user_metadata?.role || 'USER',
              isActive: true,
              createdAt: new Date(),
              updatedAt: new Date(),
              profile: {
                id: supabaseUser.id,
                userId: supabaseUser.id,
                username: username,
                firstName: '',
                lastName: '',
                phoneNumber: null,
                country: '',
                region: '',
                currency: 'XOF',
                coins: 0,
                points: 0,
                pointsRate: 1,
                vipLevelId: null,
                referrerId: null,
                termsAccepted: true,
                termsAcceptedAt: null,
                referralCode: null,
                image_url: null,
                createdAt: new Date(),
                updatedAt: new Date()
              }
            });
            
            setFormData({
              username: username,
              email: supabaseUser.email || '',
              phoneNumber: '',
              country: ''
            });
          }
        } catch (error) {
          console.error('Erreur lors de la récupération du profil:', error);
          toast({
            variant: "destructive",
            title: "Erreur",
            description: "Impossible de charger les données du profil.",
          });
        }
      } catch (error) {
        console.error('Erreur d\'authentification:', error);
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter.",
        });
        router.push('/auth/login');
      } finally {
        setLoading(false);
      }
    }

    checkAuth();
  }, [toast, router, supabase.auth]); // Ajout de toast comme dépendance

  const handleImageUploaded = (image_url: string) => {
    // Mettre à jour l'utilisateur avec la nouvelle URL d'image
    if (user && user.profile) {
      setUser({
        ...user,
        profile: {
          ...user.profile,
          image_url: image_url
        }
      });
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isEditing) return; // Ne rien faire si on n'est pas en mode édition

    try {
      // Vérifier si l'utilisateur est authentifié
      const { data: { user: supabaseUser } } = await supabase.auth.getUser();
      
      if (!supabaseUser) {
        toast({
          variant: "destructive",
          title: "Erreur d'authentification",
          description: "Veuillez vous reconnecter.",
        });
        router.push('/auth/login');
        return;
      }

      const response = await fetch(`/api/profile?userId=${supabaseUser.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          firstName: formData.username.split(' ')[0] || '',
          lastName: formData.username.split(' ')[1] || '',
          phoneNumber: formData.phoneNumber,
          country: formData.country
        }),
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser({
          ...user,
          profile: updatedUser
        });
        
        setIsEditing(false);
        toast({
          title: "Succès",
          description: "Profil mis à jour avec succès.",
        });
      } else {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Erreur lors de la mise à jour');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: error instanceof Error ? error.message : "Impossible de mettre à jour le profil.",
      });
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto py-10">
        <div className="flex flex-col items-center justify-center h-[60vh]">
          <Loader2 className="h-12 w-12 animate-spin text-primary mb-4" />
          <h3 className="text-xl font-medium">Chargement de votre profil...</h3>
        </div>
      </div>
    );
  }
  
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
            <div className="flex items-center justify-center mb-6">
              <ProfileImageUpload 
                userId={user.id}
                currentImageUrl={user.profile?.image_url || ''}
                firstName={user.profile?.firstName || user.profile?.username?.split(' ')[0] || 'U'}
                lastName={user.profile?.lastName || user.profile?.username?.split(' ')[1] || ''}
                onImageUploaded={handleImageUploaded}
              />
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
                    disabled={true} // Email ne peut pas être modifié
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
                {user?.role === 'USER' && (
                  <div className="mt-4">
                    <PromoteButton 
                      userId={user?.id || ''} 
                      currentRole={user?.role || 'USER'} 
                    />
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
