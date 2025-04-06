/*
  Warnings:

  - You are about to drop the column `firstName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `lastName` on the `profiles` table. All the data in the column will be lost.
  - You are about to drop the column `phoneNumber` on the `profiles` table. All the data in the column will be lost.
  - Added the required column `first_name` to the `profiles` table without a default value. This is not possible if the table is not empty.
  - Added the required column `last_name` to the `profiles` table without a default value. This is not possible if the table is not empty.

*/
-- First, add the new columns
ALTER TABLE "profiles" 
ADD COLUMN "first_name" TEXT,
ADD COLUMN "last_name" TEXT,
ADD COLUMN "phone_number" TEXT;

-- Copy data from old columns to new columns
UPDATE "profiles" 
SET "first_name" = "firstName",
    "last_name" = "lastName",
    "phone_number" = "phoneNumber";

-- Make the required columns NOT NULL after data is copied
ALTER TABLE "profiles" 
ALTER COLUMN "first_name" SET NOT NULL,
ALTER COLUMN "last_name" SET NOT NULL;

-- Finally, drop the old columns
ALTER TABLE "profiles" 
DROP COLUMN "firstName",
DROP COLUMN "lastName",
DROP COLUMN "phoneNumber";
