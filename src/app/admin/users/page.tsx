"use client";

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase-client';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { CreditPointsDialog } from "@/components/admin/credit-points-dialog";
import { DebitPointsDialog } from "@/components/admin/debit-points-dialog";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useToast } from "@/components/ui/use-toast";

interface User {
  id: string;
  email: string;
  username: string;
  role: string;
  points: number;
  isActive: boolean;
  createdAt: string;
}

export default function UsersPage() {
  const router = useRouter();
  const { toast } = useToast();
  const [user, setUser] = useState<{ id: string; email?: string; user_metadata?: Record<string, unknown>; app_metadata?: Record<string, unknown> } | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchUsers = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/users');
      const data = await response.json();

      if (response.ok) {
        setUsers(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les utilisateurs",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des utilisateurs",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

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
        fetchUsers();
      } catch (error) {
        console.error('Erreur lors de la vérification de l\'authentification:', error);
        router.push('/auth/login');
      }
    }
    
    checkAuth();
  }, [fetchUsers, router]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Gestion des utilisateurs</h1>
        <div className="flex gap-4">
          <Input
            type="search"
            placeholder="Rechercher un utilisateur..."
            className="w-[300px]"
          />
          <Button>Exporter</Button>
        </div>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Nom d'utilisateur</TableHead>
                <TableHead>Points</TableHead>
                <TableHead>Rôle</TableHead>
                <TableHead>Statut</TableHead>
                <TableHead>Date d'inscription</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {users.map((user) => (
                <TableRow key={user.id}>
                  <TableCell className="font-medium">{user.id}</TableCell>
                  <TableCell>{user.email}</TableCell>
                  <TableCell>{user.username}</TableCell>
                  <TableCell>{user.points}</TableCell>
                  <TableCell>{user.role}</TableCell>
                  <TableCell>
                    <span className={`px-2 py-1 rounded-full text-xs ${
                      user.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                      {user.isActive ? 'Actif' : 'Inactif'}
                    </span>
                  </TableCell>
                  <TableCell>{new Date(user.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-2">
                        <CreditPointsDialog
                          userId={user.id}
                          username={user.username}
                          onSuccess={fetchUsers}
                        />
                        <DebitPointsDialog
                          userId={user.id}
                          username={user.username}
                          onSuccess={fetchUsers}
                        />
                      </div>
                      <Button variant="outline" size="sm">
                        Éditer
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
