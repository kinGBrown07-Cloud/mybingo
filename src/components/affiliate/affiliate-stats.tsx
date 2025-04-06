"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/components/ui/use-toast";
import { Share2, Copy, Users, TrendingUp } from "lucide-react";

interface AffiliateStatsProps {
  affiliateCode: string;
  totalEarnings: number;
  referrals: Array<{
    amount: number;
    created_at: string;
    profiles: {
      username: string;
      first_name: string;
      last_name: string;
    };
  }>;
}

export function AffiliateStats({ affiliateCode, totalEarnings, referrals }: AffiliateStatsProps) {
  const { toast } = useToast();
  const [showShareDialog, setShowShareDialog] = useState(false);

  const affiliateUrl = `${window.location.origin}/auth/register?ref=${affiliateCode}`;

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copié !",
        description: "Le lien d'affiliation a été copié dans le presse-papiers.",
      });
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier le lien. Veuillez réessayer.",
        variant: "destructive",
      });
    }
  };

  const shareLink = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'Rejoignez-moi sur Bingoo !',
          text: 'Utilisez mon code de parrainage pour commencer à jouer sur Bingoo.',
          url: affiliateUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          toast({
            title: "Erreur",
            description: "Impossible de partager le lien. Veuillez réessayer.",
            variant: "destructive",
          });
        }
      }
    } else {
      copyToClipboard(affiliateUrl);
    }
  };

  return (
    <div className="space-y-8">
      {/* Carte des statistiques */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Code d'Affiliation</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div className="text-2xl font-bold">{affiliateCode}</div>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => copyToClipboard(affiliateCode)}
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Gains Totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {totalEarnings} points
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Filleuls</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {referrals.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Partagez votre lien</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-4">
            <input
              type="text"
              value={affiliateUrl}
              readOnly
              className="flex-1 px-3 py-2 border rounded-md bg-muted"
            />
            <Button onClick={() => copyToClipboard(affiliateUrl)}>
              <Copy className="h-4 w-4 mr-2" />
              Copier
            </Button>
            <Button onClick={shareLink}>
              <Share2 className="h-4 w-4 mr-2" />
              Partager
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Liste des filleuls */}
      <Card>
        <CardHeader>
          <CardTitle>Vos Filleuls</CardTitle>
        </CardHeader>
        <CardContent>
          {referrals.length > 0 ? (
            <div className="divide-y">
              {referrals.map((referral, index) => (
                <div key={index} className="py-4 flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {referral.profiles.first_name} {referral.profiles.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Inscrit le {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{referral.amount} points</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-muted-foreground py-8">
              Vous n'avez pas encore de filleuls. Partagez votre code pour commencer à gagner des points !
            </p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
