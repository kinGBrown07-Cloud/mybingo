import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';

export function CardGamesSection() {
  return (
    <section className="py-16 bg-zinc-900">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-white mb-4">Jeux de Cartes</h2>
          <p className="text-gray-400 max-w-2xl mx-auto">
            Découvrez nos trois jeux de cartes exclusifs et tentez de remporter des lots exceptionnels.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Foods Cards */}
          <div className="relative rounded-lg overflow-hidden bg-zinc-800">
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-red-600 text-white text-xs font-bold px-3 py-1 rounded">
                  POPULAIRE
                </span>
              </div>
              <Image
                src="/images/games/cards/classic-cards.png"
                alt="Foods Cards"
                width={400}
                height={250}
                className="w-full aspect-square object-cover"
                unoptimized
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">Foods Cards</h3>
              <p className="text-gray-400 text-sm mb-4">
                Gagnez des kits alimentaires de qualité ou leur équivalent en argent. Trouvez deux images identiques parmi les cartes pour remporter votre lot.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Kits alimentaires premium
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Équivalent en argent possible
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  1 point par carte retournée
                </li>
              </ul>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                asChild
              >
                <Link href="/games/foods">JOUER MAINTENANT</Link>
              </Button>
            </div>
          </div>

          {/* Magic Fortune */}
          <div className="relative rounded-lg overflow-hidden bg-zinc-800">
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-purple-600 text-white text-xs font-bold px-3 py-1 rounded">
                  MODE
                </span>
              </div>
              <Image
                src="/images/games/cards/magic-fortune.png"
                alt="Mode Cards"
                width={400}
                height={250}
                className="w-full aspect-square object-cover"
                unoptimized
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">Mode Cards</h3>
              <p className="text-gray-400 text-sm mb-4">
                Remportez des vêtements tendance et accessoires de marque, ou optez pour leur valeur en argent. Associez les paires d'images pour gagner.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Vêtements de marque
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Accessoires premium
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  1 point par carte retournée
                </li>
              </ul>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                asChild
              >
                <Link href="/games/mode">JOUER MAINTENANT</Link>
              </Button>
            </div>
          </div>

          {/* Gold Digger */}
          <div className="relative rounded-lg overflow-hidden bg-zinc-800">
            <div className="relative">
              <div className="absolute top-2 right-2 z-10">
                <span className="bg-yellow-500 text-black text-xs font-bold px-3 py-1 rounded">
                  LOTS EXCEPTIONNELS
                </span>
              </div>
              <Image
                src="/images/games/cards/gold-digger.png"
                alt="Jackpot Cards"
                width={400}
                height={250}
                className="w-full aspect-square object-cover"
                unoptimized
              />
            </div>
            <div className="p-6">
              <h3 className="text-xl font-bold text-white mb-3">Jackpot Cards</h3>
              <p className="text-gray-400 text-sm mb-4">
                Tentez votre chance pour gagner des lots exceptionnels : voitures, voyages, électronique haut de gamme et bien plus encore !
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Lots de grande valeur
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  Prix exceptionnels garantis
                </li>
                <li className="flex items-center text-gray-300 text-sm">
                  <span className="text-green-500 mr-2">✓</span>
                  1 point par carte retournée
                </li>
              </ul>
              <Button
                className="w-full bg-red-600 hover:bg-red-700 text-white"
                asChild
              >
                <Link href="/games/jackpot">JOUER MAINTENANT</Link>
              </Button>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <p className="text-gray-400 mb-6">
            Tous les jeux incluent : un système de récompenses exclusif et un programme d'affiliation avec 10% sur le premier gain des membres affiliés
          </p>
          <Link href="/games">
            <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800">
              VOIR TOUS NOS JEUX
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
