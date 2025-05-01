"use client";

import { AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import Link from "next/link";
import { CreditCard, LogOut, Settings, User } from "lucide-react";

interface UserNavProps {
  profile: {
    firstName: string;
    lastName: string;
    email: string;
    image?: string | null;
    photoId?: string | null;
    role?: string;
  };
  onLogout: () => void;
}

export function UserNav({ profile, onLogout }: UserNavProps) {
  const initials = `${profile.firstName[0]}${profile.lastName[0]}`.toUpperCase();

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="relative h-8 w-8 rounded-full">
          <Avatar className="h-8 w-8">
            {profile.photoId ? (
              <AvatarImage src={`/uploads/${profile.photoId}`} alt={initials} />
            ) : profile.image ? (
              <AvatarImage src={profile.image} alt={initials} />
            ) : (
              <AvatarFallback>{initials}</AvatarFallback>
            )}
          </Avatar>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-56" align="end" forceMount>
        <DropdownMenuLabel className="font-normal">
          <div className="flex flex-col space-y-1">
            <p className="text-sm font-medium leading-none">{profile.firstName} {profile.lastName}</p>
            <p className="text-xs leading-none text-muted-foreground">
              {profile.email}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        {profile.role === 'ADMIN' && (
          <Link href="/admin/dashboard">
            <DropdownMenuItem>
              <CreditCard className="mr-2 h-4 w-4" />
              <span>Tableau de bord Admin</span>
            </DropdownMenuItem>
          </Link>
        )}
        <Link href="/dashboard">
          <DropdownMenuItem>
            <CreditCard className="mr-2 h-4 w-4" />
            <span>Tableau de bord</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/profile">
          <DropdownMenuItem>
            <User className="mr-2 h-4 w-4" />
            <span>Mon profil</span>
          </DropdownMenuItem>
        </Link>
        <Link href="/settings">
          <DropdownMenuItem>
            <Settings className="mr-2 h-4 w-4" />
            <span>Paramètres</span>
          </DropdownMenuItem>
        </Link>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={onLogout}>
          <LogOut className="mr-2 h-4 w-4" />
          <span>Déconnexion</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
