-- CreateTable
CREATE TABLE `users` (
    `id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `password_hash` VARCHAR(255) NULL,
    `role` ENUM('USER', 'ADMIN') NOT NULL DEFAULT 'USER',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_users_email`(`email`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couples` (
    `id` CHAR(36) NOT NULL,
    `status` ENUM('PENDING', 'ACTIVE', 'INACTIVE') NOT NULL DEFAULT 'PENDING',
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couple_members` (
    `id` CHAR(36) NOT NULL,
    `couple_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `role` ENUM('CREATOR', 'PARTNER') NOT NULL,
    `joined_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_couple_members_user`(`user_id`),
    UNIQUE INDEX `uq_couple_members_couple_user`(`couple_id`, `user_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionnaires` (
    `id` CHAR(36) NOT NULL,
    `code` VARCHAR(100) NOT NULL,
    `name` VARCHAR(191) NOT NULL,
    `version` VARCHAR(20) NOT NULL,
    `is_active` BOOLEAN NOT NULL DEFAULT false,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_questionnaires_code_version`(`code`, `version`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questions` (
    `id` CHAR(36) NOT NULL,
    `questionnaire_id` CHAR(36) NOT NULL,
    `code` VARCHAR(20) NOT NULL,
    `sort_order` INTEGER NOT NULL,
    `stage` VARCHAR(80) NOT NULL,
    `area` VARCHAR(80) NOT NULL,
    `text` TEXT NOT NULL,
    `description` TEXT NULL,
    `is_scored` BOOLEAN NOT NULL DEFAULT true,
    `is_private` BOOLEAN NOT NULL DEFAULT false,
    `is_active` BOOLEAN NOT NULL DEFAULT true,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_questions_questionnaire_code`(`questionnaire_id`, `code`),
    UNIQUE INDEX `uq_questions_questionnaire_order`(`questionnaire_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `question_options` (
    `id` CHAR(36) NOT NULL,
    `question_id` CHAR(36) NOT NULL,
    `letter` CHAR(1) NOT NULL,
    `text` TEXT NOT NULL,
    `score` DECIMAL(8, 2) NULL,
    `internal_code` VARCHAR(100) NULL,
    `flag` VARCHAR(100) NULL,
    `sort_order` INTEGER NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_question_options_question_letter`(`question_id`, `letter`),
    UNIQUE INDEX `uq_question_options_question_order`(`question_id`, `sort_order`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `questionnaire_attempts` (
    `id` CHAR(36) NOT NULL,
    `questionnaire_id` CHAR(36) NOT NULL,
    `user_id` CHAR(36) NOT NULL,
    `couple_id` CHAR(36) NULL,
    `status` ENUM('STARTED', 'IN_PROGRESS', 'COMPLETED') NOT NULL DEFAULT 'STARTED',
    `started_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `completed_at` DATETIME(3) NULL,
    `total_score` DECIMAL(10, 2) NULL,
    `questionnaire_version` VARCHAR(20) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_attempts_user`(`user_id`),
    INDEX `idx_attempts_couple`(`couple_id`),
    INDEX `idx_attempts_questionnaire`(`questionnaire_id`),
    INDEX `idx_attempts_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `answers` (
    `id` CHAR(36) NOT NULL,
    `attempt_id` CHAR(36) NOT NULL,
    `question_id` CHAR(36) NOT NULL,
    `option_id` CHAR(36) NOT NULL,
    `score` DECIMAL(8, 2) NULL,
    `answered_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    INDEX `idx_answers_question`(`question_id`),
    INDEX `idx_answers_option`(`option_id`),
    UNIQUE INDEX `uq_answers_attempt_question`(`attempt_id`, `question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `area_results` (
    `id` CHAR(36) NOT NULL,
    `attempt_id` CHAR(36) NOT NULL,
    `area` VARCHAR(80) NOT NULL,
    `score` DECIMAL(10, 2) NOT NULL,
    `max_score` DECIMAL(10, 2) NOT NULL,
    `average_score` DECIMAL(8, 2) NOT NULL,
    `classification` VARCHAR(100) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_area_results_attempt_area`(`attempt_id`, `area`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `result_flags` (
    `id` CHAR(36) NOT NULL,
    `attempt_id` CHAR(36) NOT NULL,
    `question_id` CHAR(36) NULL,
    `code` VARCHAR(100) NOT NULL,
    `severity` VARCHAR(50) NOT NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),

    INDEX `idx_result_flags_attempt`(`attempt_id`),
    INDEX `idx_result_flags_code`(`code`),
    INDEX `idx_result_flags_question`(`question_id`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- CreateTable
CREATE TABLE `couple_invites` (
    `id` CHAR(36) NOT NULL,
    `couple_id` CHAR(36) NOT NULL,
    `created_by_user_id` CHAR(36) NOT NULL,
    `email` VARCHAR(191) NOT NULL,
    `token_hash` CHAR(64) NOT NULL,
    `status` ENUM('PENDING', 'ACCEPTED', 'EXPIRED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    `expires_at` DATETIME(3) NOT NULL,
    `accepted_at` DATETIME(3) NULL,
    `created_at` DATETIME(3) NOT NULL DEFAULT CURRENT_TIMESTAMP(3),
    `updated_at` DATETIME(3) NOT NULL,

    UNIQUE INDEX `uq_couple_invites_token_hash`(`token_hash`),
    INDEX `idx_couple_invites_email`(`email`),
    INDEX `idx_couple_invites_couple`(`couple_id`),
    INDEX `idx_couple_invites_creator`(`created_by_user_id`),
    INDEX `idx_couple_invites_expires_at`(`expires_at`),
    INDEX `idx_couple_invites_status`(`status`),
    PRIMARY KEY (`id`)
) DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- AddForeignKey
ALTER TABLE `couple_members` ADD CONSTRAINT `fk_couple_members_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couple_members` ADD CONSTRAINT `fk_couple_members_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questions` ADD CONSTRAINT `fk_questions_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `question_options` ADD CONSTRAINT `fk_question_options_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaire_attempts` ADD CONSTRAINT `fk_attempts_questionnaire` FOREIGN KEY (`questionnaire_id`) REFERENCES `questionnaires`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaire_attempts` ADD CONSTRAINT `fk_attempts_user` FOREIGN KEY (`user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `questionnaire_attempts` ADD CONSTRAINT `fk_attempts_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `fk_answers_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `questionnaire_attempts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `fk_answers_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `answers` ADD CONSTRAINT `fk_answers_option` FOREIGN KEY (`option_id`) REFERENCES `question_options`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `area_results` ADD CONSTRAINT `fk_area_results_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `questionnaire_attempts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_flags` ADD CONSTRAINT `fk_result_flags_attempt` FOREIGN KEY (`attempt_id`) REFERENCES `questionnaire_attempts`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `result_flags` ADD CONSTRAINT `fk_result_flags_question` FOREIGN KEY (`question_id`) REFERENCES `questions`(`id`) ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couple_invites` ADD CONSTRAINT `fk_couple_invites_couple` FOREIGN KEY (`couple_id`) REFERENCES `couples`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE `couple_invites` ADD CONSTRAINT `fk_couple_invites_creator` FOREIGN KEY (`created_by_user_id`) REFERENCES `users`(`id`) ON DELETE RESTRICT ON UPDATE CASCADE;
