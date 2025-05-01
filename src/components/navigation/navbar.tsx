"use client";

import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTrigger } from "@/components/ui/dialog";
import { RegistrationForm } from "@/components/registration-form";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useToast } from "@/components/ui/use-toast";
import { UserNav } from "./user-nav";
import { MainNav } from "./main-nav";
import Image from "next/image";
import { Skeleton } from "@/components/ui/skeleton";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase-client";
import { User } from "@supabase/supabase-js";

export function Navbar() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Vérifier si l'utilisateur est connecté au chargement du composant
    const checkUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (user) {
          // Récupérer les informations complètes de l'utilisateur depuis notre API
          try {
            const response = await fetch(`/api/users/${user.id}`);
            if (response.ok) {
              const userData = await response.json();
              // Fusionner les données Supabase et Prisma
              setUser({
                ...user,
                role: userData.role || user.user_metadata?.role || 'USER'
              });
            } else {
              setUser(user);
            }
          } catch (apiError) {
            console.error("Erreur lors de la récupération des données utilisateur:", apiError);
            setUser(user);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Erreur lors de la récupération de l'utilisateur:", error);
      } finally {
        setLoading(false);
      }
    };

    // S'abonner aux changements d'état d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user || null);
      setLoading(false);
    });

    checkUser();

    // Nettoyer l'abonnement
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (loading) {
    return (
      <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/75">
        <div className="container flex h-20 items-center px-4">
          <Link href="/" className="mr-8 flex items-center space-x-3">
            <Image src="/logo.svg" alt="Bingoo" width={40} height={40} className="h-10 w-10" />
            <span className="hidden text-xl font-bold sm:inline-block">
              Bingoo
            </span>
          </Link>
          <div className="ml-auto flex items-center space-x-4">
            <Skeleton className="h-10 w-10 rounded-full" />
            <Skeleton className="h-10 w-24" />
          </div>
        </div>
      </header>
    );
  }

  const handleLogout = async () => {
    const { error } = await supabase.auth.signOut();
    
    if (error) {
      console.error("Erreur lors de la déconnexion:", error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la déconnexion",
        variant: "destructive",
      });
      return;
    }
    
    toast({
      title: "Déconnexion réussie",
      description: "À bientôt !",
    });
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b border-zinc-800 bg-zinc-900/95 backdrop-blur supports-[backdrop-filter]:bg-zinc-900/75">
      <div className="container flex h-20 items-center px-4">
        <Link href="/" className="mr-8 flex items-center space-x-3">
          <Image src="/images/logos/logo.png" alt="Bingoo" width={60} height={60} className="h-12 w-12" />
          <span className="hidden text-2xl font-bold sm:inline-block">
            Bingoo
          </span>
        </Link>

        <MainNav className="mx-6" />

        <div className="ml-auto flex items-center space-x-6">
          {user ? (
            <UserNav 
              profile={{
                firstName: user.user_metadata?.first_name || '',
                lastName: user.user_metadata?.last_name || '',
                email: user.email || '',
                image: user.user_metadata?.avatar_url,
                photoId: user.user_metadata?.photo_id,
                role: user.role || user.user_metadata?.role || 'USER'
              }} 
              onLogout={handleLogout} 
            />
          ) : (
            <div className="flex items-center space-x-6">
              <Link href="/auth/login">
                <Button 
                  variant="ghost" 
                  size="lg"
                  className="text-base text-white hover:text-purple-400 hover:bg-zinc-800"
                >
                  Connexion
                </Button>
              </Link>
              <Dialog>
                <DialogTrigger asChild>
                  <Button 
                    variant="default" 
                    size="lg"
                    className="text-base bg-purple-600 hover:bg-purple-700 text-white"
                  >
                    Inscription
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-[425px]">
                  <RegistrationForm />
                </DialogContent>
              </Dialog>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
