// TODO: Refactoriser ce fichier pour utiliser des types corrects et éliminer les contournements
/* Ce fichier est exempté de la vérification de type TypeScript en raison de problèmes de compatibilité avec le schéma Prisma.
 * Une déclaration de type a été créée dans src/types/prisma-extensions.d.ts pour améliorer l'expérience de développement.
 */

import { prisma } from '@/lib/prisma';
import { CauseStatus as PrismaCauseStatus, CommunityTransactionType as PrismaCommunityTransactionType } from '@prisma/client';

/**
 * NOTE IMPORTANTE:
 * 
 * Ce fichier utilise des directives @ts-ignore pour supprimer les erreurs de typage.
 * Cette approche n'est pas idéale en termes de bonnes pratiques de typage TypeScript,
 * mais elle permet au code de fonctionner sans erreurs de compilation tout en maintenant
 * la fonctionnalité existante.
 * 
 * Dans un contexte de production, il serait préférable de définir des types plus précis
 * et de restructurer le code pour éviter ces contournements.
 */

// Définition manuelle des types manquants
// Utiliser le même enum que Prisma pour éviter les problèmes de compatibilité
export enum CauseStatus {
  PENDING = 'PENDING',
  ACTIVE = 'ACTIVE',
  COMPLETED = 'COMPLETED',
  CANCELLED = 'CANCELLED'
}

// Fonction utilitaire pour convertir entre les types d'enum
function convertPrismaCauseStatus(status: PrismaCauseStatus): CauseStatus {
  switch (status) {
    case 'PENDING': return CauseStatus.PENDING;
    case 'ACTIVE': return CauseStatus.ACTIVE;
    case 'COMPLETED': return CauseStatus.COMPLETED;
    case 'CANCELLED': return CauseStatus.CANCELLED;
    default:
      // Pour gérer le cas où Prisma ajoute de nouveaux statuts à l'avenir
      return CauseStatus.PENDING;
  }
}

enum CommunityTransactionType {
  CONTRIBUTION = 'CONTRIBUTION',
  GAME_WIN = 'GAME_WIN',
  WITHDRAWAL = 'WITHDRAWAL',
  BONUS = 'BONUS',
  COMPETITION_ENTRY = 'COMPETITION_ENTRY',
  COMPETITION_WIN = 'COMPETITION_WIN'
}

// Type pour les causes communautaires avec les propriétés spécifiques
export interface CauseSpecificProperties {
  packPrice: number;
  winningAmount: number;
  maxCommunities: number;
}

// Définir des types génériques pour éviter les erreurs de typage
/**
 * Type pour les causes communautaires.
 * 
 * @typedef {Object} CommunityCause
 * @property {string} id - L'identifiant de la cause.
 * @property {string} name - Le nom de la cause.
 * @property {string} [description] - La description de la cause.
 * @property {CauseStatus} status - Le statut de la cause.
 * @property {number} targetAmount - Le montant cible de la cause.
 * @property {number} currentAmount - Le montant actuel de la cause.
 * @property {Date} [startDate] - La date de début de la cause.
 * @property {Date} [endDate] - La date de fin de la cause.
 * @property {Date} createdAt - La date de création de la cause.
 * @property {Date} updatedAt - La date de mise à jour de la cause.
 * @property {unknown} [key] - Autres propriétés de la cause.
 */
export type CommunityCause = {
  id: string;
  name: string;
  description: string | null;
  status: CauseStatus;
  targetAmount: number;
  currentAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    competitions: number;
  };
  competitions?: CommunityCompetition[];
  packPrice?: number;
  winningAmount?: number;
  maxCommunities?: number;
  [key: string]: unknown;
};

/**
 * Type pour les compétitions communautaires.
 * 
 * @typedef {Object} CommunityCompetition
 * @property {string} id - L'identifiant de la compétition.
 * @property {string} causeId - L'identifiant de la cause associée.
 * @property {string} name - Le nom de la compétition.
 * @property {string} [description] - La description de la compétition.
 * @property {Date} [startDate] - La date de début de la compétition.
 * @property {Date} [endDate] - La date de fin de la compétition.
 * @property {Date} createdAt - La date de création de la compétition.
 * @property {Date} updatedAt - La date de mise à jour de la compétition.
 * @property {unknown} [key] - Autres propriétés de la compétition.
 */
export type CommunityCompetition = {
  id: string;
  causeId: string;
  communityId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  hasPaid?: boolean;
  paymentAmount?: number;
  paymentDate?: Date;
  hasWon?: boolean;
  winningDate?: Date;
  cause?: CommunityCause;
  community?: {
    name: string;
    id: string;
    description: string | null;
    cause: string;
    targetAmount: number;
    currentAmount: number;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    deletedAt: Date | null;
  };
  [key: string]: unknown;
};

// Type pour les arguments Prisma
interface PrismaArgs {
  where?: Record<string, unknown>;
  data?: Record<string, unknown>;
  include?: Record<string, unknown>;
  select?: Record<string, unknown>;
  orderBy?: Record<string, unknown> | Array<Record<string, unknown>>;
  take?: number;
  skip?: number;
}

// Type pour les utilisateurs
interface User {
  id: string;
  email: string;
  name?: string;
  points: number;
  role?: string;
  [key: string]: unknown;
}

// Type pour les membres de communauté
interface CommunityMember {
  id: string;
  userId: string;
  communityId: string;
  role: string;
  joinedAt: Date;
  [key: string]: unknown;
}

// Type pour les transactions de communauté
interface CommunityTransaction {
  id: string;
  communityId: string;
  userId: string;
  amount: number;
  type: CommunityTransactionType;
  description?: string;
  createdAt: Date;
  [key: string]: unknown;
}

// Type pour les communautés
interface Community {
  id: string;
  name: string;
  description?: string;
  cause: string;
  targetAmount: number;
  currentAmount: number;
  imageUrl?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  createdBy: string;
  deletedAt?: Date;
  [key: string]: unknown;
}

// Utiliser le client Prisma directement, en ignorant les erreurs de typage
// Utiliser le client Prisma directement
const prismaExtended = prisma as unknown as {
  communityCause: {
    create: (args: PrismaArgs) => Promise<CommunityCause>;
    findUnique: (args: PrismaArgs) => Promise<CommunityCause | null>;
    findMany: (args: PrismaArgs) => Promise<CommunityCause[]>;
    update: (args: PrismaArgs) => Promise<CommunityCause>;
    delete: (args: PrismaArgs) => Promise<CommunityCause>;
  };
  communityCompetition: {
    create: (args: PrismaArgs) => Promise<CommunityCompetition>;
    findUnique: (args: PrismaArgs) => Promise<CommunityCompetition | null>;
    findFirst: (args: PrismaArgs) => Promise<CommunityCompetition | null>;
    findMany: (args: PrismaArgs) => Promise<CommunityCompetition[]>;
    update: (args: PrismaArgs) => Promise<CommunityCompetition>;
    delete: (args: PrismaArgs) => Promise<CommunityCompetition>;
  };
  user: {
    findUnique: (args: PrismaArgs) => Promise<User>;
    update: (args: PrismaArgs) => Promise<User>;
  };
  communityMember: {
    findUnique: (args: PrismaArgs) => Promise<CommunityMember | null>;
    findFirst: (args: PrismaArgs) => Promise<CommunityMember | null>;
  };
  communityTransaction: {
    create: (args: PrismaArgs) => Promise<CommunityTransaction>;
  };
  community: {
    update: (args: PrismaArgs) => Promise<Community>;
  };
};

// Type pour les causes avec leurs compétitions
export type CauseWithCompetitions = CommunityCause & {
  competitions: CommunityCompetition[];
  _count?: {
    competitions: number;
  };
};

// Type pour les résultats Prisma bruts
interface PrismaCauseResult {
  id: string;
  name: string;
  description: string | null;
  status: PrismaCauseStatus;
  targetAmount: number;
  currentAmount: number;
  startDate: Date | null;
  endDate: Date | null;
  createdAt: Date;
  updatedAt: Date;
  _count?: {
    competitions: number;
  };
  competitions?: PrismaCompetitionResult[];
  packPrice?: number;
  winningAmount?: number;
  maxCommunities?: number;
  [key: string]: unknown;
}

interface PrismaCompetitionResult {
  id: string;
  causeId: string;
  communityId: string;
  name: string;
  description?: string;
  startDate?: Date;
  endDate?: Date;
  createdAt: Date;
  updatedAt: Date;
  hasPaid?: boolean;
  paymentAmount?: number;
  paymentDate?: Date;
  hasWon?: boolean;
  winningDate?: Date;
  cause?: PrismaCauseResult;
  community?: {
    name: string;
    id: string;
    description: string | null;
    cause: string;
    targetAmount: number;
    currentAmount: number;
    imageUrl: string | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    deletedAt: Date | null;
  };
  [key: string]: unknown;
}

// Fonction utilitaire pour convertir les résultats Prisma en notre type personnalisé
function convertPrismaCauseToCustomCause(prismaResult: PrismaCauseResult | null): CauseWithCompetitions | null {
  if (!prismaResult) return null;
  
  // Convertir le statut Prisma en notre enum personnalisé
  const result: CauseWithCompetitions = {
    ...prismaResult,
    status: convertPrismaCauseStatus(prismaResult.status),
    competitions: prismaResult.competitions ? 
      prismaResult.competitions.map(comp => ({
        ...comp,
        cause: comp.cause ? convertPrismaCauseToCustomCause(comp.cause) as CommunityCause : undefined
      })) : []
  };
  
  return result;
}

// Fonction utilitaire pour convertir les résultats de findMany
function convertPrismaCausesToCustomCauses(prismaResults: PrismaCauseResult[]): CauseWithCompetitions[] {
  return prismaResults.map(result => convertPrismaCauseToCustomCause(result) as CauseWithCompetitions);
}

/**
 * Créer une nouvelle cause communautaire
 */
export async function createCause(
  data: {
    name: string;
    description?: string;
    targetAmount: number;
    imageUrl?: string;
    startDate: Date;
    endDate?: Date;
    maxCommunities: number;
    packPrice: number;
    winningAmount: number;
  },
  userId: string
): Promise<CommunityCause> {
  // Utilisation du client Prisma étendu
  return prismaExtended.communityCause.create({
    data: {
      name: data.name,
      description: data.description,
      targetAmount: data.targetAmount,
      imageUrl: data.imageUrl,
      startDate: data.startDate,
      endDate: data.endDate,
      maxCommunities: data.maxCommunities,
      packPrice: data.packPrice,
      winningAmount: data.winningAmount,
      createdBy: userId,
      status: CauseStatus.PENDING,
    },
  });
}

/**
 * Récupérer toutes les causes communautaires
 */
export async function getAllCauses(
  limit: number = 10,
  offset: number = 0,
  includeInactive: boolean = false
): Promise<CauseWithCompetitions[]> {
  // Utilisation du client Prisma étendu
  const results = await prismaExtended.communityCause.findMany({
    where: includeInactive ? undefined : { isActive: true },
    include: {
      competitions: true,
      _count: {
        select: {
          competitions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
    skip: offset,
  });
  
  return convertPrismaCausesToCustomCauses(results);
}

/**
 * Récupérer une cause par son ID
 */
export async function getCauseById(id: string): Promise<CauseWithCompetitions | null> {
  // Utilisation du client Prisma étendu
  const result = await prismaExtended.communityCause.findUnique({
    where: { id },
    include: {
      competitions: {
        include: {
          community: true,
        },
      },
      _count: {
        select: {
          competitions: true,
        },
      },
    },
  });
  
  return convertPrismaCauseToCustomCause(result);
}

/**
 * Mettre à jour une cause
 */
export async function updateCause(
  id: string,
  data: Partial<{
    name: string;
    description: string;
    targetAmount: number;
    imageUrl: string;
    startDate: Date;
    endDate: Date;
    maxCommunities: number;
    packPrice: number;
    winningAmount: number;
    isActive: boolean;
    status: CauseStatus;
  }>,
  userId: string
): Promise<CommunityCause | null> {
  // Vérifier si l'utilisateur est le créateur ou un admin
  const cause = await prismaExtended.communityCause.findUnique({
    where: { id },
    select: { createdBy: true },
  });

  if (!cause) return null;

  // Vérifier si l'utilisateur est le créateur ou un admin
  const user = await prismaExtended.user.findUnique({
    where: { id: userId },
    select: { role: true },
  });

  if (cause.createdBy !== userId && user?.role !== 'ADMIN') {
    throw new Error('Vous n\'avez pas les droits pour modifier cette cause');
  }

  // Utilisation du client Prisma étendu
  return prismaExtended.communityCause.update({
    where: { id },
    data,
  });
}

/**
 * Activer une cause (la rendre disponible pour les compétitions)
 */
export async function activateCause(id: string, adminId: string): Promise<CommunityCause | null> {
  // Vérifier si l'utilisateur est admin
  const user = await prismaExtended.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    throw new Error('Seul un administrateur peut activer une cause');
  }

  // Utilisation du client Prisma étendu
  return prismaExtended.communityCause.update({
    where: { id },
    data: {
      status: CauseStatus.ACTIVE,
      isActive: true,
    },
  });
}

/**
 * Inscrire une communauté à une cause
 */
export async function registerCommunityForCause(
  causeId: string,
  communityId: string,
  userId: string
): Promise<CommunityCompetition> {
  // Vérifier si la cause est active
  const cause = await prismaExtended.communityCause.findUnique({
    where: { id: causeId },
    include: {
      _count: {
        select: {
          competitions: true,
        },
      },
    },
  });

  if (!cause) {
    throw new Error('Cause non trouvée');
  }

  if (cause.status !== CauseStatus.ACTIVE) {
    throw new Error('Cette cause n\'est pas active');
  }

  // Vérifier si le nombre maximum de communautés n'est pas atteint
  const maxCommunities = cause.maxCommunities ?? 10; // Valeur par défaut de 10 si non défini
  const currentCompetitions = cause._count?.competitions ?? 0;
  
  if (currentCompetitions >= maxCommunities) {
    throw new Error('Le nombre maximum de communautés pour cette cause a été atteint');
  }

  // Vérifier si l'utilisateur est admin de la communauté
  const membership = await prismaExtended.communityMember.findFirst({
    where: {
      communityId,
      userId,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Vous devez être administrateur de la communauté pour l\'inscrire à une cause');
  }

  // Vérifier si la communauté est déjà inscrite
  const existingCompetition = await prismaExtended.communityCompetition.findFirst({
    where: {
      causeId,
      communityId,
    },
  });

  if (existingCompetition) {
    throw new Error('Cette communauté est déjà inscrite à cette cause');
  }

  // Créer l'inscription
  // Utilisation du client Prisma étendu
  return prismaExtended.communityCompetition.create({
    data: {
      causeId,
      communityId,
      name: `Compétition pour ${cause.name}`,
      description: `Participation de la communauté à la cause: ${cause.name}`,
    },
  });
}

/**
 * Payer pour participer à une cause
 */
export async function payForCause(
  competitionId: string,
  userId: string
): Promise<CommunityCompetition> {
  // Récupérer la compétition
  const competition = await prismaExtended.communityCompetition.findUnique({
    where: { id: competitionId },
    include: {
      cause: true,
      community: true,
    },
  });

  if (!competition) {
    throw new Error('Compétition non trouvée');
  }

  // Vérifier si l'utilisateur est admin de la communauté
  const membership = await prismaExtended.communityMember.findFirst({
    where: {
      communityId: competition.communityId,
      userId,
      role: 'ADMIN',
    },
  });

  if (!membership) {
    throw new Error('Vous devez être administrateur de la communauté pour effectuer le paiement');
  }

  // Vérifier si le paiement a déjà été effectué
  if (competition.hasPaid) {
    throw new Error('Le paiement a déjà été effectué');
  }

  // Récupérer l'utilisateur
  const user = await prismaExtended.user.findUnique({
    where: { id: userId },
    select: { points: true },
  });

  if (!user) {
    throw new Error('Utilisateur non trouvé');
  }

  // Vérifier si l'utilisateur a assez de points
  if (!competition.cause) {
    throw new Error('Cause associée non trouvée');
  }
  
  const packPrice = competition.cause.packPrice ?? 0;
  
  if (user.points < packPrice) {
    throw new Error('Vous n\'avez pas assez de points pour effectuer ce paiement');
  }

  // Mettre à jour les points de l'utilisateur
  await prismaExtended.user.update({
    where: { id: userId },
    data: {
      points: {
        decrement: packPrice,
      },
    },
  });

  // Enregistrer la transaction communautaire
  await prismaExtended.communityTransaction.create({
    data: {
      communityId: competition.communityId,
      userId,
      amount: packPrice,
      type: CommunityTransactionType.COMPETITION_ENTRY,
      description: `Inscription à la cause: ${competition.cause.name}`,
    },
  });

  // Mettre à jour la compétition
  return prismaExtended.communityCompetition.update({
    where: { id: competitionId },
    data: {
      hasPaid: true,
      paymentAmount: packPrice,
      paymentDate: new Date(),
    },
  });
}

/**
 * Déclarer un gagnant pour une compétition
 */
export async function declareCauseWinner(
  competitionId: string,
  adminId: string
): Promise<CommunityCompetition> {
  // Vérifier si l'utilisateur est admin
  const user = await prismaExtended.user.findUnique({
    where: { id: adminId },
    select: { role: true },
  });

  if (user?.role !== 'ADMIN') {
    throw new Error('Seul un administrateur peut déclarer un gagnant');
  }

  // Récupérer la compétition
  const competition = await prismaExtended.communityCompetition.findUnique({
    where: { id: competitionId },
    include: {
      cause: true,
    },
  });

  if (!competition) {
    throw new Error('Compétition non trouvée');
  }

  if (!competition.cause) {
    throw new Error('Cause associée non trouvée');
  }

  if (competition.hasWon) {
    throw new Error('Cette compétition a déjà un gagnant');
  }

  // Mettre à jour la compétition gagnante
  const updatedCompetition = await prismaExtended.communityCompetition.update({
    where: { id: competitionId },
    data: {
      hasWon: true,
      winningDate: new Date(),
    },
    include: {
      cause: true,
    },
  });

  if (!updatedCompetition.cause) {
    throw new Error('Cause associée non trouvée après mise à jour');
  }

  // Mettre à jour le montant actuel de la communauté
  await prismaExtended.community.update({
    where: { id: competition.communityId },
    data: {
      currentAmount: {
        increment: updatedCompetition.cause.winningAmount ?? 0,
      },
    },
  });

  // Enregistrer la transaction communautaire
  await prismaExtended.communityTransaction.create({
    data: {
      communityId: competition.communityId,
      userId: adminId,
      amount: updatedCompetition.cause.winningAmount ?? 0,
      type: CommunityTransactionType.COMPETITION_WIN,
      description: `Gain de la cause: ${updatedCompetition.cause.name}`,
    },
  });

  // Mettre à jour le statut de la cause
  await prismaExtended.communityCause.update({
    where: { id: competition.causeId },
    data: {
      status: CauseStatus.COMPLETED,
      currentAmount: updatedCompetition.cause.targetAmount,
    },
  });

  return updatedCompetition;
}

/**
 * Récupérer les causes actives
 */
export async function getActiveCauses(): Promise<CauseWithCompetitions[]> {
  const results = await prismaExtended.communityCause.findMany({
    where: {
      isActive: true,
      status: CauseStatus.ACTIVE,
    },
    include: {
      competitions: {
        include: {
          community: true,
        },
      },
      _count: {
        select: {
          competitions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return convertPrismaCausesToCustomCauses(results);
}

/**
 * Récupérer les causes terminées
 */
export async function getCompletedCauses(): Promise<CauseWithCompetitions[]> {
  const results = await prismaExtended.communityCause.findMany({
    where: {
      status: CauseStatus.COMPLETED,
    },
    include: {
      competitions: {
        include: {
          community: true,
        },
      },
      _count: {
        select: {
          competitions: true,
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });
  
  return convertPrismaCausesToCustomCauses(results);
}

/**
 * Récupérer les causes auxquelles une communauté participe
 */
export async function getCommunityParticipations(
  communityId: string
): Promise<CauseWithCompetitions[]> {
  const competitions = await prismaExtended.communityCompetition.findMany({
    where: {
      communityId,
    },
    select: {
      causeId: true,
    },
  });

  const causeIds = competitions.map((comp) => comp.causeId);

  const results = await prismaExtended.communityCause.findMany({
    where: {
      id: {
        in: causeIds,
      },
    },
    include: {
      competitions: {
        include: {
          community: true,
        },
      },
      _count: {
        select: {
          competitions: true,
        },
      },
    },
  });
  
  return convertPrismaCausesToCustomCauses(results);
}

/**
 * Vérifier si une cause est prête pour un jeu
 */
export async function isCauseReadyForGame(causeId: string): Promise<boolean> {
  const cause = await prismaExtended.communityCause.findUnique({
    where: { id: causeId },
    include: {
      competitions: {
        where: {
          hasPaid: true,
        },
      },
      _count: {
        select: {
          competitions: true,
        },
      },
    },
  });

  if (!cause) {
    return false;
  }

  // Vérifier si le nombre minimum de communautés est atteint
  const competitionsCount = cause._count?.competitions ?? 0;
  const paidCompetitionsCount = cause.competitions?.length ?? 0;
  
  // Au moins 2 communautés doivent être inscrites et avoir payé
  return competitionsCount >= 2 && paidCompetitionsCount >= 2;
}
