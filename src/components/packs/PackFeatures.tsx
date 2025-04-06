"use client";

import { Card } from "@/components/ui/card";
import { Check } from "lucide-react";

interface PackFeaturesProps {
  features: string[];
}

export default function PackFeatures({ features }: PackFeaturesProps) {
  return (
    <Card className="p-6">
      <ul className="space-y-3">
        {features.map((feature, index) => (
          <li key={index} className="flex items-center gap-3">
            <Check className="h-5 w-5 flex-shrink-0 text-green-500" />
            <span>{feature}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
