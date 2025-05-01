"use client";

import { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useToast } from '@/components/ui/use-toast';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { supabase } from '@/lib/supabase-client';

interface LoginFormData {
  email: string;
  password: string;
}

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    email: '',
    password: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.email || !formData.password) {
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Veuillez remplir tous les champs",
      });
      return;
    }

    try {
      setIsLoading(true);

      const callbackUrl = searchParams?.get('callbackUrl') || '/dashboard';
      
      // Utiliser Supabase pour la connexion
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        console.error("Erreur de connexion:", error);
        toast({
          variant: "destructive",
          title: "Erreur",
          description: error.message || "Une erreur est survenue lors de la connexion",
        });
        return;
      }

      if (!data.user) {
        toast({
          variant: "destructive",
          title: "Erreur",
          description: "Utilisateur non trouvé",
        });
        return;
      }

      toast({
        title: "Connexion réussie",
        description: "Vous êtes maintenant connecté.",
      });

      // Ajouter un petit délai pour s'assurer que la session est bien établie
      setTimeout(() => {
        // Forcer la navigation vers la page de destination
        window.location.href = callbackUrl;
      }, 500);
    } catch (error) {
      console.error("Erreur inattendue:", error);
      toast({
        variant: "destructive",
        title: "Erreur",
        description: "Une erreur est survenue lors de la connexion",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleChange = (field: keyof LoginFormData, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  return (
    <div className="w-full">
      <div className="mb-6">
        <h2 className="text-2xl font-bold text-white text-center">Connexion</h2>
        <p className="text-white/80 text-center mt-2">
          Accédez à votre compte Bingoo
        </p>
      </div>
      
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email" className="text-white">Email</Label>
            <Input
              id="email"
              type="email"
              required
              disabled={isLoading}
              value={formData.email}
              onChange={(e) => handleChange('email', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="password" className="text-white">Mot de passe</Label>
            <Input
              id="password"
              type="password"
              required
              disabled={isLoading}
              value={formData.password}
              onChange={(e) => handleChange('password', e.target.value)}
              className="bg-white/10 border-white/20 text-white placeholder:text-white/50"
            />
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-purple-600 hover:bg-purple-700 text-white" 
          disabled={isLoading}
        >
          {isLoading ? (
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
              Connexion en cours...
            </div>
          ) : "Se connecter"}
        </Button>

        <div className="flex justify-between text-sm">
          <a
            href="/auth/register"
            className="text-purple-400 hover:text-purple-300 hover:underline"
          >
            Créer un compte
          </a>
          <a
            href="/auth/forgot-password"
            className="text-purple-400 hover:text-purple-300 hover:underline"
          >
            Mot de passe oublié ?
          </a>
        </div>
      </form>
    </div>
  );
}
