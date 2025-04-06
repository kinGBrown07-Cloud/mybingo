"use client";

import React from 'react';
import Link from 'next/link';

interface MenuItem {
  name: string;
  href: string;
  description?: string;
  featured?: boolean;
}

interface MenuSection {
  title: string;
  items: MenuItem[];
}

interface MegaMenuProps {
  isOpen: boolean;
  sections: MenuSection[];
}

export function MegaMenu({ isOpen, sections }: MegaMenuProps) {
  return (
    <div className={`
      fixed left-0 right-0 top-16 bg-zinc-900 border-t border-zinc-800 shadow-2xl z-[100]
      transition-all duration-300 ease-in-out
      ${isOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2 pointer-events-none'}
    `}>
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
            {sections.map((section, idx) => (
              <div key={idx} className="border-b md:border-b-0 md:border-r border-zinc-800 last:border-b-0 last:border-r-0">
                <div className="p-6">
                  <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">
                    {section.title}
                  </h3>
                  <div className="space-y-4">
                    {section.items.map((item, itemIdx) => (
                      <div 
                        key={itemIdx}
                        className={`
                          transform transition-transform duration-200 ease-in-out
                          hover:translate-x-1
                        `}
                      >
                        <Link href={item.href} className="block group">
                          <div className={`text-sm font-medium ${
                            item.featured 
                              ? 'text-purple-400 group-hover:text-purple-300' 
                              : 'text-gray-300 group-hover:text-white'
                          }`}>
                            {item.name}
                          </div>
                          {item.description && (
                            <p className="mt-1 text-xs text-gray-400 group-hover:text-gray-300 line-clamp-2">
                              {item.description}
                            </p>
                          )}
                        </Link>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
