import Image from 'next/image';

export default function StatsSection() {
  return (
    <section className="py-16 bg-dark-800">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div>
            <Image
              src="/images/community/dashboard-elements.svg"
              alt="Statistiques communautaires"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl font-bold text-purple-400">
              Performances Communautaires
            </h2>

            <div className="grid grid-cols-2 gap-6">
              <div className="bg-dark-900 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">150K€</div>
                <div className="text-gray-300">Gains totaux</div>
              </div>

              <div className="bg-dark-900 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">1,200+</div>
                <div className="text-gray-300">Membres actifs</div>
              </div>

              <div className="bg-dark-900 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">50+</div>
                <div className="text-gray-300">Communautés</div>
              </div>

              <div className="bg-dark-900 rounded-lg p-6">
                <div className="text-3xl font-bold text-yellow-500 mb-2">15K€</div>
                <div className="text-gray-300">Plus gros gain</div>
              </div>
            </div>

            <div className="bg-dark-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Top 3 Communautés</h3>
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <span className="text-yellow-500">🏆 Les Conquérants</span>
                  <span className="text-gray-300">15,000€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">🥈 Team Elite</span>
                  <span className="text-gray-300">12,500€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-purple-300">🥉 Les Invincibles</span>
                  <span className="text-gray-300">10,000€</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
