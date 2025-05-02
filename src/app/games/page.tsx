import React from 'react';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';

// Structure des données pour les jeux
interface Game {
  id: string;
  name: string;
  description: string;
  image: string;
  status: 'available' | 'popular' | 'new';
  minBet: string;
  maxWin: string;
  coinBet: string;
  path: string;
  themeColor: string;
  badgeText?: string;
  badgeColor?: string;
}

export default function GamesPage() {
  // Données statiques pour les jeux
  const games: Game[] = [
    {
      id: 'foods',
      name: 'Foods Cards',
      description: 'Gagnez des kits alimentaires de qualité ou leur équivalent en argent. Trouvez deux images identiques parmi les cartes.',
      image: '/images/games/cards/classic-cards.png',
      status: 'popular',
      minBet: '150 XOF',
      maxWin: '65 000 XOF',
      coinBet: '1 point',
      path: '/games/foods',
      themeColor: 'red',
      badgeText: 'POPULAIRE',
      badgeColor: 'bg-red-600'
    },
    {
      id: 'mode',
      name: 'Mode Cards',
      description: 'Remportez des vêtements tendance et accessoires de marque, ou optez pour leur valeur en argent.',
      image: '/images/games/cards/magic-fortune.png',
      status: 'available',
      minBet: '300 XOF',
      maxWin: '130 000 XOF',
      coinBet: '2 points',
      path: '/games/mode',
      themeColor: 'purple',
      badgeText: 'MODE',
      badgeColor: 'bg-purple-600'
    },
    {
      id: 'jackpot',
      name: 'Jackpot Cards',
      description: 'Tentez votre chance pour gagner des lots exceptionnels : voitures, voyages, électronique haut de gamme !',
      image: '/images/games/cards/gold-digger.png',
      status: 'available',
      minBet: '600 XOF',
      maxWin: '2 500 000 XOF',
      coinBet: '4 points',
      path: '/games/jackpot',
      themeColor: 'amber',
      badgeText: 'LOTS EXCEPTIONNELS',
      badgeColor: 'bg-yellow-500'
    },
    {
      id: 'community-jackpot',
      name: 'Jackpot Communautaire',
      description: 'Jouez pour votre communauté et gagnez des fonds pour soutenir sa cause. Trouvez la carte spéciale pour un gain collectif !',
      image: '/images/games/cards/community-jackpot.png',
      status: 'new',
      minBet: '300 XOF',
      maxWin: '1 000 000 XOF',
      coinBet: '3 points',
      path: '/games/community-jackpot',
      themeColor: 'purple',
      badgeText: 'NOUVEAU',
      badgeColor: 'bg-indigo-600'
    },
  ];

  return (
    <main className="min-h-screen bg-zinc-900">
      <div className="relative bg-gradient-to-r from-zinc-900 to-zinc-800 py-12 md:py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Nos Jeux de Hasard
            </h1>
            <p className="text-gray-300 max-w-3xl mx-auto text-lg">
              Découvrez notre collection de jeux d'argent uniques et tentez votre chance pour gagner des prix exceptionnels. Utilisez des euros ou des Coins pour jouer!
            </p>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="flex flex-col md:flex-row items-center justify-between mb-12 bg-zinc-800/50 p-6 rounded-lg">
          <div>
            <h2 className="text-xl font-bold text-white">Jeux à retourner</h2>
            <p className="text-gray-400 mt-1">
              Trouvez les cartes gagnantes pour des gains instantanés!
            </p>
          </div>
          <div className="mt-4 md:mt-0">
            <div className="flex items-center gap-3 text-white">
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-green-500 rounded-full mr-1"></span>
                <span className="text-sm">Disponible</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-red-500 rounded-full mr-1"></span>
                <span className="text-sm">Populaire</span>
              </div>
              <div className="flex items-center">
                <span className="inline-block w-3 h-3 bg-yellow-500 rounded-full mr-1"></span>
                <span className="text-sm">Nouveau</span>
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
          {games.map((game) => (
            <div
              key={game.id}
              className={`bg-zinc-800 rounded-xl overflow-hidden border border-zinc-700 transition-all hover:shadow-lg hover:shadow-${game.themeColor}-900/20 hover:-translate-y-1`}
            >
              <div className="relative aspect-[4/3]">
                <Image
                  src={game.image}
                  alt={game.name}
                  fill
                  className="object-cover"
                  unoptimized
                />
                {game.badgeText && (
                  <div className={`absolute top-4 right-4 ${game.badgeColor} text-white text-xs font-bold px-2 py-1 rounded`}>
                    {game.badgeText}
                  </div>
                )}
                <div className={`absolute bottom-4 left-4 flex items-center bg-black/60 px-2 py-1 rounded`}>
                  <span className={`inline-block w-2 h-2 ${
                    game.status === 'popular' ? 'bg-red-500' :
                    game.status === 'new' ? 'bg-yellow-500' : 'bg-green-500'
                  } rounded-full mr-1.5`}></span>
                  <span className="text-white text-xs">
                    {game.status === 'popular' ? 'Populaire' :
                     game.status === 'new' ? 'Nouveau' : 'Disponible'}
                  </span>
                </div>
              </div>

              <div className="p-6 flex flex-col gap-4">
                <h3 className="text-xl font-bold text-white mb-2">{game.name}</h3>
                <p className="text-gray-400 min-h-[60px] text-sm leading-tight">
                  {game.description}
                </p>

                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="bg-zinc-700/50 p-2 rounded">
                    <div className="text-gray-400">Mise minimum</div>
                    <div className="text-white font-semibold">{game.minBet} / {game.coinBet}</div>
                  </div>
                  <div className="bg-zinc-700/50 p-2 rounded">
                    <div className="text-gray-400">Gain maximum</div>
                    <div className="text-white font-semibold">{game.maxWin}</div>
                  </div>
                </div>

                <Link href={game.path}>
                  <Button className="w-full group casino-button">
                    <span>JOUER MAINTENANT</span>
                    <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-16 bg-gradient-to-r from-indigo-900/20 to-purple-800/20 rounded-xl p-8 border border-indigo-800/30">
          <div className="text-center">
            <h2 className="text-2xl font-bold text-white mb-3">D'autres jeux arrivent bientôt!</h2>
            <p className="text-lg text-gray-300 mb-8">
              Nous travaillons activement sur de nouveaux jeux de cartes passionnants. Inscrivez-vous dès maintenant pour découvrir nos lots exceptionnels !
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/register">
                <Button className="casino-button px-8 py-6">
                  S'INSCRIRE MAINTENANT
                </Button>
              </Link>
              <Link href="/promotions">
                <Button variant="outline" className="border-indigo-600 text-indigo-300 hover:bg-indigo-600/10 px-8 py-6">
                  VOIR NOS PROMOTIONS
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </main>
  );
}
