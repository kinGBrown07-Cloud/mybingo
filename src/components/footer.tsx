"use client";

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Button } from '@/components/ui/button';
import { Facebook, Twitter, Instagram, Youtube, Mail, Phone } from 'lucide-react';

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-zinc-900 border-t border-zinc-800">
      {/* Section CTA */}
      <div className="bg-gradient-to-r from-red-800 to-red-700">
        <div className="max-w-7xl mx-auto px-4 py-8 sm:py-12 sm:px-6 lg:py-16 lg:px-8">
          <div className="px-4 py-6 sm:px-6 md:py-12 md:px-12 lg:py-16 lg:px-16 xl:flex xl:items-center">
            <div className="text-center xl:text-left xl:w-0 xl:flex-1">
              <h2 className="text-xl font-bold tracking-tight text-white sm:text-2xl md:text-3xl lg:text-4xl">
                Prêt à commencer à jouer?
              </h2>
              <p className="mt-2 sm:mt-3 max-w-3xl text-base sm:text-lg leading-6 text-white mx-auto xl:mx-0">
                Inscrivez-vous dès aujourd'hui et découvrez nos jeux de cartes avec des lots exceptionnels à gagner !
              </p>
            </div>
            <div className="mt-6 sm:mt-8 w-full sm:max-w-md mx-auto xl:mx-0 xl:mt-0 xl:ml-8">
              <div className="flex justify-center xl:justify-start">
                <div className="rounded-md w-full sm:w-auto">
                  <Link href="/auth/register">
                    <Button className="casino-button w-full sm:w-auto text-base sm:text-lg py-4 sm:py-6 px-4 sm:px-8 uppercase font-bold">
                      Créer un compte
                    </Button>
                  </Link>
                </div>
              </div>
              <p className="mt-3 text-xs sm:text-sm text-white text-center xl:text-left">
                Nous prenons la protection de vos données au sérieux. Lisez notre {' '}
                <a href="#" className="font-medium text-white underline">
                  politique de confidentialité
                </a>
                .
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Section d'information sur le jeu responsable */}
      <div className="bg-zinc-900 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center">
            <div>
              <h3 className="font-bold text-lg text-white mb-2">Jeu Responsable</h3>
              <p className="text-gray-400 text-sm">
                Nous nous engageons à promouvoir un jeu responsable et à offrir un environnement de jeu sûr.
              </p>
            </div>
            <div>
              <div className="flex space-x-4 items-center justify-center">
                <Image
                  src="/images/icons/18+Only.png"
                  alt="18+"
                  width={60}
                  height={60}
                  className="object-contain"
                  unoptimized
                />
                <Image
                  src="/images/icons/Jeu-Responnsable.png"
                  alt="Jeu responsable"
                  width={120}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </div>
            <div className="text-center md:text-right">
              <Button variant="outline" className="text-white border-red-700 hover:bg-red-800">
                Aide et Soutien
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Section principale du footer */}
      <div className="max-w-7xl mx-auto pt-12 px-4 overflow-hidden sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div>
            <Link href="/">
              <div className="mb-6">
                <Image
                  src="/images/logos/logo.png"
                  alt="Bingoo"
                  width={150}
                  height={40}
                  className="object-contain"
                  unoptimized
                />
              </div>
            </Link>
            <p className="text-gray-400 text-sm mb-6">
              Bingoo est une plateforme de jeux en ligne innovante qui permet aux joueurs de créer des communautés et de jouer pour des causes qui leur tiennent à cœur.
            </p>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Facebook</span>
                <Facebook size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Twitter</span>
                <Twitter size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">Instagram</span>
                <Instagram size={20} />
              </a>
              <a href="#" className="text-gray-400 hover:text-gray-300">
                <span className="sr-only">YouTube</span>
                <Youtube size={20} />
              </a>
            </div>
          </div>

          <div>
            <h3 className="text-white font-bold uppercase text-sm tracking-wider mb-4">Jeux</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/games/classic" className="text-gray-400 hover:text-white">Classic Cards</Link>
              </li>
              <li>
                <Link href="/games/magic" className="text-gray-400 hover:text-white">Magic Fortune</Link>
              </li>
              <li>
                <Link href="/games/gold" className="text-gray-400 hover:text-white">Gold Digger</Link>
              </li>
              <li>
                <Link href="/games" className="text-gray-400 hover:text-white">Tous les jeux</Link>
              </li>
              <li>
                <Link href="/new-games" className="text-gray-400 hover:text-white">Nouveautés</Link>
              </li>
              <li>
                <Link href="/popular-games" className="text-gray-400 hover:text-white">Jeux populaires</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold uppercase text-sm tracking-wider mb-4">Informations</h3>
            <ul className="space-y-3">
              <li>
                <Link href="/about" className="text-gray-400 hover:text-white">À propos de nous</Link>
              </li>
              <li>
                <Link href="/terms" className="text-gray-400 hover:text-white">Termes et conditions</Link>
              </li>
              <li>
                <Link href="/privacy" className="text-gray-400 hover:text-white">Politique de confidentialité</Link>
              </li>
              <li>
                <Link href="/responsible-gaming" className="text-gray-400 hover:text-white">Jeu responsable</Link>
              </li>
              <li>
                <Link href="/faq" className="text-gray-400 hover:text-white">FAQ</Link>
              </li>
              <li>
                <Link href="/contact" className="text-gray-400 hover:text-white">Contact</Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-white font-bold uppercase text-sm tracking-wider mb-4">Contact & Support</h3>
            <ul className="space-y-3">
              <li className="flex items-center text-gray-400">
                <Mail className="mr-2" size={16} />
                <a href="mailto:infos@mybingoo.com" className="hover:text-white">infos@mybingoo.com</a>
              </li>
              <li className="flex items-center text-gray-400">
                <Phone className="mr-2" size={16} />
                <a href="tel:+22890481428" className="hover:text-white">+228 90481428</a>
              </li>
            </ul>
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Support disponible</h4>
              <p className="text-gray-400 text-sm">7 jours sur 7, de 10h à 22h</p>
            </div>
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Modes de paiement</h4>
              <div className="flex flex-wrap gap-4 mt-2">
                <div className="flex items-center gap-1">
                  <div className="w-10 h-8 bg-white rounded flex items-center justify-center">
                    <Image
                      src="/images/icons/Visa.png"
                      alt="Visa"
                      width={32}
                      height={20}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-10 h-8 bg-white rounded flex items-center justify-center">
                    <Image
                      src="/images/icons/Mastercard.png"
                      alt="Mastercard"
                      width={32}
                      height={20}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-10 h-8 bg-white rounded flex items-center justify-center">
                    <Image
                      src="/images/icons/Paypal.png"
                      alt="PayPal"
                      width={32}
                      height={20}
                      className="object-contain"
                      unoptimized
                    />
                  </div>
                </div>
              </div>
            </div>
            <div className="mt-6">
              <h4 className="text-white font-medium mb-2">Téléchargez notre application</h4>
              <div className="flex space-x-4 mt-2">
                <Link href="#" className="block">
                  <Image
                    src="/images/icons/Appstore.png"
                    alt="App Store"
                    width={120}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                </Link>
                <Link href="#" className="block">
                  <Image
                    src="/images/icons/Playstore.png"
                    alt="Play Store"
                    width={120}
                    height={40}
                    className="object-contain"
                    unoptimized
                  />
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Section des licences et copyright */}
        <div className="mt-12 border-t border-zinc-800 pt-8 pb-12">
          <p className="text-gray-400 text-center text-xs">
          Profitez de nos jeux variés et de nos fonctionnalités interactives, tout en respectant nos conditions essentielles.
          </p>
          <p className="text-gray-500 text-center text-xs mt-4">
            &copy; {currentYear} Bingoo.eu - Tous droits réservés.
          </p>
        </div>
      </div>
    </footer>
  );
}
