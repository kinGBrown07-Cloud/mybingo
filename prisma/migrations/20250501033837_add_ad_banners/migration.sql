-- CreateEnum
CREATE TYPE "AdPosition" AS ENUM ('TOP', 'MIDDLE', 'BOTTOM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT';
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT_PENDING';
ALTER TYPE "TransactionType" ADD VALUE 'PAYMENT_FAILED';

-- CreateTable
CREATE TABLE "ad_banners" (
    "id" UUID NOT NULL DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "image_url" TEXT NOT NULL,
    "cta_text" TEXT NOT NULL,
    "cta_link" TEXT NOT NULL,
    "background_color" TEXT,
    "text_color" TEXT,
    "position" "AdPosition" NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "start_date" TIMESTAMP(3) NOT NULL,
    "end_date" TIMESTAMP(3) NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,
    "created_by" UUID NOT NULL,
    "updated_by" UUID,

    CONSTRAINT "ad_banners_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ad_banners" ADD CONSTRAINT "ad_banners_created_by_fkey" FOREIGN KEY ("created_by") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ad_banners" ADD CONSTRAINT "ad_banners_updated_by_fkey" FOREIGN KEY ("updated_by") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
