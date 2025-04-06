"use client";

import React from 'react';
import { Button } from '@/components/ui/button';
import { CommunityNav } from '@/components/community-nav';

export default function CreateCommunity() {
  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Créer une Communauté</h1>
        <div className="bg-zinc-800 rounded-xl p-6">
          <form className="space-y-6">
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Nom de la communauté
              </label>
              <input
                type="text"
                id="name"
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="cause" className="block text-sm font-medium text-white">
                Cause soutenue
              </label>
              <input
                type="text"
                id="cause"
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-white">
                Description
              </label>
              <textarea
                id="description"
                rows={4}
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="target" className="block text-sm font-medium text-white">
                Objectif de collecte (€)
              </label>
              <input
                type="number"
                id="target"
                min="1000"
                step="100"
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="mt-1 text-sm text-gray-400">Minimum 1000€</p>
            </div>
            <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6">
              CRÉER LA COMMUNAUTÉ
            </Button>
          </form>
        </div>

        <div className="mt-8 bg-zinc-700/50 rounded-xl p-6">
          <h2 className="text-xl font-bold text-white mb-4">Avantages des communautés</h2>
          <ul className="space-y-3">
            <li className="flex items-center text-gray-300">
              <span className="text-purple-400 mr-2">✓</span>
              Pack de démarrage à -50%
            </li>
            <li className="flex items-center text-gray-300">
              <span className="text-purple-400 mr-2">✓</span>
              Dashboard communautaire
            </li>
            <li className="flex items-center text-gray-300">
              <span className="text-purple-400 mr-2">✓</span>
              Suivi des gains en temps réel
            </li>
            <li className="flex items-center text-gray-300">
              <span className="text-purple-400 mr-2">✓</span>
              10% sur le premier gain de chaque membre affilié
            </li>
          </ul>
        </div>
      </div>
    </main>
  );
}
