-- CreateEnum
CREATE TYPE "GameType" AS ENUM ('FOODS', 'MODE', 'JACKPOT');

-- CreateEnum
CREATE TYPE "TransactionType" AS ENUM ('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'REFUND');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "PrizeStatus" AS ENUM ('PENDING', 'SHIPPED', 'DELIVERED', 'CANCELLED');

-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN', 'MODERATOR');

-- CreateEnum
CREATE TYPE "Region" AS ENUM ('BLACK_AFRICA', 'NORTH_AFRICA', 'EUROPE', 'AMERICAS', 'ASIA');

-- CreateTable
CREATE TABLE "users" (
    "email" TEXT NOT NULL,
    "password_hash" TEXT NOT NULL,
    "username" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "first_name" TEXT,
    "last_name" TEXT,
    "phone_number" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT NOT NULL,
    "postal_code" TEXT,
    "points" INTEGER NOT NULL DEFAULT 0,
    "total_games_played" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "last_login_at" TIMESTAMP(3),
    "is_verified" BOOLEAN NOT NULL DEFAULT false,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "currency" TEXT NOT NULL,
    "points_rate" DOUBLE PRECISION NOT NULL,
    "region" "Region" NOT NULL,
    "id" UUID NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "profiles" (
    "id" UUID NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "user_id" UUID NOT NULL,

    CONSTRAINT "profiles_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "token" TEXT NOT NULL,
    "expires_at" TIMESTAMP(3) NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ip_address" TEXT,
    "user_agent" TEXT,
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "game_sessions" (
    "id" UUID NOT NULL,
    "profile_id" UUID NOT NULL,
    "game_id" UUID NOT NULL,
    "type" "GameType" NOT NULL,
    "points" INTEGER NOT NULL,
    "has_won" BOOLEAN NOT NULL DEFAULT false,
    "matched_pairs" INTEGER NOT NULL DEFAULT 0,
    "result" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "ended_at" TIMESTAMP(3),

    CONSTRAINT "game_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "games" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "type" "GameType" NOT NULL,
    "description" TEXT,
    "min_points" INTEGER NOT NULL,
    "max_points" INTEGER NOT NULL,
    "win_rate" DOUBLE PRECISION NOT NULL,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "games_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "transactions" (
    "type" "TransactionType" NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "points_amount" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "game_session_id" UUID,

    CONSTRAINT "transactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "card_flips" (
    "id" UUID NOT NULL,
    "game_session_id" UUID NOT NULL,
    "card_index" INTEGER NOT NULL,
    "is_matched" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "card_flips_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_prizes" (
    "id" UUID NOT NULL,
    "user_id" UUID NOT NULL,
    "prize_id" UUID NOT NULL,
    "game_session_id" UUID,
    "status" "PrizeStatus" NOT NULL DEFAULT 'PENDING',
    "tracking_number" TEXT,
    "shipping_address" TEXT,
    "claimed_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "shipped_at" TIMESTAMP(3),
    "delivered_at" TIMESTAMP(3),
    "notes" TEXT,

    CONSTRAINT "user_prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prizes" (
    "id" UUID NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "category" TEXT NOT NULL,
    "points_cost" INTEGER NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image_url" TEXT,
    "is_active" BOOLEAN NOT NULL DEFAULT true,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prizes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "admin_treasury" (
    "id" UUID NOT NULL,
    "points_balance" INTEGER NOT NULL,
    "last_updated" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "min_required_balance" INTEGER NOT NULL,

    CONSTRAINT "admin_treasury_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "daily_stats" (
    "id" UUID NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total_games_played" INTEGER NOT NULL DEFAULT 0,
    "total_points_wagered" INTEGER NOT NULL DEFAULT 0,
    "total_points_won" INTEGER NOT NULL DEFAULT 0,
    "total_prizes_claimed" INTEGER NOT NULL DEFAULT 0,
    "unique_players" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "daily_stats_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE UNIQUE INDEX "users_username_key" ON "users"("username");

-- CreateIndex
CREATE UNIQUE INDEX "profiles_user_id_key" ON "profiles"("user_id");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_token_key" ON "sessions"("token");

-- CreateIndex
CREATE UNIQUE INDEX "daily_stats_date_key" ON "daily_stats"("date");

-- AddForeignKey
ALTER TABLE "profiles" ADD CONSTRAINT "profiles_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_game_id_fkey" FOREIGN KEY ("game_id") REFERENCES "games"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "game_sessions" ADD CONSTRAINT "game_sessions_profile_id_fkey" FOREIGN KEY ("profile_id") REFERENCES "profiles"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "transactions" ADD CONSTRAINT "transactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "card_flips" ADD CONSTRAINT "card_flips_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_sessions"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_game_session_id_fkey" FOREIGN KEY ("game_session_id") REFERENCES "game_sessions"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_prize_id_fkey" FOREIGN KEY ("prize_id") REFERENCES "prizes"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_prizes" ADD CONSTRAINT "user_prizes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Insertion des données de jeu correctes
INSERT INTO "games" (id, name, type, description, min_points, max_points, win_rate, is_active, created_at, updated_at)
VALUES 
  (gen_random_uuid(), 'Foods Cards', 'FOODS', 'Gagnez des kits alimentaires', 5, 100, 0.15, true, NOW(), NOW()),
  (gen_random_uuid(), 'Mode Cards', 'MODE', 'Remportez des vêtements tendance', 10, 200, 0.12, true, NOW(), NOW()),
  (gen_random_uuid(), 'Jackpot Cards', 'JACKPOT', 'Gagnez des lots exceptionnels', 50, 3800, 0.1, true, NOW(), NOW());
