"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import TournamentsSection from '@/components/promotions/tournaments-section';

export default function PromotionsPage() {
  const router = useRouter();

  useEffect(() => {
    router.push('/');
  }, [router]);

  return (
    <main>
      <TournamentsSection />
    </main>
  );
}
