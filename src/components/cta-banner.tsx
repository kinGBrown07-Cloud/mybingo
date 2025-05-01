"use client";

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { X } from 'lucide-react';

export function CTABanner() {
  const [isVisible, setIsVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);

  // Afficher la bannière après un délai de 5 secondes
  useEffect(() => {
    if (!dismissed) {
      const timer = setTimeout(() => {
        setIsVisible(true);
      }, 5000);

      return () => clearTimeout(timer);
    }
  }, [dismissed]);

  // Afficher la bannière lors du défilement vers le bas
  useEffect(() => {
    if (dismissed) return;

    const handleScroll = () => {
      const scrollPosition = window.scrollY;
      const pageHeight = document.body.scrollHeight;
      const windowHeight = window.innerHeight;

      // Afficher la bannière lorsque l'utilisateur a fait défiler 30% de la page
      if (scrollPosition > (pageHeight - windowHeight) * 0.3) {
        setIsVisible(true);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => {
      window.removeEventListener('scroll', handleScroll);
    };
  }, [dismissed]);

  const handleDismiss = () => {
    setIsVisible(false);
    setDismissed(true);

    // Enregistrer la fermeture dans le localStorage pour ne pas réafficher pendant 24h
    localStorage.setItem('cta_banner_dismissed', new Date().toISOString());
  };

  // Si la bannière a été fermée dans les dernières 24h, ne pas l'afficher
  useEffect(() => {
    const lastDismissed = localStorage.getItem('cta_banner_dismissed');
    if (lastDismissed) {
      const dismissedTime = new Date(lastDismissed).getTime();
      const currentTime = new Date().getTime();
      const hoursDiff = (currentTime - dismissedTime) / (1000 * 60 * 60);

      if (hoursDiff < 24) {
        setDismissed(true);
      }
    }
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 md:p-6 bg-gradient-to-r from-red-900 to-red-700 shadow-lg transform transition-transform duration-500 ease-in-out">
      <div className="max-w-6xl mx-auto relative flex flex-col md:flex-row items-center justify-between">
        <button
          onClick={handleDismiss}
          className="absolute top-0 right-0 text-white hover:text-gray-200"
          aria-label="Fermer"
        >
          <X size={24} />
        </button>

        <div className="text-center md:text-left mb-4 md:mb-0 pr-8">
          <h3 className="text-white text-xl md:text-2xl font-bold">
            🎁 Obtenez 100€ + 100 Free Spins
          </h3>
          <p className="text-white opacity-90 mt-1">
            Inscrivez-vous maintenant et commencez à gagner dès aujourd'hui!
          </p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/auth/register">
            <Button className="w-full sm:w-auto bg-white hover:bg-yellow-100 text-red-700 font-bold px-8 py-3">
              CRÉER UN COMPTE
            </Button>
          </Link>
          <Link href="/promotions">
            <Button variant="outline" className="w-full sm:w-auto border-white text-white hover:bg-red-800 px-6 py-3">
              Voir les promotions
            </Button>
          </Link>
        </div>
      </div>

      <div className="text-center text-white text-xs mt-4 opacity-75">
        * Offre de bienvenue soumise à conditions. Jouer comporte des risques. Jouez responsablement.
      </div>
    </div>
  );
}
