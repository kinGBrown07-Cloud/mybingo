import React from 'react';
import Link from 'next/link';
import { Footer } from '@/components/footer';
import { Button } from '@/components/ui/button';

export default function NotFound() {
  return (
    <div className="flex flex-col min-h-screen">
      <div className="flex-1 container mx-auto px-4 py-16">
        <div className="text-center">
          <h1 className="text-4xl font-bold text-purple-500 mb-4">404</h1>
          <h2 className="text-2xl font-semibold text-white mb-4">Page non trouvée</h2>
          <p className="text-gray-400 mb-8">
            Désolé, la page que vous recherchez n&apos;existe pas ou a été déplacée.
          </p>
          <Link href="/">
            <Button variant="default" className="bg-purple-600 hover:bg-purple-700">
              Retour à l&apos;accueil
            </Button>
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}
