"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { RegistrationForm } from '@/components/registration-form';

export const HeroBanner = () => {
  return (
    <div
      className="hero-banner relative"
      style={{
        backgroundImage: "url('https://ext.same-assets.com/3703704920/950845546.jpeg')"
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center">
          <div className="md:w-1/2 text-white">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-4">
              <span>DÉCOUVREZ</span>
              <br />
              <span className="text-red-600">JEUX DE CARTES EN LIGNE</span>
            </h1>
            <p className="text-xl md:text-2xl text-gray-300 mb-8">
              GAGNEZ DES LOTS EXCEPTIONNELS
              <br />
              +100 FREESPINS
            </p>
            <Dialog>
              <DialogTrigger asChild>
                <Button className="bingoo-button text-lg px-8 py-6">
                  JOUEZ MAINTENANT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px] p-0 bg-background border-border">
                <RegistrationForm />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>
    </div>
  );
};
