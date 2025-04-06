"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/components/ui/use-toast";

interface CreditPointsDialogProps {
  userId: string;
  username: string;
  onSuccess?: () => void;
}

export function CreditPointsDialog({ userId, username, onSuccess }: CreditPointsDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [points, setPoints] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!points || isNaN(Number(points)) || Number(points) <= 0) {
      toast({
        title: "Erreur",
        description: "Veuillez entrer un nombre de points valide",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/users/${userId}/credit-points`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          points: Number(points),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to credit points");
      }

      toast({
        title: "Succès",
        description: `${points} points ont été crédités à ${username}`,
      });

      setIsOpen(false);
      setPoints("");
      onSuccess?.();
    } catch (error) {
      console.error("Error crediting points:", error);
      toast({
        title: "Erreur",
        description: "Impossible de créditer les points",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          Créditer des points
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Créditer des points</DialogTitle>
          <DialogDescription>
            Ajoutez des points au compte de {username}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="points" className="text-right">
                Points
              </Label>
              <Input
                id="points"
                type="number"
                min="1"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
                className="col-span-3"
                placeholder="Nombre de points à créditer"
                required
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              type="submit"
              disabled={isLoading}
            >
              {isLoading ? "En cours..." : "Créditer"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
