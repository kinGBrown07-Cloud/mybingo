"use client";

import React from 'react';
import { CommunityNav } from '@/components/community-nav';
import { Button } from '@/components/ui/button';

export default function CommunityPacks() {
  const packs = [
    {
      name: "Pack Découverte",
      originalPrice: "500€",
      discountedPrice: "300€",
      discount: "-40%",
      features: [
        "Idéal pour débuter",
        "Bonus de bienvenue inclus",
        "Support prioritaire"
      ]
    },
    {
      name: "Pack Premium",
      originalPrice: "1000€",
      discountedPrice: "600€",
      discount: "-40%",
      features: [
        "Double bonus de bienvenue",
        "Support VIP 24/7",
        "Accès aux tournois exclusifs"
      ],
      popular: true
    },
    {
      name: "Pack Elite",
      originalPrice: "2500€",
      discountedPrice: "1500€",
      discount: "-40%",
      features: [
        "Triple bonus de bienvenue",
        "Manager dédié",
        "Accès aux événements privés",
        "Cadeaux mensuels exclusifs"
      ]
    }
  ];

  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Packs Communautaires</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {packs.map((pack, index) => (
            <div 
              key={index}
              className={`
                relative bg-zinc-800 rounded-xl overflow-hidden border
                ${pack.popular ? 'border-purple-500' : 'border-zinc-700'}
              `}
            >
              {pack.popular && (
                <div className="absolute top-4 right-4">
                  <span className="bg-purple-500 text-white px-3 py-1 rounded-full text-sm font-medium">
                    POPULAIRE
                  </span>
                </div>
              )}
              
              <div className="p-6">
                <h2 className="text-2xl font-bold text-white mb-4">{pack.name}</h2>
                <div className="flex items-baseline mb-6">
                  <span className="text-3xl font-bold text-white">{pack.discountedPrice}</span>
                  <span className="ml-2 text-lg text-gray-400 line-through">{pack.originalPrice}</span>
                  <span className="ml-2 text-emerald-400 font-bold">{pack.discount}</span>
                </div>
                
                <ul className="space-y-4 mb-8">
                  {pack.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center text-gray-300">
                      <span className="text-purple-400 mr-2">✓</span>
                      {feature}
                    </li>
                  ))}
                </ul>
                
                <Button className={`
                  w-full py-6
                  ${pack.popular 
                    ? 'bg-purple-500 hover:bg-purple-600' 
                    : 'bg-zinc-700 hover:bg-zinc-600'
                  } text-white
                `}>
                  ACHETER CE PACK
                </Button>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-zinc-800 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Pourquoi choisir un pack ?</h2>
            <ul className="space-y-4">
              <li className="flex items-start">
                <span className="text-purple-400 mr-3 text-xl">1.</span>
                <div>
                  <h3 className="font-bold text-white mb-1">Économies garanties</h3>
                  <p className="text-gray-300">40% de réduction sur tous les packs communautaires</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3 text-xl">2.</span>
                <div>
                  <h3 className="font-bold text-white mb-1">Bonus exclusifs</h3>
                  <p className="text-gray-300">Des bonus de bienvenue majorés pour votre communauté</p>
                </div>
              </li>
              <li className="flex items-start">
                <span className="text-purple-400 mr-3 text-xl">3.</span>
                <div>
                  <h3 className="font-bold text-white mb-1">Support prioritaire</h3>
                  <p className="text-gray-300">Une équipe dédiée pour vous accompagner</p>
                </div>
              </li>
            </ul>
          </div>

          <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-8">
            <h2 className="text-2xl font-bold text-white mb-6">Programme d'Affiliation</h2>
            <p className="text-gray-300 mb-6">
              En plus des réductions sur les packs, profitez de notre programme d'affiliation :
            </p>
            <ul className="space-y-4 mb-8">
              <li className="flex items-center text-white">
                <span className="text-yellow-400 mr-2">→</span>
                10% sur le premier gain de chaque membre affilié
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-400 mr-2">→</span>
                Suivi des performances en temps réel
              </li>
              <li className="flex items-center text-white">
                <span className="text-yellow-400 mr-2">→</span>
                Dashboard dédié pour votre communauté
              </li>
            </ul>
            <p className="text-sm text-gray-300">
              * Les gains d'affiliation sont automatiquement crédités sur votre compte communautaire
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
