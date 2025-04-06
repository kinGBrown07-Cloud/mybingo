'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/components/ui/use-toast';
import { Bell, Volume2, Moon, Globe, DollarSign } from 'lucide-react';

type SettingValue = {
  notifications: boolean;
  soundEnabled: boolean;
  volume: number;
  darkMode: boolean;
  language: string;
  currency: string;
};

export default function SettingsPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState<SettingValue>({
    notifications: true,
    soundEnabled: true,
    volume: 50,
    darkMode: false,
    language: 'fr',
    currency: 'XOF'
  });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const response = await fetch('/api/settings');
        if (response.ok) {
          const data = await response.json();
          setSettings(data);
        }
      } catch (error) {
        console.error('Error fetching settings:', error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Impossible de charger les paramètres.",
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSettings();
  }, [toast]);

  const handleSettingChange = async (key: keyof SettingValue, value: SettingValue[keyof SettingValue]) => {
    try {
      const newSettings = { ...settings, [key]: value };
      setSettings(newSettings);

      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newSettings),
      });

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Paramètres mis à jour avec succès.",
        });
      } else {
        throw new Error('Erreur lors de la mise à jour');
      }
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Impossible de mettre à jour les paramètres.",
      });
    }
  };

  if (isLoading) {
    return (
      <div className="container mx-auto py-10">
        <Card className="max-w-2xl mx-auto">
          <CardContent className="p-6">
            <div className="flex items-center justify-center">
              <p>Chargement des paramètres...</p>
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
          <CardTitle>Paramètres</CardTitle>
          <CardDescription>Personnalisez votre expérience de jeu</CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Notifications */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Bell className="w-5 h-5" />
              <div>
                <Label htmlFor="notifications">Notifications</Label>
                <p className="text-sm text-gray-500">Recevoir des notifications sur les gains et promotions</p>
              </div>
            </div>
            <Switch
              id="notifications"
              checked={settings.notifications}
              onCheckedChange={(checked) => handleSettingChange('notifications', checked)}
            />
          </div>

          {/* Son */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <Volume2 className="w-5 h-5" />
                <div>
                  <Label htmlFor="sound">Son</Label>
                  <p className="text-sm text-gray-500">Activer les effets sonores</p>
                </div>
              </div>
              <Switch
                id="sound"
                checked={settings.soundEnabled}
                onCheckedChange={(checked) => handleSettingChange('soundEnabled', checked)}
              />
            </div>
            {settings.soundEnabled && (
              <div className="space-y-2">
                <Label>Volume</Label>
                <Slider
                  value={[settings.volume]}
                  onValueChange={([value]) => handleSettingChange('volume', value)}
                  max={100}
                  step={1}
                />
              </div>
            )}
          </div>

          {/* Mode sombre */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Moon className="w-5 h-5" />
              <div>
                <Label htmlFor="darkMode">Mode sombre</Label>
                <p className="text-sm text-gray-500">Activer le thème sombre</p>
              </div>
            </div>
            <Switch
              id="darkMode"
              checked={settings.darkMode}
              onCheckedChange={(checked) => handleSettingChange('darkMode', checked)}
            />
          </div>

          {/* Langue */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <Globe className="w-5 h-5" />
              <Label>Langue</Label>
            </div>
            <Select
              value={settings.language}
              onValueChange={(value) => handleSettingChange('language', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une langue" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="fr">Français</SelectItem>
                <SelectItem value="en">English</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Devise */}
          <div className="space-y-2">
            <div className="flex items-center space-x-4">
              <DollarSign className="w-5 h-5" />
              <Label>Devise</Label>
            </div>
            <Select
              value={settings.currency}
              onValueChange={(value) => handleSettingChange('currency', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sélectionnez une devise" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="XOF">XOF</SelectItem>
                <SelectItem value="EUR">EUR</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
