import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function PromotionSection() {
  return (
    <section className="py-16 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Promotions Exclusives</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez nos offres spéciales et bonus pour maximiser vos chances de gagner.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Pack Découverte */}
          <div className="relative overflow-hidden rounded-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-red-900 to-red-700 opacity-90"></div>
            <div className="relative p-6 flex flex-col h-full min-h-[400px] items-center text-center">
              <div className="mb-4">
                <span className="inline-block p-6 rounded-full bg-white/20 transform transition-transform group-hover:scale-110">
                  <Image
                    src="/images/icons/money/bonus.png"
                    alt="Pack Découverte"
                    width={90}
                    height={90}
                    className="object-contain"
                    unoptimized
                  />
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Pack Découverte</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-gray-400 line-through text-2xl">500€</span>
                <div className="text-white text-5xl font-bold">300€</div>
              </div>
              <div className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full mb-4">
                -40% DE RÉDUCTION
              </div>
              <ul className="text-sm text-white/80 flex-grow space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Bonus de bienvenue standard
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Support prioritaire
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Dashboard communautaire
                </li>
              </ul>
              <div className="w-full">
                <Link href="/packs/decouverte" className="block">
                  <Button className="w-full bg-white hover:bg-gray-100 text-red-700 font-bold">
                    CHOISIR CE PACK
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Pack Premium */}
          <div className="relative overflow-hidden rounded-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-purple-900 to-purple-700 opacity-90"></div>
            <div className="relative p-6 flex flex-col h-full min-h-[400px] items-center text-center">
              <div className="absolute -top-1 right-4">
                <div className="bg-yellow-500 text-black text-sm font-bold px-4 py-1 rounded-b-lg">
                  POPULAIRE
                </div>
              </div>
              <div className="mb-4">
                <span className="inline-block p-6 rounded-full bg-white/20 transform transition-transform group-hover:scale-110">
                  <Image
                    src="/images/icons/money/cashback.png"
                    alt="Pack Premium"
                    width={90}
                    height={90}
                    className="object-contain"
                    unoptimized
                  />
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Pack Premium</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-gray-400 line-through text-2xl">1000€</span>
                <div className="text-white text-5xl font-bold">600€</div>
              </div>
              <div className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full mb-4">
                -40% DE RÉDUCTION
              </div>
              <ul className="text-sm text-white/80 flex-grow space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Double bonus de bienvenue
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Support VIP 24/7
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Accès aux tournois exclusifs
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Dashboard communautaire
                </li>
              </ul>
              <div className="w-full">
                <Link href="/packs/premium" className="block">
                  <Button className="w-full bg-white hover:bg-gray-100 text-purple-700 font-bold">
                    CHOISIR CE PACK
                  </Button>
                </Link>
              </div>
            </div>
          </div>

          {/* Pack Elite */}
          <div className="relative overflow-hidden rounded-lg group">
            <div className="absolute inset-0 bg-gradient-to-br from-amber-800 to-yellow-700 opacity-90"></div>
            <div className="relative p-6 flex flex-col h-full min-h-[400px] items-center text-center">
              <div className="mb-4">
                <span className="inline-block p-6 rounded-full bg-white/20 transform transition-transform group-hover:scale-110">
                  <Image
                    src="/images/icons/money/coins.png"
                    alt="Pack Elite"
                    width={90}
                    height={90}
                    className="object-contain"
                    unoptimized
                  />
                </span>
              </div>
              <h3 className="text-xl font-bold text-white mb-1">Pack Elite</h3>
              <div className="flex items-center justify-center gap-3 mb-2">
                <span className="text-gray-400 line-through text-2xl">2500€</span>
                <div className="text-white text-5xl font-bold">1500€</div>
              </div>
              <div className="bg-yellow-500 text-black text-sm font-bold px-3 py-1 rounded-full mb-4">
                -40% DE RÉDUCTION
              </div>
              <ul className="text-sm text-white/80 flex-grow space-y-2 mb-6">
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Triple bonus de bienvenue
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Manager dédié
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Accès aux événements privés
                </li>
                <li className="flex items-center justify-center">
                  <span className="text-yellow-500 mr-2">✓</span>
                  Cadeaux mensuels exclusifs
                </li>
              </ul>
              <div className="w-full">
                <Link href="/packs/elite" className="block">
                  <Button className="w-full bg-white hover:bg-gray-100 text-amber-700 font-bold">
                    CHOISIR CE PACK
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">
            Tous les packs incluent : Dashboard communautaire, suivi des performances en temps réel et programme d'affiliation avec 10% sur le premier gain des membres affiliés
          </p>
          <Link href="/promotions">
            <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
              VOIR TOUTES NOS PROMOTIONS
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
