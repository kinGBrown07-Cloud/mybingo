"use client";

import { ReactNode } from "react";
import { Card } from "@/components/ui/card";

interface PackLayoutProps {
  title: string;
  description: string;
  children: React.ReactNode;
}

export default function PackLayout({ title, description, children }: PackLayoutProps) {
  return (
    <div className="container py-8">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        {children}
      </div>
    </div>
  );
}
