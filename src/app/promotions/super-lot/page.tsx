"use client";

import React from 'react';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function SuperLot() {
  return (
    <main className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div>
            <div className="inline-block px-3 py-1 bg-yellow-500 text-black font-bold rounded-full mb-4 animate-pulse">
              SUPER-LOT DU MOIS
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-6">
              Scooter Électrique <br />
              <span className="text-yellow-400">Valeur : 3 800€</span>
            </h1>
            
            <div className="bg-zinc-800 rounded-xl p-6 mb-8">
              <h2 className="text-xl font-bold text-white mb-4">Comment participer ?</h2>
              <ul className="space-y-4">
                <li className="flex items-start text-gray-300">
                  <span className="text-yellow-400 mr-3 text-xl">1.</span>
                  <p>Misez 10€ ou plus sur n'importe quel jeu</p>
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-yellow-400 mr-3 text-xl">2.</span>
                  <p>Recevez automatiquement un ticket pour le tirage</p>
                </li>
                <li className="flex items-start text-gray-300">
                  <span className="text-yellow-400 mr-3 text-xl">3.</span>
                  <p>Plus vous jouez, plus vous augmentez vos chances</p>
                </li>
              </ul>
            </div>

            <div className="bg-zinc-800 rounded-xl p-6">
              <h2 className="text-xl font-bold text-white mb-4">Caractéristiques du lot</h2>
              <ul className="space-y-3">
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Autonomie jusqu'à 60 km
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">✓</span>
                  0 émission & écologique
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Livraison incluse en Afrique de l'Ouest
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-yellow-400 mr-2">✓</span>
                  Garantie 2 ans incluse
                </li>
              </ul>
            </div>

            <div className="mt-8">
              <Link href="/auth/register">
                <Button className="casino-button py-6 px-8 w-full sm:w-auto">
                  PARTICIPER MAINTENANT
                </Button>
              </Link>
            </div>
          </div>

          <div className="relative h-[500px] rounded-xl overflow-hidden">
            <Image
              src="/images/promotions/scooter.png"
              alt="Scooter Électrique"
              fill
              className="object-contain"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <div className="bg-yellow-500 text-black font-bold px-4 py-2 rounded-full inline-block">
                Tirage le 30 du mois
              </div>
            </div>
          </div>
        </div>

        <div className="mt-16 bg-zinc-800 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Règlement du tirage au sort</h2>
          <div className="prose prose-invert max-w-none">
            <ul className="space-y-2 text-gray-300">
              <li>Le tirage au sort a lieu le 30 de chaque mois</li>
              <li>Chaque mise de 10€ ou plus donne droit à un ticket</li>
              <li>Les tickets sont cumulables sans limite</li>
              <li>Le gagnant sera contacté par email</li>
              <li>Le lot doit être réclamé dans les 30 jours suivant le tirage</li>
            </ul>
          </div>
        </div>
      </div>
      <Footer />
    </main>
  );
}
