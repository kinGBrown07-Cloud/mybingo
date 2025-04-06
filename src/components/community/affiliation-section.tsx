import Image from 'next/image';

export default function AffiliationSection() {
  return (
    <section className="bg-dark-800 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Programme d'Affiliation
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <Image
              src="/images/community/affiliation-elements.svg"
              alt="Programme d'affiliation"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>

          <div className="space-y-8">
            <div className="bg-dark-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-500 mb-4">Vos Avantages</h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  10% sur le premier gain des affiliés
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  Suivi en temps réel des performances
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  Dashboard dédié
                </li>
              </ul>
            </div>

            <div className="bg-dark-900 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Comment ça marche</h3>
              <ol className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">1</span>
                  Invitez vos amis à rejoindre votre communauté
                </li>
                <li className="flex items-center">
                  <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">2</span>
                  Ils jouent et gagnent sur Bingoo
                </li>
                <li className="flex items-center">
                  <span className="bg-purple-600 rounded-full w-6 h-6 flex items-center justify-center mr-3">3</span>
                  Recevez 10% de leur premier gain
                </li>
              </ol>
            </div>
          </div>
        </div>

        <div className="mt-12 text-center">
          <button className="bg-purple-600 text-white px-8 py-3 rounded-lg hover:bg-purple-700 transition">
            Devenir Affilié
          </button>
        </div>
      </div>
    </section>
  );
}
