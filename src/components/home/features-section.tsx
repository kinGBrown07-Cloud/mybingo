import Image from 'next/image';
import Link from 'next/link';

export default function FeaturesSection() {
  return (
    <section className="py-16 bg-dark-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Nos Fonctionnalités Exclusives
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* VIP & Communautés */}
          <div className="bg-dark-800 rounded-lg p-6">
            <Image
              src="/images/ui/vip-badges.svg"
              alt="Badges VIP"
              width={200}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-yellow-500 text-center mb-4">
              Niveaux VIP
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Débloquez des avantages exclusifs avec nos différents niveaux VIP
            </p>
            <Link href="/communities" className="block text-center">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                En savoir plus
              </button>
            </Link>
          </div>

          {/* Tournois */}
          <div className="bg-dark-800 rounded-lg p-6">
            <Image
              src="/images/promotions/tournament-elements.svg"
              alt="Tournois"
              width={200}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-yellow-500 text-center mb-4">
              Tournois VIP
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Participez à des tournois exclusifs avec des prix exceptionnels
            </p>
            <Link href="/promotions" className="block text-center">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                Voir les tournois
              </button>
            </Link>
          </div>

          {/* Affiliation */}
          <div className="bg-dark-800 rounded-lg p-6">
            <Image
              src="/images/community/affiliation-elements.svg"
              alt="Programme d'affiliation"
              width={200}
              height={150}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-yellow-500 text-center mb-4">
              Affiliation
            </h3>
            <p className="text-gray-300 text-center mb-4">
              Gagnez 10% sur le premier gain de vos affiliés
            </p>
            <Link href="/communities" className="block text-center">
              <button className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700 transition">
                Devenir affilié
              </button>
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
