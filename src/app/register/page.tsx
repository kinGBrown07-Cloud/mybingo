"use client";

import React, { useState } from 'react';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import Link from 'next/link';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/use-auth';
import { RegisterData } from '@/types/auth';

const COUNTRIES = [
  { name: 'Sénégal', region: 'BLACK_AFRICA', currency: 'XOF' },
  { name: 'Mali', region: 'BLACK_AFRICA', currency: 'XOF' },
  { name: 'Côte d\'Ivoire', region: 'BLACK_AFRICA', currency: 'XOF' },
  { name: 'Burkina Faso', region: 'BLACK_AFRICA', currency: 'XOF' },
  { name: 'Maroc', region: 'NORTH_AFRICA', currency: 'MAD' },
  { name: 'France', region: 'EUROPE', currency: 'EUR' },
  { name: 'Belgique', region: 'EUROPE', currency: 'EUR' },
  { name: 'Canada', region: 'AMERICAS', currency: 'USD' },
  { name: 'États-Unis', region: 'AMERICAS', currency: 'USD' },
];

export default function RegisterPage() {
  const { register, isLoading, error } = useAuth();
  const [formData, setFormData] = useState<RegisterData>({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    phoneNumber: '',
    birthdate: '',
    country: '',
    region: '',
    currency: '',
    acceptTerms: false,
    referralCode: ''
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    await register(formData);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-gray-800 text-white">
      <main className="container mx-auto px-4 py-8">
        <Card className="max-w-md mx-auto bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-2xl font-bold text-center">Créer un compte</CardTitle>
            <CardDescription className="text-gray-400 text-center">
              Informations personnelles
            </CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent>
              {error && (
                <div className="mb-4 p-3 rounded bg-red-500/10 border border-red-500/50 text-red-500">
                  {error}
                </div>
              )}
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label htmlFor="firstName" className="text-sm font-medium">
                      Prénom
                    </label>
                    <Input
                      id="firstName"
                      name="firstName"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="lastName" className="text-sm font-medium">
                      Nom
                    </label>
                    <Input
                      id="lastName"
                      name="lastName"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                      className="bg-gray-700 border-gray-600"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label htmlFor="email" className="text-sm font-medium">
                    Email
                  </label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    value={formData.email}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="password" className="text-sm font-medium">
                    Mot de passe
                  </label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="phoneNumber" className="text-sm font-medium">
                    Numéro de téléphone
                  </label>
                  <Input
                    id="phoneNumber"
                    name="phoneNumber"
                    type="tel"
                    value={formData.phoneNumber}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="birthdate" className="text-sm font-medium">
                    Date de naissance
                  </label>
                  <Input
                    id="birthdate"
                    name="birthdate"
                    type="date"
                    value={formData.birthdate}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="space-y-2">
                  <label htmlFor="country" className="text-sm font-medium">
                    Pays
                  </label>
                  <Select
                    value={formData.country}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, country: value, region: COUNTRIES.find(c => c.name === value)?.region || '', currency: COUNTRIES.find(c => c.name === value)?.currency || '' }))}
                  >
                    <SelectTrigger className="bg-gray-700 border-gray-600">
                      <SelectValue placeholder="Sélectionnez votre pays" />
                    </SelectTrigger>
                    <SelectContent>
                      {COUNTRIES.map(country => (
                        <SelectItem key={country.name} value={country.name}>
                          {country.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="referralCode" className="text-sm font-medium">
                    Code de parrainage (optionnel)
                  </label>
                  <Input
                    id="referralCode"
                    name="referralCode"
                    value={formData.referralCode}
                    onChange={handleChange}
                    className="bg-gray-700 border-gray-600"
                  />
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="acceptTerms"
                    name="acceptTerms"
                    checked={formData.acceptTerms}
                    onCheckedChange={(checked: boolean) =>
                      setFormData(prev => ({ ...prev, acceptTerms: checked }))
                    }
                  />
                  <label
                    htmlFor="acceptTerms"
                    className="text-sm text-gray-300"
                  >
                    J'accepte les{' '}
                    <Link
                      href="/terms"
                      className="text-green-500 hover:text-green-400"
                    >
                      conditions d'utilisation
                    </Link>
                  </label>
                </div>
              </div>
            </CardContent>

            <CardFooter className="flex flex-col space-y-4">
              <Button
                type="submit"
                className="w-full bg-green-600 hover:bg-green-700"
                disabled={isLoading}
              >
                {isLoading ? 'Inscription...' : 'S\'inscrire'}
              </Button>

              <div className="text-center text-sm text-gray-400">
                Déjà un compte ?{' '}
                <Link
                  href="/login"
                  className="text-green-500 hover:text-green-400"
                >
                  Se connecter
                </Link>
              </div>
            </CardFooter>
          </form>
        </Card>
      </main>
    </div>
  );
}
