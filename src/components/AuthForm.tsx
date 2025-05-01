'use client';

import { useState } from 'react';
import { useAuthContext } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { Region, Currency } from '@/lib/constants/regions';

export default function AuthForm() {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneNumber, setPhoneNumber] = useState('');
  const [birthdate, setBirthdate] = useState('');
  const [country, setCountry] = useState('');
  const [region, setRegion] = useState<Region>(Region.BLACK_AFRICA); // Valeur par défaut pour l'Afrique subsaharienne
  const [currency, setCurrency] = useState<Currency>(Currency.XOF); // Valeur par défaut pour l'Afrique subsaharienne
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [isOver18, setIsOver18] = useState(false);
  const [referralCode, setReferralCode] = useState('');

  const { loading, error, success, signIn, signUp } = useAuthContext();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      if (isLogin) {
        await signIn(email, password);
        router.push('/profile');
      } else {
        await signUp({
          firstName,
          lastName,
          email,
          password,
          phoneNumber,
          birthdate,
          country,
          region,
          currency,
          acceptTerms,
          isOver18,
          referralCode
        });
        router.push('/profile');
      }
    } catch (err) {
      console.error('Erreur lors de l\'authentification:', err);
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-center">
        {isLogin ? 'Connexion' : 'Inscription'}
      </h2>

      {error && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Prénom
              </label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Nom
              </label>
              <input
                type="text"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>
          </>
        )}

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">
            Mot de passe
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
            required
          />
        </div>

        {!isLogin && (
          <>
            <div>
              <label className="block text-sm font-medium text-gray-700">
                Téléphone
              </label>
              <input
                type="tel"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Date de naissance
              </label>
              <input
                type="date"
                value={birthdate}
                onChange={(e) => setBirthdate(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Pays
              </label>
              <input
                type="text"
                value={country}
                onChange={(e) => setCountry(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Région
              </label>
              <select
                value={region}
                onChange={(e) => setRegion(e.target.value as Region)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionnez une région</option>
                <option value="BLACK_AFRICA">Afrique Noire</option>
                <option value="NORTH_AFRICA">Afrique du Nord</option>
                <option value="EUROPE">Europe</option>
                <option value="AMERICAS">Amériques</option>
                <option value="ASIA">Asie</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Devise
              </label>
              <select
                value={currency}
                onChange={(e) => setCurrency(e.target.value as Currency)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
                required
              >
                <option value="">Sélectionnez une devise</option>
                <option value="XOF">XOF</option>
                <option value="MAD">MAD</option>
                <option value="EUR">EUR</option>
                <option value="USD">USD</option>
              </select>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={acceptTerms}
                onChange={(e) => setAcceptTerms(e.target.checked)}
                className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                required
              />
              <label className="ml-2 block text-sm text-gray-900">
                J'accepte les conditions d'utilisation
              </label>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700">
                Code de parrainage (optionnel)
              </label>
              <input
                type="text"
                value={referralCode}
                onChange={(e) => setReferralCode(e.target.value)}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500"
              />
            </div>
          </>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50"
        >
          {loading ? 'Chargement...' : isLogin ? 'Se connecter' : 'S\'inscrire'}
        </button>
      </form>

      <div className="mt-4 text-center">
        <button
          onClick={() => setIsLogin(!isLogin)}
          className="text-sm text-indigo-600 hover:text-indigo-500"
        >
          {isLogin
            ? 'Pas encore de compte ? S\'inscrire'
            : 'Déjà un compte ? Se connecter'}
        </button>
      </div>
    </div>
  );
} 