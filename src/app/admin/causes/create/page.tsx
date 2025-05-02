"use client";

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/components/ui/use-toast';
import { ChevronLeft, Calendar, Users, DollarSign, Award, ImageIcon } from 'lucide-react';

export default function CreateCausePage() {
  const router = useRouter();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    targetAmount: 1000,
    imageUrl: '',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    maxCommunities: 5,
    packPrice: 100,
    winningAmount: 800,
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: parseFloat(value) || 0,
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/causes', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to create cause');
      }

      const data = await response.json();
      
      toast({
        title: 'Succès',
        description: 'La cause a été créée avec succès',
      });
      
      router.push('/admin/causes');
    } catch (error: Error | unknown) {
      console.error('Error creating cause:', error);
      const errorMessage = error instanceof Error ? error.message : 'Erreur inconnue';
      toast({
        variant: 'destructive',
        title: 'Erreur',
        description: errorMessage || 'Impossible de créer la cause',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto py-8">
      <div className="flex items-center mb-6">
        <Link href="/admin/causes">
          <Button variant="ghost" className="mr-4">
            <ChevronLeft size={16} className="mr-2" />
            Retour
          </Button>
        </Link>
        <h1 className="text-3xl font-bold">Créer une nouvelle cause</h1>
      </div>

      <Card className="max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Informations de la cause</CardTitle>
        </CardHeader>
        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Nom de la cause *</Label>
              <Input
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Ex: Aide aux enfants défavorisés"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                placeholder="Décrivez la cause et son objectif..."
                rows={4}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="targetAmount">Montant cible (€) *</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="targetAmount"
                    name="targetAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.targetAmount}
                    onChange={handleNumberChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="winningAmount">Montant à gagner (€) *</Label>
                <div className="relative">
                  <Award size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="winningAmount"
                    name="winningAmount"
                    type="number"
                    min="0"
                    step="100"
                    value={formData.winningAmount}
                    onChange={handleNumberChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Date de début *</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="startDate"
                    name="startDate"
                    type="date"
                    value={formData.startDate}
                    onChange={handleChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="endDate">Date de fin (optionnelle)</Label>
                <div className="relative">
                  <Calendar size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="endDate"
                    name="endDate"
                    type="date"
                    value={formData.endDate}
                    onChange={handleChange}
                    className="pl-10"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="maxCommunities">Nombre max. de communautés *</Label>
                <div className="relative">
                  <Users size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="maxCommunities"
                    name="maxCommunities"
                    type="number"
                    min="2"
                    max="20"
                    value={formData.maxCommunities}
                    onChange={handleNumberChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="packPrice">Prix du pack (points) *</Label>
                <div className="relative">
                  <DollarSign size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="packPrice"
                    name="packPrice"
                    type="number"
                    min="0"
                    step="10"
                    value={formData.packPrice}
                    onChange={handleNumberChange}
                    className="pl-10"
                    required
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="imageUrl">URL de l'image (optionnelle)</Label>
              <div className="relative">
                <ImageIcon size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="imageUrl"
                  name="imageUrl"
                  type="url"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  placeholder="https://example.com/image.jpg"
                  className="pl-10"
                />
              </div>
            </div>
          </CardContent>

          <CardFooter className="flex justify-between">
            <Link href="/admin/causes">
              <Button variant="outline" type="button">Annuler</Button>
            </Link>
            <Button type="submit" disabled={loading}>
              {loading ? 'Création en cours...' : 'Créer la cause'}
            </Button>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
