'use client';

import { ReactNode } from 'react';
import Image from 'next/image';

interface AuthLayoutProps {
  children: ReactNode;
}

export default function AuthLayout({ children }: AuthLayoutProps) {
  return (
    <div className="min-h-screen relative flex">
      {/* Image de fond qui couvre toute la page */}
      <div className="absolute inset-0 z-0">
        <Image 
          src="/images/auth/auth-banner.jpg" 
          alt="Bingoo Background" 
          fill
          className="object-cover"
          priority
        />
        <div className="absolute inset-0 bg-black/50" />
      </div>
      
      {/* Contenu à gauche (visible uniquement sur grands écrans) */}
      <div className="hidden md:flex z-10 w-1/2 items-center justify-center p-12">
        <div className="text-white">
          <h1 className="text-5xl font-bold mb-6">Bienvenue sur Bingoo</h1>
          <p className="text-xl mb-8">
            La plateforme de jeu qui change des vies. Jouez, gagnez et soutenez des causes qui vous tiennent à cœur.
          </p>
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center">
              <span className="text-xl font-bold">1M+</span>
            </div>
            <div>
              <p className="text-lg font-semibold">Joueurs actifs</p>
              <p className="text-sm text-white/70">Rejoignez notre communauté mondiale</p>
            </div>
          </div>
        </div>
      </div>
      
      {/* Formulaire à droite */}
      <div className="z-10 w-full md:w-1/2 flex items-center justify-center ml-auto">
        <div className="w-full max-w-2xl p-8 bg-white/10 backdrop-blur-md rounded-l-xl shadow-2xl border-l border-y border-white/20">
          <div className="mb-6 text-center">
            <Image 
              src="/images/logos/logo.png" 
              alt="Bingoo" 
              width={80} 
              height={80} 
              className="mx-auto mb-4"
            />
            <h2 className="text-2xl font-bold text-white">Bingoo</h2>
            <p className="text-white/80">La plateforme de jeu qui change des vies</p>
          </div>
          
          {children}
        </div>
      </div>
    </div>
  );
}
