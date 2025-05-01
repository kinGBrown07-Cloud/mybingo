"use client";

import { AdBannerUpload } from '@/components/admin/ad-banner-upload';
import { Button } from '@/components/ui/button';
import { ArrowLeftIcon } from '@heroicons/react/24/outline';
import { useRouter } from 'next/navigation';

export default function NewAdBannerPage() {
  const router = useRouter();
  
  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button 
          variant="outline" 
          size="icon"
          onClick={() => router.back()}
        >
          <ArrowLeftIcon className="h-4 w-4" />
        </Button>
        <h1 className="text-3xl font-bold">Nouvelle Banniu00e8re Publicitaire</h1>
      </div>
      
      <AdBannerUpload />
    </div>
  );
}
