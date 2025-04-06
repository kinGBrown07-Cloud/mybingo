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
import { useSession, signOut } from "next-auth/react";
import { Skeleton } from "@/components/ui/skeleton";

export function Navbar() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const { toast } = useToast();
  const loading = status === "loading";

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
    await signOut();
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
          {session?.user ? (
            <UserNav 
              profile={{
                firstName: session.user.name?.split(' ')[0] || '',
                lastName: session.user.name?.split(' ')[1] || '',
                email: session.user.email || '',
                image: session.user.image,
                photoId: session.user.photoId
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
