'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Shield } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { UserRole } from '@prisma/client';

interface PromoteButtonProps {
  userId: string;
  currentRole: string;
}

export function PromoteButton({ userId, currentRole }: PromoteButtonProps) {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handlePromote = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/promote`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ currentRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to promote user');
      }

      toast({
        title: "Succès",
        description: "L'utilisateur a été promu avec succès",
      });
    } catch (error) {
      console.error('Error promoting user:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors de la promotion de l'utilisateur",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (currentRole === UserRole.ADMIN) {
    return null;
  }

  return (
    <Button
      onClick={handlePromote}
      disabled={isLoading}
      variant="outline"
      className="w-full"
    >
      {isLoading ? (
        "Promotion en cours..."
      ) : (
        <>
          <Shield className="mr-2 h-4 w-4" />
          Devenir administrateur
        </>
      )}
    </Button>
  );
}
