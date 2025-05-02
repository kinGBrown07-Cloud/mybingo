"use client";

import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { CommunityNav } from '@/components/community-nav';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { toast } from 'react-hot-toast';

export default function CreateCommunity() {
  const session = useSession();
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    cause: '',
    description: '',
    targetAmount: 1000,
  });

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (session.status === 'unauthenticated') {
      toast.error('Vous devez être connecté pour créer une communauté');
      router.push('/auth/login');
    }
  }, [session.status, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [id]: id === 'targetAmount' ? parseInt(value) || 1000 : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!session.data) {
      toast.error('Vous devez être connecté pour créer une communauté');
      return;
    }
    
    try {
      setLoading(true);
      
      const response = await fetch('/api/communities', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create community');
      }
      
      const data = await response.json();
      
      toast.success('Communauté créée avec succès!');
      router.push(`/communities/${data.community.id}`);
    } catch (err: Error | unknown) {
      console.error('Error creating community:', err);
      const errorMessage = err instanceof Error ? err.message : 'Erreur lors de la création de la communauté';
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="min-h-screen bg-background">
      <CommunityNav />
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <h1 className="text-4xl font-bold text-white mb-8">Créer une Communauté</h1>
        <div className="bg-zinc-800 rounded-xl p-6">
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-white">
                Nom de la communauté
              </label>
              <input
                type="text"
                id="name"
                value={formData.name}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={50}
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
                value={formData.cause}
                onChange={handleChange}
                required
                minLength={3}
                maxLength={100}
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
                value={formData.description}
                onChange={handleChange}
                maxLength={500}
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
            </div>
            <div>
              <label htmlFor="targetAmount" className="block text-sm font-medium text-white">
                Objectif de collecte (€)
              </label>
              <input
                type="number"
                id="targetAmount"
                min="1000"
                step="100"
                value={formData.targetAmount}
                onChange={handleChange}
                required
                className="mt-1 block w-full rounded-md bg-zinc-700 border-zinc-600 text-white shadow-sm focus:border-purple-500 focus:ring-purple-500"
              />
              <p className="mt-1 text-sm text-gray-400">Minimum 1000€</p>
            </div>
            <Button 
              type="submit"
              disabled={loading || session.status !== 'authenticated'}
              className="w-full bg-purple-500 hover:bg-purple-600 text-white py-6 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'CRÉATION EN COURS...' : 'CRÉER LA COMMUNAUTÉ'}
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
