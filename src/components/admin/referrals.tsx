import { useState, useEffect } from 'react';
import { useUser } from '@/hooks/useUser';
import { referralService } from '@/lib/supabase';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import type { Referral, Profile } from '@/types/database';

interface ReferralWithDetails extends Referral {
  referrer: Profile;
  referred: Profile;
}

export function AdminReferrals() {
  const { user } = useUser();
  const [referrals, setReferrals] = useState<ReferralWithDetails[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [newReferral, setNewReferral] = useState({
    referrerId: '',
    referredId: '',
    commissionRate: 0.1
  });
  const [showDialog, setShowDialog] = useState(false);

  useEffect(() => {
    loadReferrals();
  }, []);

  const loadReferrals = async () => {
    setIsLoading(true);
    try {
      const data = await referralService.getAllReferrals();
      if (data) {
        setReferrals(data);
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de charger les parrainages",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateReferral = async () => {
    try {
      const referral = await referralService.createReferral(
        newReferral.referrerId,
        newReferral.referredId,
        newReferral.commissionRate
      );

      if (referral) {
        toast({
          title: "Succès",
          description: "Parrainage créé avec succès"
        });
        setShowDialog(false);
        loadReferrals();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de créer le parrainage",
        variant: "destructive"
      });
    }
  };

  const handleUpdateCommissionRate = async (referralId: string, newRate: number) => {
    try {
      const updated = await referralService.updateReferralCommissionRate(referralId, newRate);
      if (updated) {
        toast({
          title: "Succès",
          description: "Taux de commission mis à jour"
        });
        loadReferrals();
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de mettre à jour le taux de commission",
        variant: "destructive"
      });
    }
  };

  const handleDeleteReferral = async (referralId: string) => {
    try {
      await referralService.deleteReferral(referralId);
      toast({
        title: "Succès",
        description: "Parrainage supprimé"
      });
      loadReferrals();
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Impossible de supprimer le parrainage",
        variant: "destructive"
      });
    }
  };

  if (!user) {
    return <div>Accès non autorisé</div>;
  }

  return (
    <div className="container mx-auto py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Gestion des Parrainages</h1>
        <Dialog open={showDialog} onOpenChange={setShowDialog}>
          <DialogTrigger asChild>
            <Button>Nouveau Parrainage</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Créer un nouveau parrainage</DialogTitle>
              <DialogDescription>
                Entrez les informations du parrainage. Le taux de commission est en pourcentage.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="referrerId" className="text-right">
                  ID Parrain
                </Label>
                <Input
                  id="referrerId"
                  className="col-span-3"
                  value={newReferral.referrerId}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, referrerId: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="referredId" className="text-right">
                  ID Filleul
                </Label>
                <Input
                  id="referredId"
                  className="col-span-3"
                  value={newReferral.referredId}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, referredId: e.target.value }))}
                />
              </div>
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="commissionRate" className="text-right">
                  Commission (%)
                </Label>
                <Input
                  id="commissionRate"
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="col-span-3"
                  value={newReferral.commissionRate * 100}
                  onChange={(e) => setNewReferral(prev => ({ ...prev, commissionRate: Number(e.target.value) / 100 }))}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowDialog(false)}>
                Annuler
              </Button>
              <Button onClick={handleCreateReferral}>
                Créer
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Table>
        <TableCaption>Liste des parrainages actifs</TableCaption>
        <TableHeader>
          <TableRow>
            <TableHead>Parrain</TableHead>
            <TableHead>Filleul</TableHead>
            <TableHead className="text-right">Commission</TableHead>
            <TableHead className="text-right">Date de création</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {referrals.map((referral) => (
            <TableRow key={referral.id}>
              <TableCell>{referral.referrer.username}</TableCell>
              <TableCell>{referral.referred.username}</TableCell>
              <TableCell className="text-right">
                <Input
                  type="number"
                  min="0"
                  max="100"
                  step="1"
                  className="w-20 inline-block"
                  value={referral.commission_rate * 100}
                  onChange={(e) => handleUpdateCommissionRate(referral.id, Number(e.target.value) / 100)}
                />
                %
              </TableCell>
              <TableCell className="text-right">
                {new Date(referral.created_at).toLocaleDateString()}
              </TableCell>
              <TableCell className="text-right">
                <Button
                  variant="destructive"
                  size="sm"
                  onClick={() => handleDeleteReferral(referral.id)}
                >
                  Supprimer
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
