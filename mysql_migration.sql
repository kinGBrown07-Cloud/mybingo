-- Creation des tables
CREATE TABLE `users` (
  `id` VARCHAR(191) NOT NULL,
  `email` VARCHAR(191) NOT NULL,
  `emailVerified` DATETIME(3) NULL,
  `username` VARCHAR(191) NULL,
  `hashedPassword` VARCHAR(191) NOT NULL,
  `firstName` VARCHAR(191) NULL,
  `lastName` VARCHAR(191) NULL,
  `name` VARCHAR(191) NULL,
  `phoneNumber` VARCHAR(191) NULL,
  `country` VARCHAR(191) NULL,
  `region` ENUM('BLACK_AFRICA', 'NORTH_AFRICA', 'EUROPE', 'AMERICAS', 'ASIA') NOT NULL DEFAULT 'BLACK_AFRICA',
  `currency` VARCHAR(191) NOT NULL DEFAULT 'XOF',
  `points` INT NOT NULL DEFAULT 0,
  `pointsRate` FLOAT NOT NULL DEFAULT 300,
  `role` ENUM('USER', 'ADMIN', 'MODERATOR') NOT NULL DEFAULT 'USER',
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `image` VARCHAR(191) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `users_email_key`(`email`),
  UNIQUE INDEX `users_username_key`(`username`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `accounts` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` VARCHAR(191) NOT NULL,
  `provider` VARCHAR(191) NOT NULL,
  `providerAccountId` VARCHAR(191) NOT NULL,
  `refreshToken` TEXT NULL,
  `accessToken` TEXT NULL,
  `expiresAt` INT NULL,
  `tokenType` VARCHAR(191) NULL,
  `scope` VARCHAR(191) NULL,
  `idToken` TEXT NULL,
  `sessionState` VARCHAR(191) NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `accounts_provider_providerAccountId_key`(`provider`, `providerAccountId`),
  INDEX `accounts_userId_fkey`(`userId`),
  CONSTRAINT `accounts_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `sessions` (
  `id` VARCHAR(191) NOT NULL,
  `sessionToken` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `expires` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  UNIQUE INDEX `sessions_sessionToken_key`(`sessionToken`),
  INDEX `sessions_userId_fkey`(`userId`),
  CONSTRAINT `sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `games` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(191) NOT NULL,
  `type` ENUM('CLASSIC', 'MAGIC', 'GOLD') NOT NULL DEFAULT 'CLASSIC',
  `description` VARCHAR(191) NULL DEFAULT '',
  `imageUrl` VARCHAR(191) NULL DEFAULT '',
  `minPoints` INT NOT NULL DEFAULT 1,
  `maxPoints` INT NOT NULL DEFAULT 10,
  `isActive` BOOLEAN NOT NULL DEFAULT true,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Insertion des jeux par défaut
INSERT INTO `games` (`name`, `type`, `description`, `minPoints`, `maxPoints`) VALUES
('Classic Bingoo', 'CLASSIC', 'Jeu classique avec 9 cartes', 0, 100),
('Magic Bingoo', 'MAGIC', 'Version magique avec 12 cartes', 50, 200),
('Gold Bingoo', 'GOLD', 'Version premium avec 16 cartes', 100, 500);
