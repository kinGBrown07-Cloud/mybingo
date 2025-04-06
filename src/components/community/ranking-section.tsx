import Image from 'next/image';

export default function RankingSection() {
  return (
    <section className="bg-dark-800 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Classement des Communautés
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div>
            <Image
              src="/images/community/ranking-elements.svg"
              alt="Podium des communautés"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>

          <div className="space-y-6">
            <div className="bg-dark-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-500 mb-4">Top Communautés</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">1. Les Conquérants</span>
                  <span className="text-yellow-500">15,000€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">2. Team Elite</span>
                  <span className="text-purple-400">12,500€</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-purple-300">3. Les Invincibles</span>
                  <span className="text-purple-400">10,000€</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Récompenses</h3>
              <ul className="space-y-2 text-gray-300">
                <li>🏆 1ère place : Bonus x3 sur les gains</li>
                <li>🥈 2ème place : Bonus x2 sur les gains</li>
                <li>🥉 3ème place : Bonus x1.5 sur les gains</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Image
            src="/images/community/dashboard-elements.svg"
            alt="Dashboard communautaire"
            width={400}
            height={200}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
