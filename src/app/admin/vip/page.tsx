"use client";

import { useState, useEffect, useCallback } from 'react';
import { useSession } from 'next-auth/react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
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

interface VipLevel {
  id: string;
  level: number;
  name: string;
  requiredPoints: number;
  bonusPercentage: number;
  createdAt: string;
}

export default function VipPage() {
  const { data: session } = useSession();
  const { toast } = useToast();
  const [vipLevels, setVipLevels] = useState<VipLevel[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchVipLevels = useCallback(async () => {
    try {
      const response = await fetch('/api/admin/vip-levels');
      const data = await response.json();

      if (response.ok) {
        setVipLevels(data);
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les niveaux VIP",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error('Error fetching VIP levels:', error);
      toast({
        title: "Erreur",
        description: "Une erreur est survenue lors du chargement des niveaux VIP",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    if (session?.user) {
      fetchVipLevels();
    }
  }, [session, fetchVipLevels]);

  return (
    <div className="container mx-auto py-10">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-4xl font-bold">Gestion des VIP</h1>
        <Button>Ajouter un niveau VIP</Button>
      </div>

      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Niveau</TableHead>
                <TableHead>Nom</TableHead>
                <TableHead>Points requis</TableHead>
                <TableHead>Bonus (%)</TableHead>
                <TableHead>Date de création</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vipLevels.map((vip) => (
                <TableRow key={vip.id}>
                  <TableCell className="font-medium">{vip.level}</TableCell>
                  <TableCell>{vip.name}</TableCell>
                  <TableCell>{vip.requiredPoints}</TableCell>
                  <TableCell>{vip.bonusPercentage}%</TableCell>
                  <TableCell>{new Date(vip.createdAt).toLocaleDateString()}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button variant="ghost" size="sm">
                        Éditer
                      </Button>
                      <Button variant="ghost" size="sm" className="text-red-600 hover:text-red-700">
                        Supprimer
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
