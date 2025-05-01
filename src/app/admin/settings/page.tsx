"use client";

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/components/ui/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null>(null);
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    async function checkAuth() {
      try {
        // Vérifier si l'utilisateur est authentifié
        const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();
        
        if (error || !supabaseUser) {
          console.log('Utilisateur non authentifié, redirection vers login');
          router.push('/auth/login');
          return;
        }
        
        // Vérifier si l'utilisateur est admin
        const isAdmin = 
          supabaseUser.user_metadata?.role === 'ADMIN' || 
          supabaseUser.app_metadata?.role === 'ADMIN';
        
        if (!isAdmin) {
          console.log('Utilisateur non admin, redirection vers dashboard');
          router.push('/dashboard');
          return;
        }
        
        setUser(supabaseUser);
        // No data fetching needed for settings page
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      }
    }
    
    checkAuth();
  }, [router]);

  const [settings, setSettings] = useState({
    minDeposit: 100,
    maxDeposit: 1000000,
    minWithdrawal: 1000,
    maxWithdrawal: 1000000,
    maintenanceMode: false,
    allowNewRegistrations: true,
    defaultCurrency: 'XOF',
    defaultRegion: 'BLACK_AFRICA'
  });

  const handleSave = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/admin/settings', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Les paramètres ont été mis à jour",
        });
      } else {
        throw new Error('Failed to update settings');
      }
    } catch (error) {
      console.error('Error updating settings:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la mise à jour des paramètres",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-10">
      <h1 className="text-4xl font-bold mb-6">Paramètres</h1>

      <Tabs defaultValue="general">
        <TabsList className="mb-4">
          <TabsTrigger value="general">Général</TabsTrigger>
          <TabsTrigger value="payments">Paiements</TabsTrigger>
          <TabsTrigger value="security">Sécurité</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres généraux</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-gray-500">
                    Activer le mode maintenance rendra le site inaccessible aux utilisateurs
                  </p>
                </div>
                <Switch
                  checked={settings.maintenanceMode}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, maintenanceMode: checked })
                  }
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-1">
                  <Label>Nouvelles inscriptions</Label>
                  <p className="text-sm text-gray-500">
                    Autoriser les nouvelles inscriptions sur la plateforme
                  </p>
                </div>
                <Switch
                  checked={settings.allowNewRegistrations}
                  onCheckedChange={(checked) =>
                    setSettings({ ...settings, allowNewRegistrations: checked })
                  }
                />
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="payments">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de paiement</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-6">
                <div className="space-y-2">
                  <Label>Dépôt minimum (XOF)</Label>
                  <Input
                    type="number"
                    value={settings.minDeposit}
                    onChange={(e) =>
                      setSettings({ ...settings, minDeposit: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Dépôt maximum (XOF)</Label>
                  <Input
                    type="number"
                    value={settings.maxDeposit}
                    onChange={(e) =>
                      setSettings({ ...settings, maxDeposit: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Retrait minimum (XOF)</Label>
                  <Input
                    type="number"
                    value={settings.minWithdrawal}
                    onChange={(e) =>
                      setSettings({ ...settings, minWithdrawal: parseInt(e.target.value) })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Retrait maximum (XOF)</Label>
                  <Input
                    type="number"
                    value={settings.maxWithdrawal}
                    onChange={(e) =>
                      setSettings({ ...settings, maxWithdrawal: parseInt(e.target.value) })
                    }
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label>Région par défaut</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={settings.defaultRegion}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultRegion: e.target.value })
                  }
                >
                  <option value="BLACK_AFRICA">Afrique Noire</option>
                  <option value="NORTH_AFRICA">Afrique du Nord</option>
                  <option value="EUROPE">Europe</option>
                  <option value="AMERICAS">Amériques</option>
                  <option value="ASIA">Asie</option>
                </select>
              </div>

              <div className="space-y-2">
                <Label>Devise par défaut</Label>
                <select
                  className="w-full p-2 border rounded"
                  value={settings.defaultCurrency}
                  onChange={(e) =>
                    setSettings({ ...settings, defaultCurrency: e.target.value })
                  }
                >
                  <option value="XOF">XOF</option>
                  <option value="MAD">MAD</option>
                  <option value="EUR">EUR</option>
                  <option value="USD">USD</option>
                </select>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <div className="mt-6">
        <Button onClick={handleSave} disabled={isLoading}>
          {isLoading ? "Enregistrement..." : "Enregistrer les modifications"}
        </Button>
      </div>
    </div>
  );
}
