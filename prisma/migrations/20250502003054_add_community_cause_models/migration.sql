-- CreateEnum
CREATE TYPE "CauseStatus" AS ENUM ('PENDING', 'ACTIVE', 'COMPLETED', 'CANCELLED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "CommunityTransactionType" ADD VALUE 'COMPETITION_ENTRY';
ALTER TYPE "CommunityTransactionType" ADD VALUE 'COMPETITION_WIN';

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "GameType" ADD VALUE 'WHEEL';
ALTER TYPE "GameType" ADD VALUE 'COMMUNITY_JACKPOT';

-- DropForeignKey
ALTER TABLE "communities" DROP CONSTRAINT "communities_created_by_fkey";

-- AlterTable
ALTER TABLE "communities" ADD COLUMN     "deleted_at" TIMESTAMP(3),
ALTER COLUMN "target_amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "current_amount" SET DEFAULT 0,
ALTER COLUMN "current_amount" SET DATA TYPE DOUBLE PRECISION,
ALTER COLUMN "updated_at" SET DEFAULT CURRENT_TIMESTAMP;

-- CreateTable
CREATE TABLE "community_causes" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "name" TEXT NOT NULL,
    "description" TEXT,
    "target_amount" DOUBLE PRECISION NOT NULL,
    "current_amount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3),
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_by" UUID NOT NULL,
    "max_communities" INTEGER NOT NULL DEFAULT 5,
    "pack_price" DOUBLE PRECISION NOT NULL,
    "winning_amount" DOUBLE PRECISION NOT NULL,
    "status" "CauseStatus" NOT NULL DEFAULT 'PENDING',

    CONSTRAINT "community_causes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "community_competitions" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "cause_id" UUID NOT NULL,
    "community_id" UUID NOT NULL,
    "has_paid" BOOLEAN NOT NULL DEFAULT false,
    "has_won" BOOLEAN NOT NULL DEFAULT false,
    "joined_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "payment_amount" DOUBLE PRECISION,
    "payment_date" TIMESTAMP(3),

    CONSTRAINT "community_competitions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "communities" ADD CONSTRAINT "communities_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_causes" ADD CONSTRAINT "community_causes_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_competitions" ADD CONSTRAINT "community_competitions_cause_id_fkey" FOREIGN KEY ("cause_id") REFERENCES "community_causes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "community_competitions" ADD CONSTRAINT "community_competitions_community_id_fkey" FOREIGN KEY ("community_id") REFERENCES "communities"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
