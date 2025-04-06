"use client";

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function CommunityNav() {
  const pathname = usePathname();

  const links = [
    {
      href: '/communities',
      label: 'Toutes les Communautés'
    },
    {
      href: '/communities/create',
      label: 'Créer une Communauté'
    },
    {
      href: '/communities/packs',
      label: 'Packs Communautaires'
    },
    {
      href: '/communities/leaderboard',
      label: 'Classement'
    }
  ];

  return (
    <nav className="bg-zinc-800 border-b border-zinc-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex space-x-8 overflow-x-auto">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`py-4 px-1 border-b-2 text-sm font-medium whitespace-nowrap ${
                pathname === link.href
                  ? 'border-yellow-500 text-yellow-500'
                  : 'border-transparent text-gray-300 hover:text-white hover:border-gray-300'
              }`}
            >
              {link.label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
