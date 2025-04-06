"use client";

import { PackLayout, PackFeatures, PackPricing } from "@/components/packs";

const features = [
  "5000 points",
  "Pour les joueurs passionnés",
  "Jusqu'à 2500 parties",
  "Prix adapté à votre région",
  "Notre meilleure réduction",
  "Idéal pour les parties Gold"
];

export default function ElitePack() {
  return (
    <PackLayout 
      title="Pack Premium" 
      description="Notre meilleure offre de points avec la réduction maximale"
    >
      <PackFeatures features={features} />
      <PackPricing 
        packId="pack_premium"
        points={5000}
        type="premium"
      />
    </PackLayout>
  );
}
