"use client";

import { PackLayout, PackFeatures, PackPricing } from "@/components/packs";

const features = [
  "2500 points",
  "Parfait pour les joueurs réguliers",
  "Jusqu'à 1250 parties",
  "Prix adapté à votre région",
  "Réduction plus importante"
];

export default function PremiumPack() {
  return (
    <PackLayout 
      title="Pack Plus" 
      description="Pack de points avec une réduction plus importante"
    >
      <PackFeatures features={features} />
      <PackPricing 
        packId="pack_plus"
        points={2500}
        type="plus"
      />
    </PackLayout>
  );
}
