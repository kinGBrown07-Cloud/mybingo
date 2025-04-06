"use client";

import { PackLayout, PackFeatures, PackPricing } from "@/components/packs";

const features = [
  "1000 points",
  "Idéal pour débuter",
  "Jusqu'à 500 parties",
  "Prix adapté à votre région"
];

export default function DecouvertePack() {
  return (
    <PackLayout 
      title="Pack Basic" 
      description="Pack de points idéal pour débuter"
    >
      <PackFeatures features={features} />
      <PackPricing 
        packId="pack_basic"
        points={1000}
        type="basic"
      />
    </PackLayout>
  );
}
