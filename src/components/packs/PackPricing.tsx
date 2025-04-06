"use client";

import { Card } from "@/components/ui/card";
import PayPalPurchase from "./PayPalPurchase";
import { useEffect, useState } from "react";
import { detectUserRegion } from "@/services/regionService";
import { getPackPrice } from "@/services/packService";

interface PackPricingProps {
  packId: string;
  points: number;
  type: string;
}

export default function PackPricing({ packId, points, type }: PackPricingProps) {
  const [price, setPrice] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadPrice() {
      try {
        const region = await detectUserRegion();
        const price = await getPackPrice(packId, region);
        setPrice(price);
      } catch (error) {
        console.error("Error loading price:", error);
      } finally {
        setIsLoading(false);
      }
    }
    loadPrice();
  }, [packId]);

  if (isLoading || price === null) {
    return (
      <Card className="p-6">
        <div className="text-center">Chargement du prix...</div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <PayPalPurchase packId={packId} price={price} />
    </Card>
  );
}
