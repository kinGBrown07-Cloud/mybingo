-- Tables pour le système de jeu
CREATE TABLE `game_sessions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `gameId` INT NOT NULL,
  `type` ENUM('CLASSIC', 'MAGIC', 'GOLD') NOT NULL,
  `betAmount` DECIMAL(10, 2) NOT NULL,
  `hasWon` BOOLEAN NULL,
  `prize` DECIMAL(10, 2) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `completedAt` DATETIME(3) NULL,

  PRIMARY KEY (`id`),
  INDEX `game_sessions_userId_fkey`(`userId`),
  INDEX `game_sessions_gameId_fkey`(`gameId`),
  CONSTRAINT `game_sessions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `game_sessions_gameId_fkey` FOREIGN KEY (`gameId`) REFERENCES `games`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `card_flips` (
  `id` VARCHAR(191) NOT NULL,
  `sessionId` VARCHAR(191) NOT NULL,
  `cardPosition` INT NOT NULL,
  `isWinning` BOOLEAN NOT NULL DEFAULT false,
  `prize` DECIMAL(10, 2) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  INDEX `card_flips_sessionId_fkey`(`sessionId`),
  CONSTRAINT `card_flips_sessionId_fkey` FOREIGN KEY (`sessionId`) REFERENCES `game_sessions`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE TABLE `transactions` (
  `id` VARCHAR(191) NOT NULL,
  `userId` VARCHAR(191) NOT NULL,
  `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'REFUND') NOT NULL,
  `amount` DECIMAL(10, 2) NOT NULL,
  `status` ENUM('PENDING', 'COMPLETED', 'FAILED') NOT NULL DEFAULT 'PENDING',
  `gameSessionId` VARCHAR(191) NULL,
  `description` VARCHAR(255) NULL,
  `createdAt` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
  `updatedAt` DATETIME(3) NOT NULL,

  PRIMARY KEY (`id`),
  INDEX `transactions_userId_fkey`(`userId`),
  INDEX `transactions_gameSessionId_fkey`(`gameSessionId`),
  CONSTRAINT `transactions_userId_fkey` FOREIGN KEY (`userId`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `transactions_gameSessionId_fkey` FOREIGN KEY (`gameSessionId`) REFERENCES `game_sessions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
