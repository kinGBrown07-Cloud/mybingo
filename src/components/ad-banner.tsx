import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { Button } from '@/components/ui/button';

interface AdBannerProps {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
  position?: 'top' | 'middle' | 'bottom';
}

export function AdBanner({
  id,
  title,
  description,
  imageUrl,
  ctaText,
  ctaLink,
  backgroundColor = 'bg-gradient-to-r from-red-700 to-red-900',
  textColor = 'text-white',
  position = 'middle'
}: AdBannerProps) {
  return (
    <div 
      id={`ad-banner-${id}`}
      className={`w-full py-8 ${backgroundColor} relative overflow-hidden`}
      data-ad-position={position}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          <div className={`${textColor} z-10`}>
            <h2 className="text-2xl md:text-3xl font-bold mb-4">{title}</h2>
            <p className="mb-6 opacity-90">{description}</p>
            <Link href={ctaLink}>
              <Button className="casino-button">
                {ctaText}
              </Button>
            </Link>
          </div>
          <div className="relative h-48 md:h-64 rounded-lg overflow-hidden">
            <Image
              src={imageUrl}
              alt={title}
              fill
              className="object-cover"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
