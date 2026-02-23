-- Migration: create sessions table for persistent sessions and refresh tokens

CREATE TABLE IF NOT EXISTS `sessions` (
  `id` INT NOT NULL AUTO_INCREMENT,
  `session_id` VARCHAR(128) NOT NULL UNIQUE,
  `user_id` INT NOT NULL,
  `user_agent` VARCHAR(500) DEFAULT NULL,
  `ip_address` VARCHAR(45) DEFAULT NULL,
  `expires_at` DATETIME NOT NULL,
  `valid` TINYINT(1) NOT NULL DEFAULT 1,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  INDEX `idx_user` (`user_id`),
  INDEX `idx_session` (`session_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;

-- Example inserts (optional): replace values with real session ids when creating sessions
-- INSERT INTO `sessions` (`session_id`, `user_id`, `user_agent`, `ip_address`, `expires_at`, `valid`) VALUES
-- ('7bfd18db586bab45561d2a3566df1ddfdb5a4bb3ca5f3faba78314845c10d7c4', 25, 'Example UA', '::1', '2026-03-08 00:00:00', 1);

COMMIT;
