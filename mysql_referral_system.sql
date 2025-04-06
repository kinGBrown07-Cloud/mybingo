-- Tables pour le système de parrainage
ALTER TABLE `users` 
ADD COLUMN `affiliate_code` VARCHAR(8) NULL,
ADD COLUMN `referred_by` VARCHAR(191) NULL,
ADD COLUMN `affiliate_earnings` INT NOT NULL DEFAULT 0,
ADD UNIQUE INDEX `users_affiliate_code_key`(`affiliate_code`),
ADD INDEX `users_referred_by_fkey`(`referred_by`),
ADD CONSTRAINT `users_referred_by_fkey` FOREIGN KEY (`referred_by`) REFERENCES `users`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE `affiliate_earnings` (
  `id` VARCHAR(191) NOT NULL,
  `referrer_id` VARCHAR(191) NOT NULL,
  `referred_id` VARCHAR(191) NOT NULL,
  `amount` INT NOT NULL,
  `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

  PRIMARY KEY (`id`),
  UNIQUE INDEX `unique_referral`(`referrer_id`, `referred_id`),
  INDEX `affiliate_earnings_referrer_id_fkey`(`referrer_id`),
  INDEX `affiliate_earnings_referred_id_fkey`(`referred_id`),
  CONSTRAINT `affiliate_earnings_referrer_id_fkey` FOREIGN KEY (`referrer_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT `affiliate_earnings_referred_id_fkey` FOREIGN KEY (`referred_id`) REFERENCES `users`(`id`) ON DELETE CASCADE ON UPDATE CASCADE
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Ajout d'un type de transaction pour les récompenses de parrainage
ALTER TABLE `transactions` 
MODIFY COLUMN `type` ENUM('DEPOSIT', 'WITHDRAWAL', 'BET', 'WIN', 'REFUND', 'AFFILIATE_EARNING') NOT NULL;
