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
import { Menu, X } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
} from "@/components/ui/sheet";

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

        {/* Navigation pour écrans moyens et grands */}
        <div className="hidden md:block">
          <MainNav className="mx-6" />
        </div>

        <div className="ml-auto flex items-center space-x-4">
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
            <>
              {/* Boutons pour écrans moyens et grands */}
              <div className="hidden md:flex items-center space-x-4">
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
              
              {/* Menu hamburger pour petits écrans */}
              <Sheet>
                <SheetTrigger asChild className="md:hidden">
                  <Button variant="ghost" size="icon" className="h-10 w-10">
                    <Menu className="h-6 w-6" />
                  </Button>
                </SheetTrigger>
                <SheetContent side="right" className="w-[300px] sm:w-[400px] bg-zinc-900 border-zinc-800">
                  <div className="flex flex-col space-y-6 py-6">
                    <div className="flex flex-col space-y-3">
                      <Link href="/games/memory" className="text-lg font-medium hover:text-purple-400 transition-colors">Jeux Memory</Link>
                      <Link href="/games/blackjack" className="text-lg font-medium hover:text-purple-400 transition-colors">Blackjack</Link>
                      <Link href="/games/slots" className="text-lg font-medium hover:text-purple-400 transition-colors">Machines à sous</Link>
                      <Link href="/shop" className="text-lg font-medium hover:text-purple-400 transition-colors">Boutique</Link>
                      <Link href="/leaderboard" className="text-lg font-medium hover:text-purple-400 transition-colors">Classement</Link>
                      <Link href="/help" className="text-lg font-medium hover:text-purple-400 transition-colors">Aide</Link>
                    </div>
                    <div className="flex flex-col space-y-4 pt-6 border-t border-zinc-800">
                      <Link href="/auth/login">
                        <Button 
                          variant="ghost" 
                          size="lg"
                          className="w-full text-base text-white hover:text-purple-400 hover:bg-zinc-800"
                        >
                          Connexion
                        </Button>
                      </Link>
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="lg"
                            className="w-full text-base bg-purple-600 hover:bg-purple-700 text-white"
                          >
                            Inscription
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[425px]">
                          <RegistrationForm />
                        </DialogContent>
                      </Dialog>
                    </div>
                  </div>
                </SheetContent>
              </Sheet>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
