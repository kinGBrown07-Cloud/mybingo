import { PrismaClient } from '@prisma/client';

// Déclaration des types manquants pour Prisma
declare module '@prisma/client' {
  export enum CauseStatus {
    PENDING = 'PENDING',
    ACTIVE = 'ACTIVE',
    COMPLETED = 'COMPLETED',
    CANCELLED = 'CANCELLED'
  }

  export enum CommunityTransactionType {
    CONTRIBUTION = 'CONTRIBUTION',
    GAME_WIN = 'GAME_WIN',
    WITHDRAWAL = 'WITHDRAWAL',
    BONUS = 'BONUS',
    COMPETITION_ENTRY = 'COMPETITION_ENTRY',
    COMPETITION_WIN = 'COMPETITION_WIN'
  }

  export interface CommunityCause {
    id: string;
    name: string;
    description: string | null;
    targetAmount: number;
    currentAmount: number;
    imageUrl: string | null;
    startDate: Date;
    endDate: Date | null;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    createdBy: string;
    maxCommunities: number;
    packPrice: number;
    winningAmount: number;
    status: CauseStatus;
  }

  export interface CommunityCompetition {
    id: string;
    causeId: string;
    communityId: string;
    hasPaid: boolean;
    hasWon: boolean;
    joinedAt: Date;
    paymentAmount: number | null;
    paymentDate: Date | null;
    cause?: CommunityCause;
    community?: {
      id: string;
      name: string;
      [key: string]: unknown;
    };
  }

  // Extension du client Prisma
  // Types génériques pour les arguments des méthodes Prisma
  type PrismaArgs = {
    where?: Record<string, unknown>;
    data?: Record<string, unknown>;
    include?: Record<string, unknown>;
    select?: Record<string, unknown>;
    orderBy?: Record<string, unknown> | Array<Record<string, unknown>>;
    skip?: number;
    take?: number;
    cursor?: Record<string, unknown>;
    [key: string]: unknown;
  };

  interface PrismaClient {
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
  }
}
