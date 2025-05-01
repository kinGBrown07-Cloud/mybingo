"use client";

import React, { useEffect, useState } from 'react';
import { Footer } from '@/components/footer';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { CTABanner } from '@/components/cta-banner';
import { PromotionSection } from '@/components/promotion-section';
import { CardGamesSection } from '@/components/card-games-section';
import { VideoSection } from '@/components/video-section';
import { AdBanner } from '@/components/ad-banner';
import type { AdBanner as AdBannerType } from '@/lib/services/adService';

const mainVideo = {
  id: "main",
  title: "Découvrez Bingoo",
  description: "Plongez dans l'univers passionnant de Bingoo et découvrez nos jeux de cartes exclusifs.",
  thumbnail: "/images/banners/hero-banner.svg",
  url: "/videos/bingoo.mp4",
  duration: "2:30"
};

const testimonials = [
  {
    id: "pub",
    title: "Bingoo - Le jeu qui change des vies",
    description: "Regardez comment nos joueurs transforment leur passion du jeu en gains exceptionnels.",
    thumbnail: "/images/banners/hero-banner.svg",
    url: "/videos/pub-bingoo.mp4",
    duration: "1:45"
  }
];

export default function Home() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [topBanners, setTopBanners] = useState<AdBannerType[]>([]);
  const [middleBanners, setMiddleBanners] = useState<AdBannerType[]>([]);
  const [bottomBanners, setBottomBanners] = useState<AdBannerType[]>([]);
  const slides = [
    {
      image: "/images/banners/hero-banner.png",
      title: "BINGOO",
      subtitle: "LA PLATEFORME DE JEU MONDIALE"
    },
    {
      image: "/images/banners/promotion-banner.png",
      title: "GAGNEZ GROS",
      subtitle: "DES LOTS EXCEPTIONNELS"
    },
    {
      image: "/images/banners/community-header.png",
      title: "REJOIGNEZ-NOUS",
      subtitle: "UNE COMMUNAUTÉ MONDIALE"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prevSlide) => (prevSlide + 1) % slides.length);
    }, 5000);

    // Charger les bannières publicitaires
    const fetchAdBanners = async () => {
      try {
        const response = await fetch('/api/ads/banners');
        if (response.ok) {
          const data = await response.json();
          setTopBanners(data.filter((ad: AdBannerType) => ad.position === 'top'));
          setMiddleBanners(data.filter((ad: AdBannerType) => ad.position === 'middle'));
          setBottomBanners(data.filter((ad: AdBannerType) => ad.position === 'bottom'));
        }
      } catch (error) {
        console.error('Erreur lors du chargement des bannières:', error);
      }
    };

    fetchAdBanners();

    return () => clearInterval(timer);
  }, [slides.length]);

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner avec Slider */}
      <div className="relative h-[400px] md:h-[500px] bg-zinc-900">
        {slides.map((slide, index) => (
          <div
            key={index}
            className={`absolute inset-0 transition-opacity duration-1000 ${
              currentSlide === index ? "opacity-100" : "opacity-0"
            }`}
          >
            <Image
              src={slide.image}
              alt={slide.title}
              fill
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 to-black/30 flex items-center">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
                <div className="md:w-1/2 text-white">
                  <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-4">
                    <span className="text-red-600">{slide.title}</span>
                    <br />
                    <span>{slide.subtitle}</span>
                  </h1>
                  <p className="text-2xl md:text-3xl font-bold mb-6">
                    GAGNEZ JUSQU'À 10 000€
                    <br />
                    <span className="text-yellow-500">PROGRAMME D'AFFILIATION EXCLUSIF</span>
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4">
                    <Link href="/register">
                      <Button className="w-full casino-button text-lg px-8 py-6">
                        INSCRIVEZ-VOUS
                      </Button>
                    </Link>
                    <Link href="/games">
                      <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800 px-8 py-6 w-full sm:w-auto">
                        VOIR LES JEUX
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Section Avantages */}
      <div className="bg-zinc-800 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="flex items-center">
              <div className="bg-red-700 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold">Sécurité Garantie</h3>
                <p className="text-gray-400 text-sm">Plateforme sécurisée et licenciée</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-red-700 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold">Paiements Rapides</h3>
                <p className="text-gray-400 text-sm">Retraits en 24h maximum</p>
              </div>
            </div>
            <div className="flex items-center">
              <div className="bg-red-700 rounded-full p-3 mr-4">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
              </div>
              <div>
                <h3 className="text-white font-bold">Support 24/7</h3>
                <p className="text-gray-400 text-sm">Assistance disponible en tout temps</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bannière publicitaire TOP */}
      {topBanners.length > 0 && (
        <section className="py-4">
          <AdBanner
            id={topBanners[0].id}
            title={topBanners[0].title}
            description={topBanners[0].description}
            imageUrl={topBanners[0].imageUrl}
            ctaText={topBanners[0].ctaText}
            ctaLink={topBanners[0].ctaLink}
            backgroundColor={topBanners[0].backgroundColor}
            textColor={topBanners[0].textColor}
            position="top"
          />
        </section>
      )}

      {/* Section Super-Lot du moment */}
      <section className="py-12 bg-gradient-to-r from-indigo-900 to-purple-900 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <Image
            src="/images/promotions/super-lot.png"
            alt="Motif"
            fill
            className="object-cover"
            unoptimized
          />
        </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div>
              <div className="inline-block px-3 py-1 bg-yellow-500 text-black font-bold rounded-full mb-4 animate-pulse">
                SUPER-LOT EXCEPTIONNEL
              </div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Gagnez un Scooter <span className="text-yellow-400">Électrique</span>
              </h2>
              <p className="text-white/80 mb-6">
                Jouez au mode Jackpot Cards et tentez de gagner ce superbe scooter électrique d'une valeur de 3800€ !
                Le Jackpot Cards est notre jeu premium qui vous permet de remporter les lots les plus exceptionnels.
              </p>
              <ul className="space-y-2 mb-6">
                <li className="flex items-center text-white">
                  <span className="text-yellow-400 mr-2">✓</span> Mise minimum de 20 points
                </li>
                <li className="flex items-center text-white">
                  <span className="text-yellow-400 mr-2">✓</span> Gain maximum de 3800€ (2 500 000 XOF)
                </li>
                <li className="flex items-center text-white">
                  <span className="text-yellow-400 mr-2">✓</span> Livraison incluse dans toute l'Afrique et l'Europe
                </li>
              </ul>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/register">
                  <Button className="w-full casino-button">
                    PARTICIPER MAINTENANT
                  </Button>
                </Link>
                <Link href="/promotions/super-lot">
                  <Button variant="outline" className="border-white text-white hover:bg-white/10">
                    PLUS DE DÉTAILS
                  </Button>
                </Link>
              </div>
              <p className="text-white/60 text-sm mt-4">
                Tirage au sort le 30 de chaque mois. Voir règlement complet dans les conditions du jeu.
              </p>
            </div>
            <div className="relative h-[300px] md:h-[400px]">
              <Image
                src="/images/promotions/super-lot.png"
                alt="Scooter Électrique"
                fill
                className="object-contain"
                unoptimized
              />
              <div className="absolute top-0 right-0 bg-yellow-500 text-black font-bold px-4 py-2 rounded-full">
                Valeur: 3800€
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Section des promotions */}
      <PromotionSection />

      {/* Bannière publicitaire MIDDLE */}
      {middleBanners.length > 0 && (
        <section className="py-4">
          <AdBanner
            id={middleBanners[0].id}
            title={middleBanners[0].title}
            description={middleBanners[0].description}
            imageUrl={middleBanners[0].imageUrl}
            ctaText={middleBanners[0].ctaText}
            ctaLink={middleBanners[0].ctaLink}
            backgroundColor={middleBanners[0].backgroundColor}
            textColor={middleBanners[0].textColor}
            position="middle"
          />
        </section>
      )}

      {/* Section CardGames */}
      <CardGamesSection />

      {/* Section Vidéo */}
      <VideoSection mainVideo={mainVideo} testimonials={testimonials} />

      {/* Bannière publicitaire BOTTOM */}
      {bottomBanners.length > 0 && (
        <section className="py-4">
          <AdBanner
            id={bottomBanners[0].id}
            title={bottomBanners[0].title}
            description={bottomBanners[0].description}
            imageUrl={bottomBanners[0].imageUrl}
            ctaText={bottomBanners[0].ctaText}
            ctaLink={bottomBanners[0].ctaLink}
            backgroundColor={bottomBanners[0].backgroundColor}
            textColor={bottomBanners[0].textColor}
            position="bottom"
          />
        </section>
      )}

      {/* Section témoignages */}
      <section className="py-16 bg-zinc-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Ce que nos joueurs disent</h2>
            <p className="text-gray-400 max-w-2xl mx-auto">
              Découvrez les témoignages de nos joueurs qui ont remporté des gains importants sur notre plateforme.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="bg-zinc-700 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/testimonies/avatar1.jpg"
                    alt="Témoignage de Sophie"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">Sophie M.</h3>
                  <p className="text-gray-400 text-sm">Gagnante Classic Cards</p>
                </div>
              </div>
              <p className="text-gray-300">
                "J'ai gagné un kit alimentaire complet avec Classic Cards ! Le jeu est simple et amusant, parfait pour se détendre après le travail."
              </p>
            </div>

            <div className="bg-zinc-700 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/testimonies/avatar2.jpg"
                    alt="Témoignage de Marc"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">Marc D.</h3>
                  <p className="text-gray-400 text-sm">Gagnant Magic Fortune</p>
                </div>
              </div>
              <p className="text-gray-300">
                "Magic Fortune m'a permis de remporter une montre de luxe ! L'interface est superbe et les gains sont vraiment intéressants."
              </p>
            </div>

            <div className="bg-zinc-700 p-6 rounded-lg">
              <div className="flex items-center mb-4">
                <div className="relative w-12 h-12 rounded-full overflow-hidden mr-4">
                  <Image
                    src="/images/testimonies/testimonial-avatar.jpg"
                    alt="Témoignage de Julie"
                    fill
                    className="object-cover"
                    unoptimized
                  />
                </div>
                <div>
                  <h3 className="text-white font-medium">Julie R.</h3>
                  <p className="text-gray-400 text-sm">Gagnante Gold Digger</p>
                </div>
              </div>
              <p className="text-gray-300">
                "Incroyable ! J'ai gagné un voyage aux Maldives grâce à Gold Digger. Le support client a été très professionnel pour organiser mon gain."
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Section Communautés */}
      <section className="py-16 bg-gradient-to-b from-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              Jeux pour une <span className="text-yellow-500">Cause</span>
            </h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg">
              Créez ou rejoignez une communauté et jouez ensemble pour une cause qui vous tient à cœur.
              Profitez de packs de coins exclusifs à prix réduits !
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Carte Création de Communauté */}
            <div className="bg-gradient-to-br from-purple-900 to-indigo-900 rounded-xl p-6 border border-purple-500/20 hover:border-purple-500/50 transition-all">
              <div className="mb-6">
                <div className="w-12 h-12 bg-purple-500 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Créer une Communauté</h3>
                <p className="text-gray-300">
                  Lancez votre propre communauté et invitez vos membres à jouer pour une cause commune.
                </p>
              </div>
              <ul className="space-y-3 mb-6">
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Pack de démarrage à -50%
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Dashboard communautaire
                </li>
                <li className="flex items-center text-gray-300">
                  <span className="text-purple-400 mr-2">✓</span>
                  Suivi des gains en temps réel
                </li>
              </ul>
              <Link href="/communities/create">
                <Button className="w-full bg-purple-500 hover:bg-purple-600 text-white">
                  CRÉER MA COMMUNAUTÉ
                </Button>
              </Link>
            </div>

            {/* Carte Pack Communautaire */}
            <div className="bg-gradient-to-br from-red-900 to-orange-900 rounded-xl p-6 border border-red-500/20 hover:border-red-500/50 transition-all">
              <div className="mb-6">
                <div className="w-12 h-12 bg-red-500 rounded-lg flex items-center justify-center mb-4">
                  <Image
                    src="/images/icons/money/coins.png"
                    alt="Coins Icon"
                    width={32}
                    height={32}
                    className="text-white"
                  />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Pack Communautaire</h3>
                <p className="text-gray-300">
                  Profitez de nos offres spéciales pour les communautés et maximisez vos chances de gains.
                </p>
              </div>
              <div className="bg-black/30 rounded-lg p-4 mb-6">
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Image
                      src="/images/icons/money/bonus.png"
                      alt="Bonus Icon"
                      width={28}
                      height={28}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Pack Standard</span>
                  </div>
                  <span className="text-white font-bold">500€</span>
                </div>
                <div className="flex justify-between items-center mb-2">
                  <div className="flex items-center">
                    <Image
                      src="/images/icons/money/cashback.png"
                      alt="Cashback Icon"
                      width={28}
                      height={28}
                      className="mr-2"
                    />
                    <span className="text-gray-300">Prix Communauté</span>
                  </div>
                  <span className="text-green-400 font-bold">300€</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-gray-300">Économie</span>
                  <span className="text-yellow-500 font-bold">200€</span>
                </div>
              </div>
              <Link href="/communities/packs">
                <Button className="w-full bg-red-500 hover:bg-red-600 text-white">
                  VOIR LES PACKS
                </Button>
              </Link>
            </div>

            {/* Carte Classement Communautés */}
            <div className="bg-gradient-to-br from-emerald-900 to-teal-900 rounded-xl p-6 border border-emerald-500/20 hover:border-emerald-500/50 transition-all">
              <div className="mb-6">
                <div className="w-12 h-12 bg-emerald-500 rounded-lg flex items-center justify-center mb-4">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Top Communautés</h3>
                <p className="text-gray-300">
                  Découvrez les communautés les plus performantes et leurs causes.
                </p>
              </div>
              <div className="space-y-4 mb-6">
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-yellow-500 font-bold mr-3">1</span>
                    <div>
                      <p className="text-white font-medium">Save The Ocean</p>
                      <p className="text-sm text-gray-400">Protection des océans</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Image
                      src="/images/icons/money/coins.png"
                      alt="Coins Icon"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-emerald-400 font-bold">15 320€</span>
                  </div>
                </div>
                <div className="flex items-center justify-between bg-black/30 p-3 rounded-lg">
                  <div className="flex items-center">
                    <span className="text-gray-400 font-bold mr-3">2</span>
                    <div>
                      <p className="text-white font-medium">Green Earth</p>
                      <p className="text-sm text-gray-400">Reforestation</p>
                    </div>
                  </div>
                  <div className="flex items-center">
                    <Image
                      src="/images/icons/money/coins.png"
                      alt="Coins Icon"
                      width={24}
                      height={24}
                      className="mr-2"
                    />
                    <span className="text-emerald-400 font-bold">12 750€</span>
                  </div>
                </div>
              </div>
              <Link href="/communities/leaderboard">
                <Button className="w-full bg-emerald-500 hover:bg-emerald-600 text-white">
                  VOIR LE CLASSEMENT
                </Button>
              </Link>
            </div>
          </div>

          <div className="mt-12 text-center">
            <p className="text-gray-400 mb-6">
              Déjà plus de <span className="text-yellow-500 font-bold">50 communautés</span> jouent pour des causes qui leur tiennent à cœur
            </p>
            <Link href="/communities">
              <Button variant="outline" className="text-white border-zinc-700 hover:bg-zinc-800 px-8 py-4">
                EXPLORER LES COMMUNAUTÉS
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Section CTA avec gagnant de loterie */}
      <section className="py-16 bg-gradient-to-r from-zinc-900 to-black">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
            <div className="relative h-[600px] md:h-[700px] group">
              <Image
                src="/images/winners/lottery-winner.png"
                alt="Gagnant de la loterie"
                fill
                className="object-cover object-center rounded-lg transition-transform duration-700 group-hover:scale-105"
                unoptimized
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent rounded-lg"></div>
              <div className="absolute bottom-4 left-4 bg-yellow-500 text-black font-bold px-6 py-3 rounded-full text-lg">
                Gain: 1 000 000€
              </div>
            </div>
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
                Devenez Notre Prochain <span className="text-yellow-500">Grand Gagnant</span>
              </h2>
              <p className="text-white/80 mb-8 text-lg">
                Rejoignez notre programme d'affiliation et gagnez un pourcentage sur le premier gain de vos filleuls. Plus vous parrainez, plus vous gagnez !
              </p>
              <div className="space-y-4">
                <div className="flex items-center text-white">
                  <span className="text-yellow-500 mr-3 text-2xl">→</span>
                  <span>10% sur le premier gain de chaque filleul</span>
                </div>
                <div className="flex items-center text-white">
                  <span className="text-yellow-500 mr-3 text-2xl">→</span>
                  <span>Programme de fidélité exclusif</span>
                </div>
                <div className="flex items-center text-white">
                  <span className="text-yellow-500 mr-3 text-2xl">→</span>
                  <span>Retraits prioritaires pour les affiliés</span>
                </div>
              </div>
              <div className="mt-8">
                <Link href="/register">
                  <Button className="casino-button text-lg px-8 py-6">
                    DEVENIR AFFILIÉ
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      {/* Bannière CTA flottante */}
      <CTABanner />
    </main>
  );
}
