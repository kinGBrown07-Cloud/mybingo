import Image from 'next/image';

export default function TournamentsSection() {
  return (
    <section className="bg-dark-900 py-16">
      <div className="container mx-auto px-4">
        <h2 className="text-4xl font-bold text-purple-400 text-center mb-12">
          Tournois VIP
        </h2>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div>
            <Image
              src="/images/promotions/tournament-elements.svg"
              alt="Tournois VIP"
              width={400}
              height={300}
              className="mx-auto"
            />
          </div>

          <div className="space-y-8">
            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-yellow-500 mb-4">Tournoi en cours</h3>
              <div className="space-y-4">
                <p className="text-purple-300">Super Slot Championship</p>
                <div className="flex justify-between text-gray-300">
                  <span>Prix total</span>
                  <span className="text-yellow-500">8,500€</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Participants</span>
                  <span>42/100</span>
                </div>
                <div className="flex justify-between text-gray-300">
                  <span>Temps restant</span>
                  <span className="text-green-500">2j 14h</span>
                </div>
              </div>
            </div>

            <div className="bg-dark-800 rounded-lg p-6">
              <h3 className="text-2xl font-bold text-purple-400 mb-4">Prochains tournois</h3>
              <ul className="space-y-4">
                <li className="flex justify-between items-center">
                  <span className="text-purple-300">Poker Masters</span>
                  <span className="text-yellow-500">Dans 3 jours</span>
                </li>
                <li className="flex justify-between items-center">
                  <span className="text-purple-300">Roulette Royale</span>
                  <span className="text-yellow-500">Dans 5 jours</span>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12">
          <Image
            src="/images/promotions/private-events.svg"
            alt="Événements privés"
            width={400}
            height={200}
            className="mx-auto"
          />
        </div>
      </div>
    </section>
  );
}
