import { prisma } from '@/lib/prisma';
import { PrismaClient } from '@prisma/client';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { STORAGE_BUCKETS } from '@/lib/supabase-storage';

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

/**
 * Crée une nouvelle bannière publicitaire
 * @param banner Données de la bannière
 * @param userId ID de l'utilisateur qui crée la bannière
 * @returns La bannière créée ou null en cas d'erreur
 */
export async function createAdBanner(banner: Omit<AdBanner, 'id'>, userId: string): Promise<AdBanner | null> {
  try {
    // Vérifier que l'URL de l'image est valide
    if (!banner.imageUrl) {
      throw new Error('URL de l\'image requise');
    }
    
    // Convertir la position au format de la base de données
    const dbPosition = banner.position.toUpperCase() as AdPositionEnum;
    
    // Créer la bannière dans la base de données
    const newBanner = await prisma.adBanner.create({
      data: {
        title: banner.title,
        description: banner.description,
        imageUrl: banner.imageUrl,
        ctaText: banner.ctaText,
        ctaLink: banner.ctaLink,
        backgroundColor: banner.backgroundColor || null,
        textColor: banner.textColor || null,
        position: dbPosition,
        isActive: banner.isActive,
        startDate: banner.startDate,
        endDate: banner.endDate,
        priority: banner.priority,
        createdBy: userId
      }
    });
    
    return {
      id: newBanner.id,
      title: newBanner.title,
      description: newBanner.description,
      imageUrl: newBanner.imageUrl,
      ctaText: newBanner.ctaText,
      ctaLink: newBanner.ctaLink,
      backgroundColor: newBanner.backgroundColor || undefined,
      textColor: newBanner.textColor || undefined,
      position: mapAdPosition(dbPosition),
      isActive: newBanner.isActive,
      startDate: newBanner.startDate,
      endDate: newBanner.endDate,
      priority: newBanner.priority
    };
  } catch (error) {
    console.error('Erreur lors de la création de la bannière:', error);
    return null;
  }
}

/**
 * Met à jour une bannière publicitaire existante
 * @param id ID de la bannière à mettre à jour
 * @param banner Données de la bannière
 * @param userId ID de l'utilisateur qui met à jour la bannière
 * @returns La bannière mise à jour ou null en cas d'erreur
 */
export async function updateAdBanner(id: string, banner: Partial<AdBanner>, userId: string): Promise<AdBanner | null> {
  try {
    // Vérifier que la bannière existe
    const existingBanner = await prisma.adBanner.findUnique({
      where: { id }
    });
    
    if (!existingBanner) {
      throw new Error('Bannière non trouvée');
    }
    
    // Convertir la position au format de la base de données si elle est fournie
    let dbPosition: AdPositionEnum | undefined;
    if (banner.position) {
      dbPosition = banner.position.toUpperCase() as AdPositionEnum;
    }
    
    // Mettre à jour la bannière
    const updatedBanner = await prisma.adBanner.update({
      where: { id },
      data: {
        title: banner.title !== undefined ? banner.title : undefined,
        description: banner.description !== undefined ? banner.description : undefined,
        imageUrl: banner.imageUrl !== undefined ? banner.imageUrl : undefined,
        ctaText: banner.ctaText !== undefined ? banner.ctaText : undefined,
        ctaLink: banner.ctaLink !== undefined ? banner.ctaLink : undefined,
        backgroundColor: banner.backgroundColor !== undefined ? banner.backgroundColor : undefined,
        textColor: banner.textColor !== undefined ? banner.textColor : undefined,
        position: dbPosition,
        isActive: banner.isActive !== undefined ? banner.isActive : undefined,
        startDate: banner.startDate !== undefined ? banner.startDate : undefined,
        endDate: banner.endDate !== undefined ? banner.endDate : undefined,
        priority: banner.priority !== undefined ? banner.priority : undefined,
        updatedBy: userId,
        updatedAt: new Date()
      }
    });
    
    return {
      id: updatedBanner.id,
      title: updatedBanner.title,
      description: updatedBanner.description,
      imageUrl: updatedBanner.imageUrl,
      ctaText: updatedBanner.ctaText,
      ctaLink: updatedBanner.ctaLink,
      backgroundColor: updatedBanner.backgroundColor || undefined,
      textColor: updatedBanner.textColor || undefined,
      position: mapAdPosition(updatedBanner.position as AdPositionEnum),
      isActive: updatedBanner.isActive,
      startDate: updatedBanner.startDate,
      endDate: updatedBanner.endDate,
      priority: updatedBanner.priority
    };
  } catch (error) {
    console.error('Erreur lors de la mise à jour de la bannière:', error);
    return null;
  }
}

/**
 * Supprime une bannière publicitaire
 * @param id ID de la bannière à supprimer
 * @returns true si la suppression a réussi, false sinon
 */
export async function deleteAdBanner(id: string): Promise<boolean> {
  try {
    // Vérifier que la bannière existe
    const existingBanner = await prisma.adBanner.findUnique({
      where: { id }
    });
    
    if (!existingBanner) {
      throw new Error('Bannière non trouvée');
    }
    
    // Supprimer l'image de Supabase Storage si elle y est stockée
    if (existingBanner.imageUrl && existingBanner.imageUrl.includes('supabase.co')) {
      const supabase = createClientComponentClient();
      
      // Extraire le nom du fichier de l'URL
      const fileName = existingBanner.imageUrl.split('/').pop();
      if (fileName) {
        const filePath = `banners/${fileName}`;
        
        // Supprimer le fichier
        await supabase.storage
          .from(STORAGE_BUCKETS.AD_BANNERS)
          .remove([filePath]);
      }
    }
    
    // Supprimer la bannière de la base de données
    await prisma.adBanner.delete({
      where: { id }
    });
    
    return true;
  } catch (error) {
    console.error('Erreur lors de la suppression de la bannière:', error);
    return false;
  }
}

/**
 * Récupère toutes les bannières publicitaires (actives et inactives)
 * @returns Liste de toutes les bannières
 */
export async function getAllAdBanners(): Promise<AdBanner[]> {
  try {
    const dbBanners = await prisma.adBanner.findMany({
      orderBy: [
        { isActive: 'desc' },
        { priority: 'desc' },
        { createdAt: 'desc' }
      ]
    });
    
    return dbBanners.map((banner) => ({
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      backgroundColor: banner.backgroundColor || undefined,
      textColor: banner.textColor || undefined,
      position: mapAdPosition(banner.position as AdPositionEnum),
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
      priority: banner.priority
    }));
  } catch (error) {
    console.error('Erreur lors de la récupération des bannières:', error);
    return [];
  }
}

/**
 * Récupère une bannière publicitaire par son ID
 * @param id ID de la bannière
 * @returns La bannière ou null si non trouvée
 */
export async function getAdBannerById(id: string): Promise<AdBanner | null> {
  try {
    const banner = await prisma.adBanner.findUnique({
      where: { id }
    });
    
    if (!banner) {
      return null;
    }
    
    return {
      id: banner.id,
      title: banner.title,
      description: banner.description,
      imageUrl: banner.imageUrl,
      ctaText: banner.ctaText,
      ctaLink: banner.ctaLink,
      backgroundColor: banner.backgroundColor || undefined,
      textColor: banner.textColor || undefined,
      position: mapAdPosition(banner.position as AdPositionEnum),
      isActive: banner.isActive,
      startDate: banner.startDate,
      endDate: banner.endDate,
      priority: banner.priority
    };
  } catch (error) {
    console.error('Erreur lors de la récupération de la bannière:', error);
    return null;
  }
}
