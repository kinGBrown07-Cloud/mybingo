import Image from 'next/image';

export default function VIPSection() {
  return (
    <section className="bg-dark-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Niveaux VIP Exclusifs
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Standard VIP */}
          <div className="bg-dark-800 rounded-lg p-6 text-center">
            <Image
              src="/images/ui/vip-badges.svg"
              alt="Badge VIP Standard"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Standard</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Support prioritaire</li>
              <li>Bonus de bienvenue standard</li>
              <li>-40% sur les packs</li>
            </ul>
          </div>

          {/* Premium VIP */}
          <div className="bg-dark-800 rounded-lg p-6 text-center transform scale-105 border-2 border-yellow-500">
            <Image
              src="/images/ui/vip-badges.svg"
              alt="Badge VIP Premium"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-yellow-500 mb-4">Premium</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Support VIP 24/7</li>
              <li>Double bonus de bienvenue</li>
              <li>Accès aux tournois exclusifs</li>
              <li>-40% sur les packs</li>
            </ul>
          </div>

          {/* Elite VIP */}
          <div className="bg-dark-800 rounded-lg p-6 text-center">
            <Image
              src="/images/ui/vip-badges.svg"
              alt="Badge VIP Elite"
              width={120}
              height={120}
              className="mx-auto mb-4"
            />
            <h3 className="text-2xl font-bold text-purple-300 mb-4">Elite</h3>
            <ul className="text-gray-300 space-y-2">
              <li>Manager dédié</li>
              <li>Triple bonus de bienvenue</li>
              <li>Accès aux événements privés</li>
              <li>Cadeaux mensuels exclusifs</li>
              <li>-40% sur les packs</li>
            </ul>
          </div>
        </div>

        <div className="mt-12">
          <Image
            src="/images/ui/support-levels.svg"
            alt="Niveaux de support"
            width={400}
            height={200}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
