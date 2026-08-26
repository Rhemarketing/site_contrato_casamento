-- A nullable unique key allows one open attempt per user/questionnaire while
-- retaining any number of completed attempts (MariaDB permits multiple NULLs).
ALTER TABLE `questionnaire_attempts`
  ADD COLUMN `open_attempt_key` VARCHAR(191) NULL;

CREATE UNIQUE INDEX `uq_attempts_open_attempt_key`
  ON `questionnaire_attempts`(`open_attempt_key`);
