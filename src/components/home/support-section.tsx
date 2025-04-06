import Image from 'next/image';

export default function SupportSection() {
  return (
    <section className="py-16 bg-dark-900">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Support Client Premium
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          <div className="space-y-8">
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-500 mb-4">
                Assistance 24/7
              </h3>
              <p className="text-gray-300 mb-4">
                Notre équipe de support est disponible à tout moment pour vous aider
              </p>
              <div className="space-y-4">
                <div className="flex items-center">
                  <span className="text-purple-400 mr-2">📧</span>
                  <span className="text-gray-300">infos@mybingoo.com</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-400 mr-2">📞</span>
                  <span className="text-gray-300">+228 90481428</span>
                </div>
                <div className="flex items-center">
                  <span className="text-purple-400 mr-2">🌐</span>
                  <span className="text-gray-300">mybingoo.com</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">
                Support Personnalisé
              </h3>
              <ul className="space-y-4 text-gray-300">
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  Support prioritaire pour tous les membres
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  Support VIP 24/7 pour les membres Premium
                </li>
                <li className="flex items-center">
                  <span className="text-yellow-500 mr-2">→</span>
                  Manager dédié pour les membres Elite
                </li>
              </ul>
            </div>
          </div>

          <div>
            <Image
              src="/images/ui/support-levels.svg"
              alt="Niveaux de support"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>
        </div>
      </div>
    </section>
  );
}
