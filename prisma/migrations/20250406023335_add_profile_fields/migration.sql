/*
  Warnings:

  - Added the required column `country` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `firstName` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lastName` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "profiles" ADD COLUMN     "country" TEXT NOT NULL,
ADD COLUMN     "firstName" TEXT NOT NULL,
ADD COLUMN     "lastName" TEXT NOT NULL,
ADD COLUMN     "phoneNumber" TEXT;
