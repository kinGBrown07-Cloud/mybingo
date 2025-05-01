import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';

// Définir les types pour les bannières publicitaires
type AdPositionEnum = 'TOP' | 'MIDDLE' | 'BOTTOM';

interface DbAdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor: string | null;
  textColor: string | null;
  position: AdPositionEnum;
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  priority: number;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  updatedBy: string | null;
}

export interface AdBanner {
  id: string;
  title: string;
  description: string;
  imageUrl: string;
  ctaText: string;
  ctaLink: string;
  backgroundColor?: string;
  textColor?: string;
  position: 'top' | 'middle' | 'bottom';
  isActive: boolean;
  startDate: Date;
  endDate: Date;
  priority: number;
}

// Convertir AdPosition enum de Prisma en string pour l'interface
function mapAdPosition(position: AdPositionEnum): 'top' | 'middle' | 'bottom' {
  switch (position) {
    case 'TOP':
      return 'top';
    case 'MIDDLE':
      return 'middle';
    case 'BOTTOM':
      return 'bottom';
    default:
      return 'middle';
  }
}

export async function getActiveAdBanners(): Promise<AdBanner[]> {
  try {
    const now = new Date();
    
    // Utiliser une requête SQL brute pour éviter les problèmes avec le client Prisma
    const dbBanners = await prisma.$queryRaw<DbAdBanner[]>`
      SELECT * FROM ad_banners
      WHERE is_active = true
      AND start_date <= ${now}
      AND end_date >= ${now}
      ORDER BY priority DESC
    `;
    
    // Si aucune bannière n'est trouvée, retourner des données de test
    if (!dbBanners || dbBanners.length === 0) {
      return getTestBanners();
    }
    
    // Convertir les données de la base de données au format de l'interface
    return dbBanners.map((banner: DbAdBanner) => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      backgroundColor: banner.backgroundColor || undefined,
      textColor: banner.textColor || undefined,
      position: mapAdPosition(banner.position),
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
      priority: banner.priority
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières:', error);
    return getTestBanners();
  }
}

// Fonction pour obtenir des bannières de test
function getTestBanners(): AdBanner[] {
  return [
    {
      id: 'welcome-bonus',
      title: 'Bonus de Bienvenue 100%',
      description: 'Doublez votre premier dépôt jusqu\'à 100€ et recevez 50 points bonus supplémentaires !',
      imageUrl: '/images/promotions/welcome-bonus.jpg',
      ctaText: 'RÉCLAMER MAINTENANT',
      ctaLink: '/auth/register',
      backgroundColor: 'bg-gradient-to-r from-green-700 to-green-900',
      textColor: 'text-white',
      position: 'top',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // +30 jours
      priority: 100
    },
    {
      id: 'weekend-cashback',
      title: 'Cashback du Weekend',
      description: 'Récupérez 10% de vos pertes ce weekend, jusqu\'à 200€ de cashback garanti !',
      imageUrl: '/images/promotions/cashback.jpg',
      ctaText: 'EN SAVOIR PLUS',
      ctaLink: '/promotions/cashback',
      backgroundColor: 'bg-gradient-to-r from-purple-700 to-purple-900',
      textColor: 'text-white',
      position: 'middle',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // +7 jours
      priority: 80
    },
    {
      id: 'mobile-app',
      title: 'Nouvelle Application Mobile',
      description: 'Téléchargez notre application et recevez 25 points gratuits. Jouez n\'importe où, n\'importe quand !',
      imageUrl: '/images/promotions/mobile-app.jpg',
      ctaText: 'TÉLÉCHARGER',
      ctaLink: '/mobile-app',
      backgroundColor: 'bg-gradient-to-r from-blue-700 to-blue-900',
      textColor: 'text-white',
      position: 'bottom',
      isActive: true,
      startDate: new Date(),
      endDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000), // +60 jours
      priority: 60
    }
  ];
}

export async function getAdBannersByPosition(position: 'top' | 'middle' | 'bottom'): Promise<AdBanner[]> {
  const allBanners = await getActiveAdBanners();
  return allBanners.filter(banner => banner.position === position);
}
